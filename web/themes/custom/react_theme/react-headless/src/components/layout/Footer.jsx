import React from "react";
import { Link } from "react-router-dom";
import "../../css/index.css";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="app-footer__inner">
        <div className="app-footer__brand">
          <span className="app-footer__logo">🗂</span>
          <span className="app-footer__name">Drupal React CMS</span>
          <p className="app-footer__tagline">
            {t("footer.description")}
          </p>
        </div>

        <div className="app-footer__links">
          <div className="app-footer__col">
            <h4>{t("navigation.navigation")}</h4>
            <ul>
              <li>
                <Link to="/"> {t("navigation.home")} </Link>
              </li>
              <li>
                <Link to="/dashboard"> {t("navigation.dashboard")} </Link>
              </li>
            </ul>
          </div>
          <div className="app-footer__col">
            <h4>{t("account")}</h4>
            <ul>
              <li>
                <Link to="/login"> {t("authentication.login")} </Link>
              </li>
              <li>
                <Link to="/register"> {t("navigation.register")} </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="app-footer__bottom">
        <p>
          &copy; {year} Rahul Khan. {t("footer.builtWith")}{" "}
          <a href="https://www.drupal.org" target="_blank" rel="noreferrer">
            Drupal
          </a>{" "}
          &amp;{" "}
          <a href="https://react.dev" target="_blank" rel="noreferrer">
            React
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
