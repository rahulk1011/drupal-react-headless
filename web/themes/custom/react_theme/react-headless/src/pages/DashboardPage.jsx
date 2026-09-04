import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import DashboardInfo from "../components/DashboardInfo";
import TrendingTopics from "../components/topics/TrendingTopics";
import { useTranslation } from "react-i18next";
import "../css/index.css";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
	const { t, i18n } = useTranslation();

  const displayName = [user?.firstname, user?.lastname].filter(Boolean).join(" ") || "User";

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="dashboard-header">
        <div>
          <h1>{t("app.welcomeBack")} {displayName}! 👋</h1>
          <p>{t("dashboard.description")}</p>
        </div>
      </div>

      <div className="dashboard-content-grid">
				{/* User Information Panel */}
				<div className="userinfo-card">
					<div className="card-header">
						<h2>{t("user.userInformation")}</h2>
					</div>
					<div className="user-info-body">
						<div className="info-row">
							<span className="info-label">{t("user.userId")}:</span>
							<span className="info-value">{user?.id || "N/A"}</span>
						</div>
						<div className="info-row">
							<span className="info-label">{t("user.username")}:</span>
							<span className="info-value">{user?.name || "N/A"}</span>
						</div>
						<div className="info-row">
							<span className="info-label">{t("user.email")}:</span>
							<span className="info-value">{user?.email || "N/A"}</span>
						</div>
						<div className="info-row">
							<span className="info-label">{t("user.role")}:</span>
							<span className="info-value">{user?.role || "N/A"}</span>
						</div>
						<div className="info-row">
							<span className="info-label">{t("user.accountCreated")}:</span>
							<span className="info-value">{user?.created || "N/A"}</span>
						</div>
					</div>
				</div>

				<DashboardInfo />
      </div>

			<h2 className="dashboard-project-section-title">View & Manage Active Tasks in Projects</h2>
			<div className="project-task-wrapper">
				<div className="dashboard-tasks-nav">
					<div className="tasks-nav-info">
						<h2>{t("dashboard.projectTracker")}</h2>
						<p>{t("dashboard.projectTrackerDescription")}</p>
					</div>
					<button
						type="button"
						className="add-topic-btn"
						onClick={() => navigate("/tasks")}
					>
						{t("dashboard.viewTaskList")}
					</button>
				</div>
			</div>

			<TrendingTopics />
    </div>
  );
}
