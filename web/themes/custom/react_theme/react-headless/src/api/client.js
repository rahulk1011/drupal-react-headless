import axios from "axios";

// Single Axios client for all Drupal REST calls made by this SPA.

/** Resolve the Drupal base URL: prefer drupalSettings (theme-embedded mode),
 *  fall back to the Vite env var (standalone dev-server mode). */
function getBaseUrl() {
  if (
    typeof window !== "undefined" &&
    window.drupalSettings?.reactApp?.baseUrl
  ) {
    return window.drupalSettings.reactApp.baseUrl;
  }
  return import.meta.env.VITE_DRUPAL_API_URL || "";
}

const API_URL = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // send/receive the Drupal session cookie cross-origin
});

/** Attach the CSRF token to every mutating request. */
API_URL.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase();
  if (["POST", "PATCH", "PUT", "DELETE"].includes(method)) {
    const drupalToken = window.drupalSettings?.reactApp?.csrfToken;
    const localToken = sessionStorage.getItem("csrf_token");
    const token = drupalToken || localToken;
    if (token) config.headers["X-CSRF-Token"] = token;
  }
  return config;
});

/** Unwrap Drupal's REST error shapes into plain Error objects so callers can just read `err.message`. */
API_URL.interceptors.response.use(
  (res) => res,
  (err) => {
    const body = err.response?.data;
    const message =
      (typeof body === "string" ? body : null) ||
      body?.result ||
      body?.message ||
      body?.error ||
      err.message ||
      "An unexpected error occurred.";
    return Promise.reject(new Error(message));
  },
);

// Auth Services
/** Logs in via the custom /api/user-login resource and persists the CSRF /
 *  logout tokens Drupal returns so subsequent mutating requests can use them. */
export const loginUser = async (email, password) => {
  const response = await API_URL.post("/api/user-login?_format=json", {
    email,
    password,
  });
  const result = response.data?.result || response.data;

  if (result?.csrf_token)
    sessionStorage.setItem("csrf_token", result.csrf_token);
  if (result?.logout_token)
    sessionStorage.setItem("logout_token", result.logout_token);

  return result?.current_user || result;
};

/** Logs out both server-side (invalidate the Drupal session) and client-side
 *  (clear any cached tokens), even if the network call fails. */
export const logoutUser = async (token) => {
  const logoutToken =
    token ||
    sessionStorage.getItem("logout_token") ||
    sessionStorage.getItem("csrf_token") ||
    "";

  try {
    if (logoutToken) {
      await API_URL.post(
        `/user/logout?_format=json&token=${encodeURIComponent(logoutToken)}`,
      );
    }
  } catch (error) {
    console.warn(
      "Server logout request failed, clearing local session anyway.",
      error,
    );
  } finally {
    sessionStorage.removeItem("csrf_token");
    sessionStorage.removeItem("logout_token");
    sessionStorage.removeItem("user");
  }
};

/** Registers a new Drupal user via /api/user-registration. */
export const registerUser = async (userData) => {
  const payload = {
    usertype: userData.usertype,
    security_code: userData.securityCode,
    firstname: userData.firstname,
    lastname: userData.lastname,
    email: userData.email,
    password: userData.password,
  };
  return API_URL.post("/api/user-registration?_format=json", payload);
};

// User & Dashboard Services
export const getLanguages = async () => API_URL.get("/api/language-list?_format=json");
export const userDashboard = async () => API_URL.get("/api/user-dashboard?_format=json");
export const getUsers = async () => API_URL.get("/api/user-list?_format=json");

// Topics
export const getTopics = async (langcode = "en") => API_URL.get("/api/topiclist", { params: { _format: "json", langcode } });

export const addTopic = async (topicData) => {
  const payload = {
    title: topicData.title || "",
    subheading: topicData.subheading || "",
    description: topicData.description || "",
    trending: topicData.trending || "no",
    langcode: topicData.langcode || topicData.language || "en",
    image: topicData.image || "",
    image_name: topicData.image_name || "topic_image.jpg",
  };
  return API_URL.post("/api/add-topic?_format=json", payload);
};

// Tasks
export const getTasks = async () => API_URL.get("/api/task-list?_format=json");

export const getTaskById = async (id) => API_URL.get(`/api/task/${id}?_format=json`);

export const updateTask = async (id, taskData) => {
  const payload = {
    title: taskData.title,
    description: taskData.description,
    due_date: taskData.due_date,
    severity: taskData.severity,
    status: taskData.status,
  };
  return API_URL.post(`/api/task/${id}/update?_format=json`, payload);
};

export const addTask = async (taskData) => {
  const payload = {
    title: taskData.title,
    description: taskData.description,
    due_date: taskData.due_date,
    severity: taskData.severity,
    status: taskData.status,
    assigned_to: taskData.assigned_to,
    project_name: taskData.project_name,
  };
  return API_URL.post("/api/add-task?_format=json", payload);
};

// Projects & Clients
export const getClientList = async () => API_URL.get("/api/client-list?_format=json");

export const getProjectDetails = async () => API_URL.get("/api/project-details?_format=json");

export const addProject = async (projectData) => {
  const payload = {
    project_name: projectData.projectName,
    project_code: projectData.projectCode,
    description: projectData.description,
    project_manager: projectData.projectManager,
    start_date: projectData.startDate,
    end_date: projectData.endDate,
    client_name: projectData.clientName,
    client_manager: projectData.clientManager,
    client_address: projectData.clientAddress,
    client_city: projectData.clientCity,
    client_country: projectData.clientCountry,
    client_budget: projectData.clientBudget,
  };
  return API_URL.post("/api/add-project?_format=json", payload);
};

// Client Testimonials
export const getTestimonials = async () => API_URL.get("/api/testimonials?_format=json");

export const addTestimonial = async (testimonialData) => {
  const payload = {
    title: testimonialData.title || "",
		client_name: testimonialData.client_name || "",
    description: testimonialData.description || "",
    image: testimonialData.image || "",
    image_name: testimonialData.image_name || "testimonial_image.jpg",
  };

  return API_URL.post("/api/add-testimonial?_format=json", payload);
};

export default API_URL;
