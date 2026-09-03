import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/client";
import "../css/register.css";
import { useTranslation } from "react-i18next";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // User Type Security Codes (Updated to 4 digits to match validation logic)
  const USER_TYPE_CODES = {
    administrator: "1011",
		manager: "1401",
    client: "6498",
    engineer: "4965",
  };

  // Form State
  const [formData, setFormData] = useState({
    usertype: "",
    securityCode: "",
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });

  // UI State
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Client-side Validation
  const validateForm = () => {
    const {
      usertype,
      securityCode,
      firstname,
      lastname,
      email,
      password,
    } = formData;

    if (
      !usertype ||
      !securityCode ||
      !firstname ||
      !lastname ||
      !email ||
      !password
    ) {
      setError("All fields are required.");
      return false;
    }

    // Validate 4-digit code
    if (!/^\d{4}$/.test(securityCode)) {
      setError("Security code must be a 4-digit number.");
      return false;
    }

    // Validate code against selected user type
    if (USER_TYPE_CODES[usertype] !== securityCode) {
      setError("Invalid security code for selected user type.");
      return false;
    }

    // Password strength validation
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordPattern.test(password)) {
      setError(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number."
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await registerUser(formData);
      if (response.data?.status === "Success") {
        setSuccess("Account created successfully! Redirecting to login...");

				// Clear all form inputs
        setFormData({
          usertype: "",
          securityCode: "",
          firstname: "",
          lastname: "",
          email: "",
          password: "",
        });

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(response.data?.result || "Registration failed.");
      }
    } catch (err) {
      console.error("Registration Error:", err);
      const apiMessage = err.response?.data?.result || err.response?.data?.message;
      setError(apiMessage || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-card">
        <h1>{t("authentication.createAccount")}</h1>
        <p>{t("authentication.registerDescription")}</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {/* User Type */}
          <div className="form-group">
            <label className="form-label" htmlFor="usertype">
              User Type
            </label>

            <select
              id="usertype"
              name="usertype"
              className="form-input"
              value={formData.usertype}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Select User Type</option>
              <option value="administrator">Administrator</option>
							<option value="manager">Manager</option>
              <option value="client">Client</option>
              <option value="engineer">Engineer</option>
            </select>
          </div>

          {/* Security Code */}
          {formData.usertype && (
            <div className="form-group">
              <label className="form-label" htmlFor="securityCode">
                Security Code
              </label>

              <input
                id="securityCode"
                name="securityCode"
                type="password"
                className="form-input"
                value={formData.securityCode}
                onChange={handleChange}
                maxLength={4}
                placeholder="Enter 4 digit security code"
                disabled={loading}
              />

              <small className="form-hint">
                Enter the security code assigned for the selected user type.
              </small>
            </div>
          )}

          {/* First Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="firstname">
              {t("common.firstName")}
            </label>
            <input
              id="firstname"
              name="firstname"
              type="text"
              className="form-input"
              value={formData.firstname}
              onChange={handleChange}
              autoFocus
              disabled={loading}
            />
          </div>

          {/* Last Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="lastname">
              {t("common.lastName")}
            </label>
            <input
              id="lastname"
              name="lastname"
              type="text"
              className="form-input"
              value={formData.lastname}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              {t("common.emailAddress")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              {t("common.password")}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              disabled={loading}
            />
            <small className="form-hint">
              {t("authentication.passwordRequirement")}
            </small>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-register"
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : t("authentication.register")}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <span>{t("authentication.alreadyHaveAccount")}</span>
          <Link to="/login" className="auth-link">
            {t("authentication.login")}
          </Link>
        </div>
      </div>
    </div>
  );
}
