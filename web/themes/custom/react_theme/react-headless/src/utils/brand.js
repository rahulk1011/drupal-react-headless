import { getBaseUrl } from "../api/client";

/**
 * Site logo served by Drupal from the theme root, so the image is shipped once
 * (not copied into the Vite build output). Resolved against the same base URL
 * the API uses: the Drupal origin when embedded, VITE_DRUPAL_API_URL standalone.
 */
export const LOGO_URL = `${getBaseUrl()}/themes/custom/react_theme/drupalreacticon.png`;

/**
 * Points the page favicon at the site logo. Set at runtime because the logo
 * URL depends on the Drupal base URL, which index.html cannot know.
 */
export function setFavicon() {
  let link = document.querySelector("link[rel='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.type = "image/png";
  link.href = LOGO_URL;
}
