import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getUsers } from "../../api/client";
import "../../css/index.css";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = !!user?.isAdmin;
  const usersPerPage = 15;

  useEffect(() => {
    getUsers()
      .then((response) => setUsers(response.data?.result || []))
      .catch((err) => console.error("Error fetching user list:", err))
      .finally(() => setLoading(false));
  }, []);

  // Dynamically extract unique roles for filter dropdown
  const roles = useMemo(() => {
    const uniqueRoles = new Set(users.map((u) => u.role).filter(Boolean));
    return Array.from(uniqueRoles);
  }, [users]);

  // Filter by role & search term (fullname or email), then sort by UID ascending
  const filteredAndSortedUsers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return users
      .filter((u) => {
        const matchesRole = selectedRole === "ALL" || u.role === selectedRole;
        const matchesSearch =
          !term ||
          (u.fullname && u.fullname.toLowerCase().includes(term)) ||
          (u.email && u.email.toLowerCase().includes(term));
        return matchesRole && matchesSearch;
      })
      .sort((a, b) => {
        const uidA = a.uid ?? "";
        const uidB = b.uid ?? "";
        return String(uidA).localeCompare(String(uidB), undefined, {
          numeric: true,
        });
      });
  }, [users, selectedRole, searchTerm]);

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Pagination calculations based on filtered results
  const totalPages = Math.ceil(filteredAndSortedUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;

  const currentUsers = filteredAndSortedUsers.slice(
    indexOfFirstUser,
    indexOfLastUser,
  );

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

  if (users.length === 0) {
    return <div className="no-users">No Users Found..</div>;
  }

  return (
    <div className="user-list-container">
      <div className="userlist-breadcrumb">
        <button
          type="button"
          className="back-to-dashboard-link"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>
        <span className="breadcrumb-sep">/</span>
        <span>User List</span>
      </div>

      <div className="userlist-header">
        <div className="userlist-text-wrapper">
          <h1 className="userlist-title">User List</h1>
          <p className="userlist-count">
            Showing {filteredAndSortedUsers.length} of {users.length} users
          </p>
        </div>

        <div className="userlist-controls">
          <div className="userlist-search">
            <input
              type="text"
              className="search-input"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="userlist-filter">
            <label htmlFor="role-select" className="filter-label">
              Filter Role:
            </label>
            <select
              id="role-select"
              className="role-dropdown"
              value={selectedRole}
              onChange={handleRoleChange}
            >
              <option value="ALL">All Roles</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="userlist-content">
        <div className="userlist-row userlist-header-row">
          <strong className="col-uid">UID</strong>
          <strong className="col-fullname">Full Name</strong>
          <strong className="col-username">Username</strong>
          <strong className="col-email">Email</strong>
          <strong className="col-role">Role</strong>
          <strong className="col-created">Created</strong>
          <strong className="col-last-login">Last Login</strong>
        </div>

        {currentUsers.length === 0 ? (
          <div className="no-users">No matching users found.</div>
        ) : (
          currentUsers.map((user) => (
            <div
              key={user.uid}
              className={`userlist-row role-${user.role?.toLowerCase()}`}
            >
              <p className="col-uid">{user.uid}</p>
              <p className="col-fullname">{user.fullname}</p>
              <p className="col-username">{user.name}</p>
              <p className="col-email">{user.email}</p>
              <p className="col-role">{user.role}</p>
              <p className="col-created">{user.created}</p>
              <p className="col-last-login">{user.last_login}</p>
            </div>
          ))
        )}
      </div>

      {filteredAndSortedUsers.length > usersPerPage && (
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
                className={`pagination-btn ${currentPage === index + 1 ? "active" : ""}`}
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
            Showing {indexOfFirstUser + 1} -{" "}
            {Math.min(indexOfLastUser, filteredAndSortedUsers.length)} of{" "}
            {filteredAndSortedUsers.length} Users
          </div>
        </div>
      )}
    </div>
  );
}
