import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      let token =
        localStorage.getItem("hisabdo_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

      if (!token && typeof document !== "undefined") {
        const match = document.cookie.match(/(?:^|;\s*)hisabdo_auth_token=([^;]+)/);
        if (match) {
          token = decodeURIComponent(match[1]);
        }
      }

      if (token && !config.headers["Authorization"] && !config.headers["authorization"]) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(
      error.response?.data?.message || "An unexpected error occurred"
    );
  }
);

export default apiClient;