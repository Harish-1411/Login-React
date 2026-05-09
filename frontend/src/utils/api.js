// src/utils/api.js
import axios from "axios";

// Your Render backend URL — update this if you redeploy to a new service
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://login-react-api-9qri.onrender.com/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  // Render free tier cold-starts can take 15–30s after inactivity
  timeout: 30000,
});

// ── Attach JWT to every request ───────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ig_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Handle errors globally ────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Auto-logout if token is expired/invalid
    if (err.response?.status === 401) {
      localStorage.removeItem("ig_token");
      localStorage.removeItem("ig_user");
      window.location.href = "/login";
      return Promise.reject(err);
    }

    // Timeout — Render free tier is likely cold-starting
    if (err.code === "ECONNABORTED") {
      err.message =
        "Server is waking up (Render free tier). Please wait 15–30 seconds and try again.";
      return Promise.reject(err);
    }

    // Network error — no response at all (CORS block or server down)
    if (!err.response) {
      err.message =
        "Cannot reach the server. Check your internet connection or try again shortly.";
      return Promise.reject(err);
    }

    return Promise.reject(err);
  }
);

export default api;