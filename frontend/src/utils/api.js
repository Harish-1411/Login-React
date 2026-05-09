// src/utils/api.js
// ── Axios instance pre-configured for the auth API ───────────────────────────
import axios from "axios";

const api = axios.create({
  baseURL: "https://login-react-a5ma.vercel.app/", // Vite proxy forwards this to http://localhost:5000/api
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// ── Request interceptor: attach JWT from localStorage if present ──────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ig_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: auto-logout on 401 ─────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("ig_token");
      localStorage.removeItem("ig_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;