import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addTask, getUsers, getClientList, getProjectDetails } from "../../api/client";
import "../../css/index.css";
import { useTranslation } from "react-i18next";

export default function CreateTask() {
	const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    severity: "low",
    status: "open",
    assigned_to: "",
		project_name: "",
  });

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);
	const [projects, setProjects ] = useState([]);
	const [projectsLoading, setProjectsLoading] = useState(true);
	const [projectsError, setProjectsError ] = useState(null);

  useEffect(() => {
    getUsers()
      .then((response) => {
        setUsers(response.data?.result || []);
      })
      .catch((err) => {
        console.error("Failed to load users:", err);
        setUsersError("Couldn't load the list of users to assign this task to.");
      })
      .finally(() => setUsersLoading(false));
  }, []);

	// Filter users to include only those with the 'engineer' role (case-insensitive check)
  const engineerUsers = users.filter(
    (u) => u.role && u.role.toLowerCase() === "engineer",
  );

	useEffect(() => {
		getClientList()
			.then((response) => {
				setProjects(response.data?.result || []);
			})
			.catch((err) => {
				console.error("Failed to load projects:", err);
        setProjectsError("Couldn't load the list of projects to assign this task to.");
			})
			.finally(() => setProjectsLoading(false));
	}, []);

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
      await addTask(formData);
      navigate("/tasks");
    } catch (err) {
      console.error("Failed to create task:", err);
      alert("Failed to save task. Please check network or authentication.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-task-container">
      <div className="create-task-card">
        <div className="create-task-header">
          <div>
            <h2>{t("task.createTask")}</h2>
            <p className="create-task-subtitle">
              <span className="required">*</span> {t("common.requiredFields")}
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary btn-back"
            onClick={() => navigate("/tasks")}
            disabled={isSubmitting}
          >
            <span aria-hidden="true">&larr;</span> {t("common.backToTasks")}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">
              {t("task.title")} <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder={t("task.enterTitle")}
              disabled={isSubmitting}
            />
          </div>

					{/* Project Name */}
          <div className="form-group">
            <label htmlFor="project_name">
              Project Name <span className="required">*</span>
            </label>
            <select
              id="project_name"
              name="project_name"
              value={formData.project_name}
              onChange={handleInputChange}
              required
              disabled={isSubmitting || projectsLoading || !!projectsError}
            >
              <option value="" disabled>
                {projectsLoading ? 'Loading Projects' : 'Select Project'}
              </option>
              {projects.map((p) => (
                <option key={p.project_id} value={p.project_id}>
                  {p.project_name}
                </option>
              ))}
            </select>
            {projectsError && <p className="field-error">{projectsError}</p>}
          </div>

          {/* Assign To */}
          <div className="form-group">
            <label htmlFor="assigned_to">
              {t("task.assignTo")} <span className="required">*</span>
            </label>
            <select
              id="assigned_to"
              name="assigned_to"
              value={formData.assigned_to}
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

          {/* Description */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="description">
                {t("task.description")} <span className="required">*</span>
              </label>
              <span className="char-count">
                {formData.description.length} characters
              </span>
            </div>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              required
              placeholder={t("task.enterDescription")}
              disabled={isSubmitting}
            />
          </div>

          {/* Due Date / Severity / Status - grouped together since they're
              all short, single-value fields that together describe the
              task's schedule and priority. */}
          <div className="form-group form-row--3col">
            <div>
              <label htmlFor="due_date">
                {t("task.dueDate")} <span className="required">*</span>
              </label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                value={formData.due_date}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="severity">
                {t("common.severity")} <span className="required">*</span>
              </label>
              <select
                id="severity"
                name="severity"
                value={formData.severity}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              >
                <option value="low">{t("severity.low")}</option>
                <option value="medium">{t("severity.medium")}</option>
                <option value="high">{t("severity.high")}</option>
                <option value="critical">{t("severity.critical")}</option>
              </select>
            </div>

            <div>
              <label htmlFor="status">
                {t("common.status")} <span className="required">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              >
                <option value="open">{t("status.open")}</option>
                <option value="in_progress">{t("status.inProgress")}</option>
                <option value="completed">{t("status.completed")}</option>
                <option value="cancelled">{t("status.cancelled")}</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
						<button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? t("saving") : t("task.saveTask")}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/tasks")}
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
