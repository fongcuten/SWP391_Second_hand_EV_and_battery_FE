import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/evplatform",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: any) => {
    // Skip auth for specific requests (manual flag)
    if (config.skipAuth) {
      return config;
    }

    // Skip auth for public endpoints ONLY
    // ✅ FIX: Be more specific - exact match for registration
    if (config.url === '/users' && config.method === 'post') {
      return config; // Only skip for POST /users (registration)
    }

    // Skip auth for login/register endpoints
    if (config.url?.includes('/auth/login') ||
      config.url?.includes('/auth/register')) {
      return config;
    }

    // Add token to all other requests
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if not already on login/register page
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/dang-nhap') && !currentPath.includes('/dang-ky')) {
        localStorage.removeItem("auth_token");
        window.location.href = "/dang-nhap";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
