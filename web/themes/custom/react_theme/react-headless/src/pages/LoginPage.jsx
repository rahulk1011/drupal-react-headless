import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../css/index.css";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
	const { t } = useTranslation();
	
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !pass) {
      setError("Email and Password are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(name, pass);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1>{t("authentication.login")}</h1>
        <p>{t("authentication.loginDescription")}</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-user">
              {t("common.email")}
            </label>
            <input
              id="login-user"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-pass">
              {t("common.password")}
            </label>
            <input
              id="login-pass"
              type="password"
              className="form-input"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn-login btn-sign-in"
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : t("authentication.login")}
          </button>
        </form>

        {/* --- Registration Section --- */}
        <div className="auth-divider">
          <span>{t("authentication.dontHaveAccount")}</span>
        </div>

        <button
          type="button"
          className="btn-login btn-login-register"
          onClick={() => navigate("/register")}
        >
          {t("authentication.createNewAccount")}
        </button>
      </div>
    </div>
  );
}
