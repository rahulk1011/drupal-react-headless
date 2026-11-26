import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./css/index.css";
import App from "./App.js";
import i18n from "./utils/i18n";
import { I18nextProvider } from "react-i18next";
import { setFavicon } from "./utils/brand";

setFavicon();

createRoot(document.getElementById("react-root")!).render(
  <StrictMode>
		<I18nextProvider i18n={i18n}>
    	<App />
		</I18nextProvider>
  </StrictMode>,
);
