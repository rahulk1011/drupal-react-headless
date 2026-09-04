import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getTasks } from "../../api/client";
import "../../css/index.css";

const COLUMNS = [
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = !!user?.isAdmin;
  const isManager = user.role.toLowerCase() === "manager";
  const isEngineer = user.role.toLowerCase() === "engineer";
  const isClient = user.role.toLowerCase() === "client";

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getTasks()
      .then((tasksRes) => {
        if (!isMounted) return;

        const rawResult = tasksRes.data?.result;

        // Handle case where result is a string like "No active tasks found"
        if (
          !rawResult ||
          typeof rawResult === "string" ||
          !Array.isArray(rawResult)
        ) {
          setTasks([]);
          setProjects([]);
          return;
        }

        const normalizedTasks = [];
        const projectList = [];

        // Check response structure: Nested (Client/Manager) vs Flat (Admin/Engineer)
        rawResult.forEach((item) => {
          if (!item || typeof item !== "object") return;

          // Check if response is nested project structure
          if ("tasks" in item) {
            if (item.project_name) {
              projectList.push({
                id: item.project_id,
                name: item.project_name,
              });
            }

            // Only process tasks if tasks is an actual populated array
            if (Array.isArray(item.tasks)) {
              item.tasks.forEach((task) => {
                normalizedTasks.push({
                  ...task,
                  project_id: item.project_id,
                  project_name: item.project_name,
                });
              });
            }
          } else {
            // Admin/Engineer flat structure: item is an individual task object
            normalizedTasks.push(item);
            if (item.project_name) {
              projectList.push({
                id: item.project_id,
                name: item.project_name,
              });
            }
          }
        });

        setTasks(normalizedTasks);

        // De-duplicate project dropdown list
        const uniqueProjectList = Array.from(
          new Map(projectList.map((p) => [p.name, p])).values(),
        );
        setProjects(uniqueProjectList);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Error fetching tasks:", err);
        setError("Failed to load task list. Please try again.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const normaliseStatus = (raw = "") =>
    raw.toLowerCase().replace(/[\s-]+/g, "_");

  // Filter tasks based on selected project
  const filteredTasks = tasks.filter((task) => {
    if (selectedProject === "all") return true;
    return task.project_name === selectedProject;
  });

  // Group tasks by status columns
  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.key] = [];
    return acc;
  }, {});
  const other = [];

  filteredTasks.forEach((task) => {
    const norm = normaliseStatus(task.status);
    if (grouped[norm] !== undefined) {
      grouped[norm].push(task);
    } else {
      other.push(task);
    }
  });

  return (
    <div className="tasklist-container">
      <div className="tasklist-header">
        <div>
          <div className="tasklist-breadcrumb">
            <button
              type="button"
              className="back-to-dashboard-link"
              onClick={() => navigate("/dashboard")}
            >
              ← Dashboard
            </button>
            <span className="breadcrumb-sep">/</span>
            <span>Task List</span>
          </div>
          <h2>Task List ({filteredTasks.length})</h2>
          <p className="tasklist-scope">
            {isAdmin
              ? "Showing all tasks across all users."
              : "Showing tasks assigned to you."}
          </p>
        </div>
        {!isClient && (
          <button
            className="btn-admin add-task-btn"
            onClick={() => navigate("/create-task")}
          >
            + Add Task
          </button>
        )}
      </div>

      {/* Project Filter Controls */}
      {!isLoading && !error && (
        <div className="tasklist-filter-bar">
          <label htmlFor="project-filter">Filter by Project:</label>
          {projects.length === 0 ? (
            <span
              className="no-project-assigned-text"
              style={{ fontWeight: "500", marginLeft: "8px" }}
            >
              No Projects Available
            </span>
          ) : (
            <select
              id="project-filter"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="all">All Projects</option>
              {projects.map((proj) => (
                <option key={proj.id || proj.name} value={proj.name}>
                  {proj.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {isLoading && <div className="tasklist-loading">Loading tasks...</div>}
      {error && <div className="tasklist-error">{error}</div>}

      {!isLoading && !error && (
        <div className="tasklist-body">
          {filteredTasks.length === 0 ? (
            <div className="no-tasks">No Active Tasks Found</div>
          ) : (
            <div className="task-board">
              {COLUMNS.map((col) => {
                const colTasks =
                  col.key === "open"
                    ? [...(grouped.open || []), ...other]
                    : grouped[col.key] || [];

                return (
                  <div
                    key={col.key}
                    className={`task-column task-column--${col.key}`}
                  >
                    <div className="task-column__header">
                      <span className={`badge status-${col.key}`}>
                        {col.label}
                      </span>
                      <span className="task-column__count">
                        {colTasks.length}
                      </span>
                    </div>

                    <div className="task-column__cards">
                      {colTasks.length === 0 ? (
                        <div className="task-column__empty">No Tasks</div>
                      ) : (
                        colTasks.map((task) => {
                          const taskId = task.node_id || task.task_id;
                          const taskTitle = task.task_name || task.title;

                          return (
                            <div key={taskId} className="task-card">
                              <div className="task-card-project-header">
                                <h2>{task.project_name}</h2>
                              </div>
                              <div className="task-card-header">
                                <h3>{taskTitle}</h3>
                              </div>
                              <p className="task-description">
                                {task.description}
                              </p>
                              <div className="task-card-people">
                                {task.created_by?.name && (
                                  <p className="task-meta">
                                    Created by{" "}
                                    <strong>
                                      {task.created_by.fullname ||
                                        task.created_by.name}
                                    </strong>
                                  </p>
                                )}
                                {!isEngineer && task.assigned_to?.name && (
                                  <p className="task-meta">
                                    Assigned to{" "}
                                    <strong>
                                      {task.assigned_to.fullname ||
                                        task.assigned_to.name}
                                    </strong>
                                  </p>
                                )}
                              </div>
                              <div className="task-card-footer">
                                <span className="task-due-date">
                                  📅 Due: {task.due_date || "N/A"}
                                </span>
                                <span className="task-severity">
                                  Severity:{" "}
                                  <span
                                    className={`badge severity-${(
                                      task.severity || ""
                                    ).toLowerCase()}`}
                                  >
                                    {task.severity}
                                  </span>
                                </span>
                              </div>
                              {!isClient && (
                                <button
                                  type="button"
                                  className="task-edit-btn"
                                  onClick={() =>
                                    navigate(`/edit-task/${taskId}`, {
                                      state: { task },
                                    })
                                  }
                                >
                                  Edit Task
                                </button>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
