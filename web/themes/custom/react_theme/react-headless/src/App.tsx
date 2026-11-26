import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { BackendStatusProvider, useBackendStatus } from "./hooks/BackendStatusProvider";
import type { ReactNode } from "react";

import TopBar from "./components/layout/TopBar";
import MaintenancePage from "./components/common/MaintenancePage";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import TaskList from "./components/tasks/TaskList";
import CreateTask from "./components/tasks/CreateTask";
import EditTask from "./components/tasks/EditTask";
import AddTopic from "./components/topics/AddTopic";
import ProjectList from "./components/common/ProjectList";
import AddProject from "./components/common/AddProject";
import UserList from "./components/common/UserList";
import AddTestimonial from "./components/common/AddTestimonial";

type RouteProps = {
	children: ReactNode;
};

function ProtectedRoute({ children }: RouteProps) {
	const { user, loading } = useAuth();
	if (loading) {
		return (
			<div className="loading-center">
				<span className="spinner" />
			</div>
		);
	}
	if (!user) {
		return <Navigate to="/login" replace />;
	}
	return <>{children}</>;
}

function AdminRoute({ children }: RouteProps) {
	const { user, loading } = useAuth();
	if (loading) {
		return (
			<div className="loading-center">
				<span className="spinner" />
			</div>
		);
	}
	if (!user) {
		return <Navigate to="/login" replace />;
	}
	if (!user.isAdmin) {
		return <Navigate to="/dashboard" replace />;
	}
	return <>{children}</>;
}

function AppLayout() {
	const { isDown } = useBackendStatus();

	// Drupal is in maintenance mode or unreachable: replace the app with a status page.
	// The URL is untouched, so the user lands back on the same screen once it recovers.
	if (isDown) {
		return (
			<div className="app-layout">
				<main className="app-content">
					<MaintenancePage />
				</main>
			</div>
		);
	}

	return (
		<div className="app-layout">
			<TopBar />
			<main className="app-content">
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/register" element={<RegisterPage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route
						path="/dashboard"
						element={
							<ProtectedRoute>
								<DashboardPage />
							</ProtectedRoute>
						}
					/>

					{/* Task List page - full standalone view */}
					<Route
						path="/tasks"
						element={
							<ProtectedRoute>
								<TaskList />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/create-task"
						element={
							<ProtectedRoute>
								<CreateTask />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/edit-task/:id"
						element={
							<ProtectedRoute>
								<EditTask />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/add-topic"
						element={
							<AdminRoute>
								<AddTopic />
							</AdminRoute>
						}
					/>
					<Route
						path="/projects"
						element={
							<ProtectedRoute>
								<ProjectList />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/add-project"
						element={
							<ProtectedRoute>
								<AddProject />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/user-list"
						element={
							<ProtectedRoute>
								<UserList />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/add-testimonial"
						element={
							<AdminRoute>
								<AddTestimonial />
							</AdminRoute>
						}
					/>
				</Routes>
			</main>
			<Footer />
		</div>
	);
}

export default function App() {
	return (
		<BrowserRouter>
			<BackendStatusProvider>
				<AuthProvider>
					<AppLayout />
				</AuthProvider>
			</BackendStatusProvider>
		</BrowserRouter>
	);
}
