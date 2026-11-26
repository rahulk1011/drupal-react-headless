import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  getBackendStatus,
  subscribeBackendStatus,
} from "../api/backendStatus";
import { checkBackendHealth } from "../api/client";

/** How often to re-probe the backend while it is down. */
const RETRY_INTERVAL_MS = 30000;

const BackendStatusContext = createContext(null);

/**
 * Tracks whether Drupal is reachable and exposes it to the UI.
 * While the backend is down, it polls /api/health in the background until it recovers.
 */
export function BackendStatusProvider({ children }) {
  const [status, setStatus] = useState(getBackendStatus());
  const timerRef = useRef(null);

  // Mirror the store into React state.
  useEffect(() => subscribeBackendStatus(setStatus), []);

  // Poll while down; stop as soon as the store reports "ok".
  useEffect(() => {
    const isDown = status.state === "maintenance" || status.state === "unreachable";
    if (!isDown) {
      clearInterval(timerRef.current);
      return undefined;
    }
    timerRef.current = setInterval(() => {
      checkBackendHealth();
    }, RETRY_INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [status.state]);

  const value = {
    state: status.state,
    message: status.message,
    isDown: status.state === "maintenance" || status.state === "unreachable",
  };

  return (
    <BackendStatusContext.Provider value={value}>
      {children}
    </BackendStatusContext.Provider>
  );
}

/** @returns {{state: string, message: string, isDown: boolean}} */
export function useBackendStatus() {
  const context = useContext(BackendStatusContext);
  if (context === null) {
    throw new Error("useBackendStatus must be used within a BackendStatusProvider.");
  }
  return context;
}
