// =============================================
// server.js — Express + JWT Auth API (FIXED)
// =============================================
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_change_in_prod";

// ── FIX: CORS ────────────────────────────────────────────────────────────────
// Must be the VERY FIRST middleware — before express.json() and all routes.
// Previous version missed the OPTIONS preflight handler, causing browsers
// to block POST requests even when the origin was in the whitelist.
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://login-react-theta-drab.vercel.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200, // Some browsers (IE11) choke on 204
};

// Handle OPTIONS preflight for ALL routes — this must come before app.use(cors())
app.options("*", cors(corsOptions));

// Apply CORS to all routes
app.use(cors(corsOptions));

app.use(express.json());

// ── FIX: Root route ───────────────────────────────────────────────────────────
// Without this, Render shows "Cannot GET /" and its health checker
// marks the service as down, causing it to restart mid-request.
app.get("/", (_, res) => {
  res.json({
    status: "ok",
    message: "Instagram Auth API is running ✅",
    endpoints: {
      login:    "POST /api/auth/login",
      register: "POST /api/auth/register",
      me:       "GET  /api/auth/me  (Bearer token required)",
      health:   "GET  /health",
    },
  });
});

// ── In-memory user store ──────────────────────────────────────────────────────
const users = [];

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

// ── Generate JWT ──────────────────────────────────────────────────────────────
const generateToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
    expiresIn: "7d",
  });

// ── Verify JWT middleware ─────────────────────────────────────────────────────
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
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
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    res.json({
      message: "Login successful",
      token: generateToken(user),
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar },
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
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase()))
      return res.status(409).json({ message: "Email already registered" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const newUser = {
      id: users.length + 1,
      name,
      email,
      password: await bcrypt.hash(password, 10),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    };
    users.push(newUser);

    res.status(201).json({
      message: "Registration successful",
      token: generateToken(newUser),
      user: { id: newUser.id, name: newUser.name, email: newUser.email, avatar: newUser.avatar },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ── GET /api/auth/me (protected) ──────────────────────────────────────────────
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