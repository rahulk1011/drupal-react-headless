import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { addProject, getUsers } from "../../api/client";
import "../../css/index.css";
import { useTranslation } from "react-i18next";

export default function AddProject() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    projectName: "",
    projectCode: "",
    projectManager: "",
    description: "",
    startDate: "",
    endDate: "",
    clientName: "",
    clientManager: "",
    clientAddress: "",
    clientCity: "",
    clientCountry: "",
    clientBudget: "",
  });

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);

  // Safe data fetching with cleanup
  useEffect(() => {
    let isMounted = true;

    getUsers()
      .then((response) => {
        if (isMounted) {
          setUsers(response.data?.result || []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to load users:", err);
          setUsersError(t("errors.failedToLoadUsers", "Couldn't load the list of users."));
        }
      })
      .finally(() => {
        if (isMounted) {
          setUsersLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [t]);

  // Memoize filtered roles to avoid recalculating on every re-render
  const engineerUsers = useMemo(
    () => users.filter((u) => u.role?.toLowerCase() === "manager"),
    [users]
  );

  const clientUsers = useMemo(
    () => users.filter((u) => u.role?.toLowerCase() === "client"),
    [users]
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      alert(t("errors.invalidDateRange", "End date cannot be earlier than start date."));
      return;
    }
    setCurrentStep(2);
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addProject(formData);
      navigate("/projects");
    } catch (err) {
      console.error("Failed to add new project:", err);
      alert(t("errors.addProjectFailed", "Failed to add project. Please check network or authentication."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-card-wrapper">
      <div className="form-card wizard-card">
        <div className="form-header">
          <div>
            <h2 className="form-title">{t("project.addProjectTitle")}</h2>
            <p className="form-subtitle">
              <span className="required">*</span> {t("common.requiredFields")}
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary btn-back"
            onClick={() => navigate("/projects")}
            disabled={isSubmitting}
          >
            <span aria-hidden="true">&larr;</span> {t("project.backToProjects")}
          </button>
        </div>

        {/* Accessible Stepper Bar */}
        <div className="stepper-bar" role="tablist" aria-label="Form Wizard Steps">
          <button
            type="button"
            className={`step-item ${currentStep === 1 ? "active" : "completed"}`}
            onClick={() => setCurrentStep(1)}
            role="tab"
            aria-selected={currentStep === 1}
            disabled={isSubmitting}
          >
            <div className="step-badge">1</div>
            <div className="step-label-group">
              <span className="step-number">{t("project.step1")}</span>
              <span className="step-title">{t("project.projectDetailsTab")}</span>
            </div>
          </button>

          <div className="step-connector" />

          <button
            type="button"
            className={`step-item ${currentStep === 2 ? "active" : ""}`}
            onClick={() => currentStep === 1 && handleNextStep}
            role="tab"
            aria-selected={currentStep === 2}
            disabled={currentStep === 1 || isSubmitting}
          >
            <div className="step-badge">2</div>
            <div className="step-label-group">
              <span className="step-number">{t("project.step2")}</span>
              <span className="step-title">{t("project.clientDetailsTab")}</span>
            </div>
          </button>
        </div>

        {/* Step 1: Project Details */}
        {currentStep === 1 && (
          <form onSubmit={handleNextStep} className="task-form step-content">
            <h3 className="section-title">{t("project.step1")}: {t("project.projectDetailsTab")}</h3>

            <div className="form-group">
              <label htmlFor="projectName">
                {t("project.projectName")} <span className="required">*</span>
              </label>
              <input
                type="text"
                id="projectName"
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
                required
                placeholder={t("project.projectNamePlaceholder")}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group form-group-inline">
              <div>
                <label htmlFor="projectCode">
                  {t("project.projectCode")} <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="projectCode"
                  name="projectCode"
                  value={formData.projectCode}
                  onChange={handleInputChange}
                  required
                  placeholder={t("project.projectCodePlaceholder")}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="projectManager">
                  {t("project.projectManager")} <span className="required">*</span>
                </label>
                <select
                  id="projectManager"
                  name="projectManager"
                  value={formData.projectManager}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting || usersLoading || !!usersError}
                >
                  <option value="" disabled>
                    {usersLoading ? t("common.loadingUsers") : t("task.selectUser")}
                  </option>
                  {engineerUsers.map((u) => (
                    <option key={u.uid} value={u.uid}>
                      {u.fullname || u.name}
                    </option>
                  ))}
                </select>
                {usersError && <p className="field-error">{usersError}</p>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">
                {t("project.projectDescription")} <span className="required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                required
                placeholder={t("project.projectDescriptionPlaceholder")}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group form-group-inline">
              <div>
                <label htmlFor="startDate">
                  {t("project.projectStartDate")} <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="endDate">
                  {t("project.projectEndDate")} <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  min={formData.startDate || undefined}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate("/projects")}
                disabled={isSubmitting}
              >
                {t("common.cancel")}
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {t("common.next")} &rarr;
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Client Details */}
        {currentStep === 2 && (
          <form onSubmit={handleSubmit} className="task-form step-content">
            <h3 className="section-title">{t("project.step2")}: {t("project.clientDetailsTab")}</h3>

            <div className="form-group">
              <div className="form-group">
                <label htmlFor="clientName">
                  {t("project.clientName")} <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  required
                  placeholder={t("project.clientNamePlaceholder")}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="clientAddress">
                {t("project.clientAddress")} <span className="required">*</span>
              </label>
              <input
                type="text"
                id="clientAddress"
                name="clientAddress"
                value={formData.clientAddress}
                onChange={handleInputChange}
                required
                placeholder={t("project.clientAddressPlaceholder")}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group form-group-inline">
              <div>
                <label htmlFor="clientCity">
                  {t("project.clientCity")} <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="clientCity"
                  name="clientCity"
                  value={formData.clientCity}
                  onChange={handleInputChange}
                  required
                  placeholder={t("project.clientCityPlaceholder")}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="clientCountry">
                  {t("project.clientCountry")} <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="clientCountry"
                  name="clientCountry"
                  value={formData.clientCountry}
                  onChange={handleInputChange}
                  required
                  placeholder={t("project.clientCountryPlaceholder")}
                  disabled={isSubmitting}
                />
              </div>
            </div>

						<div className="form-group form-group-inline">
							<div>
                <label htmlFor="clientManager">
                  {t("project.clientManager")} <span className="required">*</span>
                </label>
                <select
                  id="clientManager"
                  name="clientManager"
                  value={formData.clientManager}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting || usersLoading || !!usersError}
                >
                  <option value="" disabled>
                    {usersLoading ? t("common.loadingUsers", "Loading...") : t("task.selectUser")}
                  </option>
                  {clientUsers.map((u) => (
                    <option key={u.uid} value={u.uid}>
                      {u.fullname || u.name}
                    </option>
                  ))}
                </select>
                {usersError && <p className="field-error">{usersError}</p>}
              </div>

							<div>
								<label htmlFor="clientBudget">
									{t("project.clientBudget")} <span className="required">*</span>
								</label>
								<input
									type="number"
									id="clientBudget"
									name="clientBudget"
									value={formData.clientBudget}
									onChange={handleInputChange}
									min="0"
									step="any"
									required
									placeholder={t("project.clientBudgetPlaceholder")}
									disabled={isSubmitting}
								/>
							</div>
						</div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handlePrevStep}
                disabled={isSubmitting}
              >
                &larr; {t("common.back", "Back")}
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? t("common.saving") : t("project.addProjectButton")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
