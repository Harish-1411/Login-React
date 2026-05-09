// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../utils/AuthContext";

// ── Eye / EyeOff SVG icons (no external icon library needed) ─────────────────
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

// ── Spinner component ─────────────────────────────────────────────────────────
const Spinner = () => <span className="spinner" aria-hidden="true" />;

// ── Instagram gradient camera logo ────────────────────────────────────────────
const InstagramLogo = () => (
  <div className="flex flex-col items-center mb-8 animate-fade-up">
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-lg"
      style={{
        background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
      }}
    >
      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    </div>
    <h1 className="font-logo text-4xl tracking-wide text-[#262626]">Instagram</h1>
  </div>
);

// ── Main Login Page ───────────────────────────────────────────────────────────
const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Client-side validation ──────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Enter a valid email address";
    }
    if (!form.password) {
      errs.password = "Password is required";
    } else if (form.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error on input
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setError("");
  };

  // ── Submit handler ──────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/login", form);
      login(data.user, data.token);  // Store user + token in context/localStorage
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.code === "ECONNABORTED" ? "Request timed out. Try again." : "Something went wrong.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ig-gradient-bg min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* ── Login card ────────────────────────────────────────────────────── */}
      <div className="glass-card w-full max-w-[350px] rounded-xl px-10 pt-10 pb-8 animate-fade-up">
        <InstagramLogo />

        {/* ── Global error banner ──────────────────────────────────────── */}
        {error && (
          <div className="mb-4 px-3 py-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs text-center animate-fade-up">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-2">
          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Phone number, username, or email"
              className={`ig-input text-xs ${fieldErrors.email ? "border-red-400" : ""}`}
              autoComplete="email"
              disabled={loading}
            />
            {fieldErrors.email && (
              <p className="text-[10px] text-red-500 mt-1 px-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password + toggle */}
          <div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className={`ig-input text-xs pr-14 ${fieldErrors.password ? "border-red-400" : ""}`}
                autoComplete="current-password"
                disabled={loading}
              />
              {/* Show / hide toggle — only visible when field has value */}
              {form.password && (
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#262626] font-semibold text-xs hover:text-[#555] transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              )}
            </div>
            {fieldErrors.password && (
              <p className="text-[10px] text-red-500 mt-1 px-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !form.email || !form.password}
              className="ig-btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Spinner />
                  <span>Logging in…</span>
                </>
              ) : (
                "Log in"
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="ig-divider mt-5">
          <span className="text-[#8e8e8e] text-xs font-semibold tracking-wider">OR</span>
        </div>

        {/* Facebook login (decorative) */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 text-[#385185] font-semibold text-sm py-2 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#385185]">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Log in with Facebook
        </button>

        {/* Forgot password */}
        <p className="text-center text-xs text-[#0095f6] mt-4 cursor-pointer hover:underline">
          Forgot password?
        </p>
      </div>

      {/* Sign up card */}
      <div className="glass-card w-full max-w-[350px] rounded-xl px-10 py-4 mt-2.5 text-center animate-fade-up delay-100">
        <p className="text-sm text-[#262626]">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#0095f6] font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>

      {/* App download badge */}
      <div className="mt-5 text-center animate-fade-up delay-200">
        <p className="text-[13px] text-[#262626] mb-3">Get the app.</p>
        <div className="flex items-center gap-2 justify-center">
          {["App Store", "Google Play"].map((store) => (
            <div
              key={store}
              className="px-3 py-1.5 rounded-lg border border-[#dbdbdb] bg-white/60 text-xs font-medium text-[#262626] cursor-pointer hover:bg-white/80 transition-all"
            >
              {store}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;