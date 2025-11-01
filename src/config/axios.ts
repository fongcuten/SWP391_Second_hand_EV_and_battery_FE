import axios from "axios";

const baseURL = "http://localhost:8080/evplatform";

// Authenticated API
const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

     if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hasToken = localStorage.getItem("auth_token");
      if (hasToken) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/dang-nhap";
      }
    }
    return Promise.reject(error);
  }
);

// Guest API
export const guestApi = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

export default api;
