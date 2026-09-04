import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getTaskById, updateTask } from "../../api/client";
import "../../css/index.css";

export default function EditTask() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!location.state?.task);
  const [loadError, setLoadError] = useState(null);
  const [assignedTo, setAssignedTo] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    severity: "low",
    status: "open",
  });

	// Helper function to ensure dates conform to YYYY-MM-DD for <input type="date">
	const formatDateForInput = (dateStr) => {
		if (!dateStr) return "";
		if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
		if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
			const [day, month, year] = dateStr.split("-");
			return `${year}-${month}-${day}`;
		}
		return dateStr;
	};

  const applyTask = (task) => {
    setFormData({
      title: task.title || task.task_name || "",
      description: task.description || "",
      due_date: formatDateForInput(task.due_date),
      severity: (task.severity || "low").toLowerCase(),
      status: (task.status || "open").toLowerCase().replace(/\s+/g, "_"),
    });
    setAssignedTo(task.assigned_to || null);
  };

  useEffect(() => {
    // A card navigates here with the task already in hand (router state),
    // so we can render instantly. Falling back to a fetch covers a direct
    // link/refresh, where that state is gone.
    if (location.state?.task) {
      applyTask(location.state.task);
      setIsLoading(false);
      return;
    }

    getTaskById(id)
      .then((response) => {
        const task = response.data?.result;
        if (!task) throw new Error("Task not found.");
        applyTask(task);
      })
      .catch((err) => {
        console.error("Failed to load task:", err);
        setLoadError(
          err.message || "Couldn't load this task. It may not be assigned to you.",
        );
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
      await updateTask(id, formData);
      navigate("/tasks");
    } catch (err) {
      console.error("Failed to update task:", err);
      alert(err.message || "Failed to save changes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="create-task-container">
        <div className="create-task-card">
          <p className="tasklist-loading">Loading task...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="create-task-container">
        <div className="create-task-card">
          <div className="tasklist-error">{loadError}</div>
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/tasks")}
            >
              Back to Tasks
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-task-container">
      <div className="create-task-card">
        <div className="create-task-header">
          <div>
            <h2>Edit Task</h2>
            <p className="create-task-subtitle">
              Fields marked <span className="required">*</span> are required.
            </p>
						{assignedTo?.name && (
							<p className="edit-task-assigned-to">
								{" "}
								Task is assigned to <strong>{assignedTo.fullname}</strong>.
							</p>
						)}
          </div>
          <button
            type="button"
            className="btn-secondary btn-back"
            onClick={() => navigate("/tasks")}
            disabled={isSubmitting}
          >
            <span aria-hidden="true">&larr;</span> Back to Tasks
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">
              Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Enter task title"
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="description">
                Description <span className="required">*</span>
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
              placeholder="Enter detailed description"
              disabled={isSubmitting}
            />
          </div>

          {/* Due Date / Severity / Status */}
          <div className="form-row form-row--3col">
            <div className="form-group">
              <label htmlFor="due_date">
                Due Date <span className="required">*</span>
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

            <div className="form-group">
              <label htmlFor="severity">
                Severity <span className="required">*</span>
              </label>
              <select
                id="severity"
                name="severity"
                value={formData.severity}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">
                Status <span className="required">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/tasks")}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
