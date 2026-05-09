// src/utils/api.js
import axios from "axios";

// ── FIX: Use env variable so the URL works in both local dev and production ───
// Create frontend/.env.local  → VITE_API_URL=http://localhost:5000/api
// In Vercel dashboard → Settings → Environment Variables →
//   VITE_API_URL = https://login-react-api-9qri.onrender.com/api
//
// Fallback to the hardcoded Render URL so it works even without the env var.
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://login-react-api-9qri.onrender.com/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  // Render free tier cold-starts take ~10-15s — increase timeout accordingly
  timeout: 20000,
});

// ── Attach JWT to every request if one is stored ──────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ig_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auto-logout on 401, surface errors cleanly ────────────────────────────────
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