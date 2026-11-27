import drupalReactIcon from "../../../drupalreacticon.png";

/**
 * Site logo served by Drupal from the theme root. Used in the maintenance page and as the favicon.
 */
export const LOGO_URL = drupalReactIcon;

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
