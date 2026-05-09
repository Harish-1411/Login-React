// =============================================
// server.js — Express + JWT Auth API
// =============================================
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Secret key for signing JWTs (use env var in production) ──────────────────
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_change_in_prod";

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// ── In-memory user store (replace with DB in production) ─────────────────────
// Passwords are pre-hashed with bcrypt (rounds=10)
// Plain-text equivalents: user@example.com → "password123", admin@site.com → "admin456"
const users = [];

// Seed default users on startup
(async () => {
  users.push({
    id: 1,
    name: "Alex Rivera",
    email: "user@example.com",
    password: await bcrypt.hash("password123", 10),
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  });
  users.push({
    id: 2,
    name: "Jordan Blake",
    email: "admin@site.com",
    password: await bcrypt.hash("admin456", 10),
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
  });
  console.log("✅ Seeded in-memory users");
})();

// ── Helper: generate JWT ──────────────────────────────────────────────────────
const generateToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
    expiresIn: "7d",
  });

// ── Middleware: verify JWT ────────────────────────────────────────────────────
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

  if (!token) return res.status(401).json({ message: "Access token required" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.user = user;
    next();
  });
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic input validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email (case-insensitive)
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare submitted password against stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Issue JWT
    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ── POST /api/auth/register ───────────────────────────────────────────────────
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for duplicate email
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password: hashed,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    };
    users.push(newUser);

    const token = generateToken(newUser);
    res.status(201).json({
      message: "Registration successful",
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, avatar: newUser.avatar },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ── GET /api/auth/me  (protected) ─────────────────────────────────────────────
app.get("/api/auth/me", authenticateToken, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ id: user.id, name: user.name, email: user.email, avatar: user.avatar });
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_, res) => res.json({ status: "ok" }));

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Auth API running on http://localhost:${PORT}`);
});