import axios from "axios";

const PUBLIC_ENDPOINTS = [
  "/plans",
  "/categories",
  "/auth/login",
  "/auth/register",
  "/posts/public",
];

// Create the instance
const api = axios.create({
  baseURL: "http://localhost:8080/evplatform/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")?.replaceAll('"', "");

    // Check if endpoint is public
    const isPublic = PUBLIC_ENDPOINTS.some((path) =>
      config.url?.startsWith(path)
    );

    // Only attach Authorization for protected routes
    if (!isPublic && token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

export default api;
