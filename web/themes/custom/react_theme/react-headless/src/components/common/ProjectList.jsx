import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getProjectDetails } from "../../api/client";
import "../../css/index.css";

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = !!user?.isAdmin;
  const projectsPerPage = 5;

  useEffect(() => {
    getProjectDetails()
      .then((response) => setProjects(response.data?.result || []))
      .catch((err) => console.error("Error fetching projects:", err))
      .finally(() => setLoading(false));
  }, []);

  // Pagination calculations
  const totalPages = Math.ceil(projects.length / projectsPerPage);
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;

  const currentProjects = projects.slice(
    indexOfFirstProject,
    indexOfLastProject,
  );

  const formatBudget = (budget) => {
    if (budget === null || budget === undefined || budget === "") {
      return "Not available";
    }

    const numericBudget = Number(budget);

    if (Number.isNaN(numericBudget)) {
      return budget;
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(numericBudget);
  };

  if (loading) {
    return (
      <div className="skeleton-grid">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-line" />
          </div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return <div className="no-projects">No Projects Found.</div>;
  }

  return (
    <div className="projectlist-container">
      <div className="projectlist-breadcrumb">
        <button
          type="button"
          className="back-to-dashboard-link"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>
        <span className="breadcrumb-sep">/</span>
        <span>Project List</span>
      </div>

      <div className="projectlist-header">
        <div>
          <h1 className="projectlist-title">Project List</h1>
          <p className="project-count">
            View all available projects: {projects.length}
          </p>
        </div>

        <button
          className="btn-admin add-project-btn"
          onClick={() => navigate("/add-project")}
        >
          + Add Project
        </button>
      </div>

      <div className="project-list-content">
        {currentProjects.map((project, index) => {
          return (
            <div
              key={project.id || project.nid || index}
              className="project-card"
            >
              <div className="project-card-header">
                <div className="project-heading">
                  <p className="project-label">Project</p>
                  <h2 className="project-title">
                    {project.project_details.title}
                  </h2>
                </div>

                <p className="project-code">
                  {project.project_details.project_code}
                </p>
              </div>

							<div className="project-summary">
								<div className="project-info-item">
                  <p className="project-info-label">Client Name</p>
                  <p className="project-info-value">
                    {project.client_details.client_name}
                  </p>
                </div>

                <div className="project-info-item">
                  <p className="project-info-label">Client Address</p>
                  <p className="project-info-value">
                    {project.client_details.client_address}
                  </p>
                </div>

                <div className="project-info-item">
                  <p className="project-info-label">Client City</p>
                  <p className="project-info-value">
                    {project.client_details.client_city}
                  </p>
                </div>

                <div className="project-info-item">
                  <p className="project-info-label">Client Country</p>
                  <p className="project-info-value">
                    {project.client_details.client_country}
                  </p>
                </div>
              </div>

							<div className="project-summary">
                <div className="project-info-item">
                  <p className="project-info-label">Client POC</p>
                  <p className="project-info-value">
                    {project.client_details.client_poc.fullname}
                  </p>
                </div>

                <div className="project-info-item">
                  <p className="project-info-label">Client POC Email</p>
                  <p className="project-info-value">
                    {project.client_details.client_poc.mail}
                  </p>
                </div>

                <div className="project-info-item">
                  <p className="project-info-label">Client Budget</p>
                  <p className="project-info-value project-budget">
                    {formatBudget(project.client_details.client_budget)}
                  </p>
                </div>
              </div>

              <div className="project-summary">
                <div className="project-info-item">
                  <p className="project-info-label">Project Manager</p>
                  <p className="project-info-value">
                    {project.project_details.project_manager?.fullname}
                  </p>
                </div>

                <div className="project-info-item">
                  <p className="project-info-label">Start Date</p>
                  <p className="project-info-value">
                    {project.project_details.start_date}
                  </p>
                </div>

                <div className="project-info-item">
                  <p className="project-info-label">End Date</p>
                  <p className="project-info-value">
                    {project.project_details.end_date}
                  </p>
                </div>

								<div className="project-info-item">
                  <p className="project-info-label">Created</p>
                  <p className="project-info-value project-created">
                    {project.created}
                  </p>
                </div>
              </div>

              <div className="project-description">
                <div className="project-info-item">
                  <p className="project-info-label">Description</p>
                  <p className="project-info-value">
                    {project.project_details.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {projects.length > projectsPerPage && (
        <div className="pagination-wrapper">
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              ⬅️
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                className={`pagination-btn ${
                  currentPage === index + 1 ? "active" : ""
                }`}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              ➡️
            </button>
          </div>

          <div className="page-info">
            Showing {indexOfFirstProject + 1} -{" "}
            {Math.min(indexOfLastProject, projects.length)} of {projects.length}{" "}
            projects
          </div>
        </div>
      )}
    </div>
  );
}
