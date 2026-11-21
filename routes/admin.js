const express = require("express");
const db = require("../db");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();
router.use(requireAdmin); // every route in this file is admin-only

// GET /api/admin/stats — numbers for the overview (also your validation metrics)
router.get("/stats", async (req, res) => {
  const [[users]] = await db.query(
    "SELECT COUNT(*) AS total, SUM(is_verified) AS verified FROM users"
  );
  const [[services]] = await db.query(
    "SELECT COUNT(*) AS total, SUM(status = 'active') AS active FROM services"
  );
  const [jobs] = await db.query("SELECT status, COUNT(*) AS n FROM jobs GROUP BY status");
  const [[reports]] = await db.query("SELECT COUNT(*) AS open FROM reports WHERE status = 'open'");
  const [[reviews]] = await db.query("SELECT COUNT(*) AS total, ROUND(AVG(rating), 1) AS avg FROM reviews");

  res.json({
    users: { total: users.total, verified: Number(users.verified) || 0 },
    services: { total: services.total, active: Number(services.active) || 0 },
    jobs: Object.fromEntries(jobs.map((j) => [j.status, j.n])),
    open_reports: reports.open,
    reviews: { total: reviews.total, avg: reviews.avg },
  });
});

// GET /api/admin/users
router.get("/users", async (req, res) => {
  const [rows] = await db.query(
    `SELECT u.id, u.full_name, u.email, u.role, u.is_verified, u.created_at, p.school
     FROM users u LEFT JOIN profiles p ON p.user_id = u.id
     ORDER BY u.is_verified ASC, u.created_at DESC`
  );
  res.json(rows);
});

// PATCH /api/admin/users/:id — verify or un-verify a student
router.patch("/users/:id", async (req, res) => {
  const isVerified = req.body.is_verified ? 1 : 0;
  const [result] = await db.query("UPDATE users SET is_verified = ? WHERE id = ?", [
    isVerified,
    req.params.id,
  ]);
  if (result.affectedRows === 0) return res.status(404).json({ error: "User not found." });
  res.json({ message: isVerified ? "Student verified." : "Verification removed." });
});

// GET /api/admin/services — every listing, including paused ones
router.get("/services", async (req, res) => {
  const [rows] = await db.query(
    `SELECT s.id, s.title, s.price, s.price_type, s.status, s.created_at,
            c.name AS category, u.full_name AS provider_name, u.id AS provider_id
     FROM services s
     JOIN categories c ON c.id = s.category_id
     JOIN users u ON u.id = s.provider_id
     ORDER BY s.created_at DESC`
  );
  res.json(rows);
});

// PATCH /api/admin/services/:id — pause (hide) or re-activate any listing
router.patch("/services/:id", async (req, res) => {
  const { status } = req.body;
  if (!["active", "paused"].includes(status)) {
    return res.status(400).json({ error: "Status must be active or paused." });
  }
  const [result] = await db.query("UPDATE services SET status = ? WHERE id = ?", [status, req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ error: "Service not found." });
  res.json({ message: status === "paused" ? "Listing hidden." : "Listing is live again." });
});

// GET /api/admin/reports
router.get("/reports", async (req, res) => {
  const [rows] = await db.query(
    `SELECT r.id, r.target_type, r.target_id, r.reason, r.status, r.admin_note, r.created_at,
            u.full_name AS reporter_name,
            CASE r.target_type
              WHEN 'service' THEN (SELECT title FROM services WHERE id = r.target_id)
              ELSE (SELECT full_name FROM users WHERE id = r.target_id)
            END AS target_name
     FROM reports r JOIN users u ON u.id = r.reporter_id
     ORDER BY (r.status = 'open') DESC, r.created_at DESC`
  );
  res.json(rows);
});

// PATCH /api/admin/reports/:id — resolve or dismiss a report
router.patch("/reports/:id", async (req, res) => {
  const { status, admin_note } = req.body;
  if (!["open", "resolved", "dismissed"].includes(status)) {
    return res.status(400).json({ error: "Invalid status." });
  }
  const [result] = await db.query("UPDATE reports SET status = ?, admin_note = ? WHERE id = ?", [
    status,
    admin_note || null,
    req.params.id,
  ]);
  if (result.affectedRows === 0) return res.status(404).json({ error: "Report not found." });
  res.json({ message: "Report updated." });
});

// POST /api/admin/categories — add a new category
router.post("/categories", async (req, res) => {
  const name = (req.body.name || "").trim();
  if (!name || name.length > 100) {
    return res.status(400).json({ error: "Category name is required (max 100 characters)." });
  }
  const [existing] = await db.query("SELECT id FROM categories WHERE name = ?", [name]);
  if (existing.length) return res.status(409).json({ error: "That category already exists." });
  await db.query("INSERT INTO categories (name) VALUES (?)", [name]);
  res.status(201).json({ message: "Category added." });
});

module.exports = router;
