// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../utils/AuthContext";

const Spinner = () => <span className="spinner" />;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "At least 6 characters";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((p) => ({ ...p, [name]: "" }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      login(data.user, data.token);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ig-gradient-bg min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="glass-card w-full max-w-[350px] rounded-xl px-10 pt-10 pb-8 animate-fade-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-lg"
            style={{ background: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)" }}
          >
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </div>
          <h1 className="font-logo text-3xl text-[#262626]">Instagram</h1>
          <p className="text-[#8e8e8e] text-sm font-semibold text-center mt-3 leading-snug">
            Sign up to see photos and videos<br />from your friends.
          </p>
        </div>

        {/* Facebook button */}
        <button type="button" className="w-full flex items-center justify-center gap-2 bg-[#0095f6] hover:bg-[#1877f2] text-white text-sm font-semibold py-[7px] rounded-lg transition-colors mb-4">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Log in with Facebook
        </button>

        <div className="ig-divider">
          <span className="text-[#8e8e8e] text-xs font-semibold tracking-wider">OR</span>
        </div>

        {error && (
          <div className="mb-3 px-3 py-2 rounded-md bg-red-50 border border-red-200 text-red-600 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-2">
          {/* Full Name */}
          <div>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
              autoComplete="name"
              disabled={loading}
              className={`ig-input text-xs ${fieldErrors.name ? "border-red-400" : ""}`}
            />
            {fieldErrors.name && (
              <p className="text-[10px] text-red-500 mt-1 px-1">{fieldErrors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              autoComplete="email"
              disabled={loading}
              className={`ig-input text-xs ${fieldErrors.email ? "border-red-400" : ""}`}
            />
            {fieldErrors.email && (
              <p className="text-[10px] text-red-500 mt-1 px-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                autoComplete="new-password"
                disabled={loading}
                className={`ig-input text-xs pr-16 ${fieldErrors.password ? "border-red-400" : ""}`}
              />
              {form.password && (
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#262626] hover:text-[#555]"
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              )}
            </div>
            {fieldErrors.password && (
              <p className="text-[10px] text-red-500 mt-1 px-1">{fieldErrors.password}</p>
            )}
          </div>

          <p className="text-[10px] text-[#8e8e8e] text-center leading-snug pt-1">
            By signing up, you agree to our{" "}
            <span className="font-semibold text-[#262626] cursor-pointer">Terms</span>,{" "}
            <span className="font-semibold text-[#262626] cursor-pointer">Privacy Policy</span> and{" "}
            <span className="font-semibold text-[#262626] cursor-pointer">Cookies Policy</span>.
          </p>

          <div className="pt-1">
            <button
              type="submit"
              disabled={loading || !form.email || !form.password || !form.name}
              className="ig-btn-primary flex items-center justify-center gap-2"
            >
              {loading ? <><Spinner /><span>Creating account…</span></> : "Sign up"}
            </button>
          </div>
        </form>
      </div>

      <div className="glass-card w-full max-w-[350px] rounded-xl px-10 py-4 mt-2.5 text-center animate-fade-up delay-100">
        <p className="text-sm text-[#262626]">
          Have an account?{" "}
          <Link to="/login" className="text-[#0095f6] font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;