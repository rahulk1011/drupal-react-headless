import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userDashboard } from "../api/client";
import "../css/index.css";
import { useTranslation } from "react-i18next";
import ErrorState from "./common/ErrorState";

export default function DashboardInfo() {
	const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await userDashboard();
        const data = response.data?.result || response.result;
        setDashboardData(data);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="loading">{t("backend.loadingDashboard")}</div>;
  if (error) {
    return (
      <ErrorState
        message={t("backend.dashboardError")}
        compact
      />
    );
  }
  if (!dashboardData) return null;

  const { user_data, project_data } = dashboardData;
  const userRole = user_data?.role || "";
  const isAdmin = userRole.includes("administrator");
  const isManager = userRole.includes("manager");
  const isEngineer = userRole.includes("engineer");
  const isClient = userRole.includes("client");

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % project_data.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + project_data.length) % project_data.length,
    );
  };

  const renderProjectCard = (project) => (
    <div className="user-project-card">
      <h3>
        {project.project_name} ({project.project_code})
      </h3>
      <p>
        <strong>{t("project.clientName")}:</strong> {project.client_name}
      </p>
      <p>
        <strong>{t("dashboard.location")}:</strong> {project.client_city},{" "}
        {project.client_country}
      </p>
      <p>
        <strong>{t("dashboard.duration")}:</strong> {project.start_date} to {project.end_date}
      </p>

      {isManager && (
        <div className="manager-project-info">
          <div className="role-specific-info">
            <h4>{t("project.clientManager")}</h4>
            <p>
              <strong>{t("user.name")}:</strong> {project.client_poc || "N/A"}
            </p>
            <p>
              <strong>{t("user.email")}:</strong> {project.client_poc_email || "N/A"}
            </p>
          </div>

          <div className="role-specific-info">
            <h4>{t("dashboard.taskAssignees")}</h4>
            {project.task_assignees?.length > 0 ? (
              <ul className="assignees-list">
                {project.task_assignees.map((assignee) => (
                  <li key={assignee.user_id}>
                    {assignee.name} ({assignee.email})
                  </li>
                ))}
              </ul>
            ) : (
              <p>{t("dashboard.noAssigneesTeam")}</p>
            )}
          </div>
        </div>
      )}

      {isEngineer && (
        <div className="role-specific-info">
          <h4>{t("project.projectManager")}</h4>
          <p>
            <strong>{t("user.name")}:</strong> {project.manager_name || "N/A"}
          </p>
          <p>
            <strong>{t("user.email")}:</strong> {project.manager_email || "N/A"}
          </p>
        </div>
      )}

      {isClient && (
        <div className="role-specific-info">
          <h4>{t("dashboard.pointOfContact")}</h4>
          <p>
            <strong>{t("user.name")}:</strong> {project.project_poc || "N/A"}
          </p>
          <p>
            <strong>{t("user.email")}:</strong> {project.project_poc_email || "N/A"}
          </p>
        </div>
      )}
    </div>
  );

  return isAdmin ? (
    <div className="admin-dashboard-container">
      <div className="dashboard-projects-info">
        <div className="projects-nav-info">
          <h2>{t("dashboard.projectDetails")}</h2>
          <p>{t("dashboard.projectDetailsText")}</p>
        </div>
        <button
          type="button"
          className="btn-admin add-project-btn"
          onClick={() => navigate("/projects")}
        >
          {t("dashboard.projectDetailsButton")}
        </button>
      </div>
      <div className="dashboard-user-list">
        <div className="user-list-info">
          <h2>{t("dashboard.userList")}</h2>
          <p>{t("dashboard.userListText")}</p>
        </div>
        <button
          type="button"
          className="btn-admin user-list-btn"
          onClick={() => navigate("/user-list")}
        >
          {t("dashboard.userListButton")}
        </button>
      </div>
			<div className="dashboard-topic-list">
        <div className="topic-list-info">
          <h2>{t("dashboard.topicList")}</h2>
          <p>{t("dashboard.topicListText")}</p>
        </div>
        <button
          type="button"
          className="btn-admin topic-list-btn"
          onClick={() => navigate("/add-topic")}
        >
          {t("dashboard.topicListButton")}
        </button>
      </div>
			<div className="dashboard-testimonial-list">
				<div className="testimonial-list-info">
          <h2>{t("dashboard.testimonialList")}</h2>
          <p>{t("dashboard.testimonialListText")}</p>
        </div>
        <button
          type="button"
          className="btn-admin testimonial-list-btn"
          onClick={() => navigate("/add-testimonial")}
        >
          {t("dashboard.testimonialListButton")}
        </button>
			</div>
    </div>
  ) : (
    <div className="user-dashboard-container">
      <div className="user-projects-section">
        <h2>{t("dashboard.projectInformation")}</h2>
        {!project_data || project_data.length === 0 ? (
          <p>{t("dashboard.noProjectsAssigned")}</p>
        ) : project_data.length === 1 ? (
          <div className="user-project-grid">
            {renderProjectCard(project_data[0])}
          </div>
        ) : (
          <div className="project-slider-wrapper">
            {/* Viewport & Track for Smooth Transitions */}
            <div className="slider-viewport">
              <div
                className="slider-track"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {project_data.map((project, idx) => (
                  <div key={project.project_id || idx} className="slide-item">
                    {renderProjectCard(project)}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Controls Container */}
            <div className="slider-controls">
              <button
                type="button"
                className="slider-nav-btn prev-btn"
                onClick={handlePrevSlide}
                aria-label="Previous Slide"
              >
                &#10094;
              </button>

              <div className="slider-dots">
                {project_data.map((_, idx) => (
                  <span
                    key={idx}
                    className={`dot ${idx === currentSlide ? "active" : ""}`}
                    onClick={() => setCurrentSlide(idx)}
                  />
                ))}
              </div>

              <button
                type="button"
                className="slider-nav-btn next-btn"
                onClick={handleNextSlide}
                aria-label="Next Slide"
              >
                &#10095;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
