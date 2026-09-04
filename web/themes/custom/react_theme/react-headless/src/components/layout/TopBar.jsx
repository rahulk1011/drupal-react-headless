import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "../../css/index.css";
import { useTranslation } from "react-i18next";
import { getLanguages } from "../../api/client";

export default function TopBar() {
  const { user, logout } = useAuth() || {};
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { i18n, t } = useTranslation();
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await getLanguages();
        setLanguages(response.data.result);
      } catch (error) {
        console.error("Failed to fetch languages:", error);
      }
    };
    fetchLanguages();
  }, []);

  const displayName =
    [user?.firstname, user?.lastname].filter(Boolean).join(" ") ||
    user?.name ||
    "User";

  const getInitials = () => {
    if (user?.firstname || user?.lastname) {
      const firstInitial = user?.firstname ? user.firstname.charAt(0) : "";
      const lastInitial = user?.lastname ? user.lastname.charAt(0) : "";
      return `${firstInitial}${lastInitial}`.toUpperCase() || "U";
    }
    const parts = displayName.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return displayName.charAt(0).toUpperCase() || "U";
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setDropdownOpen(false);
    try {
      setIsLoggingOut(true);
      if (typeof logout === "function") await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem("langcode", lang);
  };

  // Close the dropdown when the user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Also close on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  return (
    <header className="app-topbar">
      <div className="app-topbar__inner">
        <Link to="/" className="app-topbar__brand">
          🗂 Drupal React CMS
        </Link>

        <div className="app-topbar__actions">
          <nav className="app-topbar__nav">
            {user ? (
              /* Avatar dropdown — the only visible element for logged-in users.
               Dashboard + Logout both live inside the dropdown menu. */
              <div className="avatar-menu" ref={dropdownRef}>
                <button
                  className={`app-topbar__avatar${dropdownOpen ? " app-topbar__avatar--open" : ""}`}
                  title={displayName}
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                  onClick={() => setDropdownOpen((prev) => !prev)}
                >
                  {getInitials()}
                </button>

                {dropdownOpen && (
                  <div className="avatar-dropdown" role="menu">
                    {/* Identity row */}
                    <div className="avatar-dropdown__header">
                      <span className="avatar-dropdown__name">
                        {displayName}
                      </span>
                      <span className="avatar-dropdown__role">
                        {user?.role || "User"}
                      </span>
                    </div>

                    <div className="avatar-dropdown__divider" />

                    {/* Dashboard link — shown on all pages so it's always reachable */}
                    <Link
                      to="/dashboard"
                      className="avatar-dropdown__item"
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                      Dashboard
                    </Link>

                    <div className="avatar-dropdown__divider" />

                    {/* Logout */}
                    <button
                      className="avatar-dropdown__item avatar-dropdown__item--danger"
                      role="menuitem"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      {isLoggingOut
                        ? t("authentication.loggingOut")
                        : t("authentication.logOut")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-login-topbar">
                {t("authentication.login")}
              </Link>
            )}
          </nav>

          <select
            className="language-switcher"
            value={i18n.language}
            onChange={handleLanguageChange}
          >
            {languages.map((lang) => (
              <option key={lang.langcode} value={lang.langcode}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
