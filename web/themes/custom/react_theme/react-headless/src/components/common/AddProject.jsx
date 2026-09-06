import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addProject, getUsers } from "../../api/client";
import "../../css/index.css";
import { useTranslation } from "react-i18next";

export default function AddProject() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  useEffect(() => {
    getUsers()
      .then((response) => {
        setUsers(response.data?.result || []);
      })
      .catch((err) => {
        console.error("Failed to load users:", err);
        setUsersError("Couldn't load the list of users.");
      })
      .finally(() => setUsersLoading(false));
  }, []);

  // Filter users to include only those with the 'manager' role (case-insensitive check)
  const engineerUsers = users.filter(
    (u) => u.role && u.role.toLowerCase() === "manager",
  );

  // Filter users to include only those with the 'client' role (case-insensitive check)
  const clientUsers = users.filter(
    (u) => u.role && u.role.toLowerCase() === "client",
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addProject(formData);
      navigate("/projects");
    } catch (err) {
      console.error("Failed to add new project:", err);
      alert("Failed to add project. Please check network or authentication.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-card-wrapper">
      <div className="form-card">
        <div className="form-header">
          <div>
            <h2 className="form-title">Add New Project</h2>
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
            <span aria-hidden="true">&larr;</span> Back to Projects
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          {/* Project Name */}
          <div className="form-group">
            <label htmlFor="projectName">
              Project Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="projectName"
              name="projectName"
              value={formData.projectName}
              onChange={handleInputChange}
              required
              placeholder="Enter Project Name"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-row">
            {/* Project Code */}
            <div className="form-group">
              <label htmlFor="projectCode">
                Project Code <span className="required">*</span>
              </label>
              <input
                type="text"
                id="projectCode"
                name="projectCode"
                value={formData.projectCode}
                onChange={handleInputChange}
                required
                placeholder="Enter Project Code"
                disabled={isSubmitting}
              />
            </div>

            {/* Project Manager */}
            <div className="form-group">
              <label htmlFor="projectManager">
                Project Manager <span className="required">*</span>
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
                  {usersLoading ? t("loadingUsers") : t("task.selectUser")}
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

          {/* Description */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="description">
                Project Description <span className="required">*</span>
              </label>
            </div>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              required
              placeholder="Enter detailed project description"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group form-group-inline">
            {/* Start Date */}
            <div>
              <label htmlFor="startDate">
                Start Date <span className="required">*</span>
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

            {/* End Date */}
            <div>
              <label htmlFor="endDate">
                End Date <span className="required">*</span>
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Client Name */}
          <div className="form-group">
            <label htmlFor="clientName">
              Client Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="clientName"
              name="clientName"
              value={formData.clientName}
              onChange={handleInputChange}
              required
              placeholder="Enter Client Name"
              disabled={isSubmitting}
            />
          </div>

          {/* Client Representative Manager */}
          <div className="form-group">
            <label htmlFor="clientManager">
              Client Manager <span className="required">*</span>
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
                {usersLoading ? t("loadingUsers") : t("task.selectUser")}
              </option>
              {clientUsers.map((u) => (
                <option key={u.uid} value={u.uid}>
                  {u.fullname || u.name}
                </option>
              ))}
            </select>
            {usersError && <p className="field-error">{usersError}</p>}
          </div>

          {/* Client Address */}
          <div className="form-group">
            <label htmlFor="clientAddress">
              Client Address <span className="required">*</span>
            </label>
            <input
              type="text"
              id="clientAddress"
              name="clientAddress"
              value={formData.clientAddress}
              onChange={handleInputChange}
              required
              placeholder="Enter Client Address"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group form-group-inline">
            {/* Client City */}
            <div>
              <label htmlFor="clientCity">
                Client City <span className="required">*</span>
              </label>
              <input
                type="text"
                id="clientCity"
                name="clientCity"
                value={formData.clientCity}
                onChange={handleInputChange}
                required
                placeholder="Enter Client City"
                disabled={isSubmitting}
              />
            </div>

            {/* Client Country */}
            <div>
              <label htmlFor="clientCountry">
                Client Country <span className="required">*</span>
              </label>
              <input
                type="text"
                id="clientCountry"
                name="clientCountry"
                value={formData.clientCountry}
                onChange={handleInputChange}
                required
                placeholder="Enter Client Country"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Budget */}
          <div className="form-group">
            <label htmlFor="clientBudget">
              Client Budget <span className="required">*</span>
            </label>
            <input
              type="number"
              id="clientBudget"
              name="clientBudget"
              value={formData.clientBudget}
              onChange={handleInputChange}
              required
              placeholder="Enter Client Budget"
              disabled={isSubmitting}
            />
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? t("saving") : "Add Project"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/projects")}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
