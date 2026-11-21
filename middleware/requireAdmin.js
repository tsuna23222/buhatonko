const db = require("../db");

// Only lets admins through. Checks the database (not just the session),
// so removing someone's admin role takes effect immediately.
async function requireAdmin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Please log in first." });
  }
  const [rows] = await db.query("SELECT role FROM users WHERE id = ?", [req.session.userId]);
  if (!rows[0] || rows[0].role !== "admin") {
    return res.status(403).json({ error: "Admins only." });
  }
  next();
}

module.exports = requireAdmin;
