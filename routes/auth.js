const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { full_name, email, password } = req.body;

  // 1. Validate input
  if (!full_name || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  try {
    // 2. Check if email is already used
    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: "Email is already registered." });
    }

    // 3. Hash the password
    const password_hash = await bcrypt.hash(password, 10);

    // 4. Save the user
    await db.query(
      "INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)",
      [full_name, email, password_hash]
    );

    res.status(201).json({ message: "Account created! You can now log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Try again." });
  }
});
// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    // 1. Find the user by email
    const [rows] = await db.query(
      "SELECT id, full_name, password_hash, role FROM users WHERE email = ?",
      [email]
    );
    const user = rows[0];

    // 2. Check the password
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // 3. Remember the user in the session (give them the wristband)
    req.session.userId = user.id;
    req.session.role = user.role;

    res.json({ message: "Logged in!", user: { id: user.id, full_name: user.full_name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Try again." });
  }
});

// GET /api/auth/me — who is logged in?
router.get("/me", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not logged in." });
  }

  const [rows] = await db.query(
    "SELECT id, full_name, email, role, is_verified FROM users WHERE id = ?",
    [req.session.userId]
  );
  if (!rows[0]) {
    // The account was deleted, so the session is no longer valid
    return req.session.destroy(() => res.status(401).json({ error: "Not logged in." }));
  }
  res.json(rows[0]);
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out." });
  });
});

module.exports = router;