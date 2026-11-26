// Tiny observable store describing whether the Drupal backend is reachable.
// Kept separate from client.js and the React provider so that the axios layer
// can report status without importing React code (avoids circular imports).

/** @typedef {"ok" | "maintenance" | "unreachable" | "unknown"} BackendState */

/** @type {{ state: BackendState, message: string, lastChecked: number|null }} */
let current = { state: "unknown", message: "", lastChecked: null };
const listeners = new Set();

export function getBackendStatus() {
  return current;
}

/**
 * @param {BackendState} state
 * @param {string} [message]
 */
export function setBackendStatus(state, message = "") {
  // Avoid re-rendering subscribers when nothing actually changed.
  if (current.state === state && current.message === message) {
    current = { ...current, lastChecked: Date.now() };
    return;
  }
  current = { state, message, lastChecked: Date.now() };
  listeners.forEach((listener) => listener(current));
}

/** @param {(status: typeof current) => void} listener */
export function subscribeBackendStatus(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
