const express = require("express");
const db = require("../db");
const requireLogin = require("../middleware/requireLogin");

const router = express.Router();

const DELIVERY_MODES = ["online", "in_person", "both"];
const PRICE_TYPES = ["fixed", "starting"];

// Checks the service form. Returns an error message, or null if everything is OK.
function validateService(body) {
  const { title, description, category_id, price, price_type, delivery_days, delivery_mode } = body;
  if (!title || !description || !category_id || price === undefined || price === "") {
    return "Title, description, category and price are required.";
  }
  if (title.length > 120) return "Title must be 120 characters or less.";
  if (isNaN(price) || Number(price) < 0) return "Price must be a positive number.";
  if (delivery_days && (isNaN(delivery_days) || Number(delivery_days) < 1)) {
    return "Delivery time must be at least 1 day.";
  }
  if (price_type && !PRICE_TYPES.includes(price_type)) return "Invalid price type.";
  if (delivery_mode && !DELIVERY_MODES.includes(delivery_mode)) return "Invalid delivery mode.";
  return null;
}

// GET /api/services/categories
router.get("/categories", async (req, res) => {
  const [rows] = await db.query("SELECT id, name FROM categories ORDER BY id");
  res.json(rows);
});

// GET /api/services?q=logo&category=1&max_price=500&mode=online
// Browse and search active services
router.get("/", async (req, res) => {
  const { q, category, max_price, mode, limit } = req.query;

  let sql = `
    SELECT s.id, s.title, s.price, s.price_type, s.delivery_days, s.delivery_mode,
           c.name AS category, u.id AS provider_id, u.full_name AS provider_name,
           u.is_verified,
           (SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.reviewee_id = u.id) AS rating,
           (SELECT COUNT(*) FROM reviews r WHERE r.reviewee_id = u.id) AS review_count
    FROM services s
    JOIN categories c ON c.id = s.category_id
    JOIN users u ON u.id = s.provider_id
    WHERE s.status = 'active'`;
  const params = [];

  if (q) {
    sql += " AND (s.title LIKE ? OR s.description LIKE ?)";
    params.push(`%${q}%`, `%${q}%`);
  }
  if (category) {
    sql += " AND s.category_id = ?";
    params.push(category);
  }
  if (max_price) {
    sql += " AND s.price <= ?";
    params.push(max_price);
  }
  if (mode && DELIVERY_MODES.includes(mode)) {
    sql += " AND (s.delivery_mode = ? OR s.delivery_mode = 'both')";
    params.push(mode);
  }

  sql += " ORDER BY s.created_at DESC LIMIT ?";
  params.push(Math.min(Number(limit) || 50, 100));

  const [rows] = await db.query(sql, params);
  res.json(rows);
});

// GET /api/services/mine — services I offer (including paused ones)
router.get("/mine", requireLogin, async (req, res) => {
  const [rows] = await db.query(
    `SELECT s.id, s.title, s.price, s.price_type, s.status, c.name AS category
     FROM services s JOIN categories c ON c.id = s.category_id
     WHERE s.provider_id = ? ORDER BY s.created_at DESC`,
    [req.session.userId]
  );
  res.json(rows);
});

// GET /api/services/:id — one service with its provider and reviews
router.get("/:id", async (req, res) => {
  const [rows] = await db.query(
    `SELECT s.*, c.name AS category, u.full_name AS provider_name, u.is_verified,
            p.school, p.avatar_url, p.skills
     FROM services s
     JOIN categories c ON c.id = s.category_id
     JOIN users u ON u.id = s.provider_id
     LEFT JOIN profiles p ON p.user_id = u.id
     WHERE s.id = ?`,
    [req.params.id]
  );
  const service = rows[0];

  // Paused services are only visible to their owner
  if (!service || (service.status === "paused" && service.provider_id !== req.session.userId)) {
    return res.status(404).json({ error: "Service not found." });
  }

  const [reviews] = await db.query(
    `SELECT r.rating, r.comment, r.created_at, u.full_name AS reviewer_name
     FROM reviews r
     JOIN jobs j ON j.id = r.job_id
     JOIN users u ON u.id = r.reviewer_id
     WHERE j.service_id = ? ORDER BY r.created_at DESC`,
    [req.params.id]
  );

  service.reviews = reviews;
  service.is_owner = service.provider_id === req.session.userId;
  res.json(service);
});

// POST /api/services — create a service
router.post("/", requireLogin, async (req, res) => {
  const error = validateService(req.body);
  if (error) return res.status(400).json({ error });

  const { title, description, category_id, price, price_type, delivery_days, delivery_mode } = req.body;
  const [result] = await db.query(
    `INSERT INTO services
       (provider_id, category_id, title, description, price, price_type, delivery_days, delivery_mode)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.session.userId, category_id, title, description, price,
      price_type || "starting", delivery_days || 3, delivery_mode || "online",
    ]
  );
  res.status(201).json({ message: "Service published!", id: result.insertId });
});

// PUT /api/services/:id — edit my service
router.put("/:id", requireLogin, async (req, res) => {
  const error = validateService(req.body);
  if (error) return res.status(400).json({ error });

  const { title, description, category_id, price, price_type, delivery_days, delivery_mode } = req.body;
  // "AND provider_id = ?" makes sure you can only edit YOUR OWN service
  const [result] = await db.query(
    `UPDATE services
     SET title = ?, description = ?, category_id = ?, price = ?, price_type = ?,
         delivery_days = ?, delivery_mode = ?
     WHERE id = ? AND provider_id = ?`,
    [
      title, description, category_id, price, price_type || "starting",
      delivery_days || 3, delivery_mode || "online", req.params.id, req.session.userId,
    ]
  );
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: "Service not found." });
  }
  res.json({ message: "Service updated!" });
});

// PATCH /api/services/:id/status — pause or re-activate my service
router.patch("/:id/status", requireLogin, async (req, res) => {
  const { status } = req.body;
  if (!["active", "paused"].includes(status)) {
    return res.status(400).json({ error: "Status must be active or paused." });
  }
  const [result] = await db.query(
    "UPDATE services SET status = ? WHERE id = ? AND provider_id = ?",
    [status, req.params.id, req.session.userId]
  );
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: "Service not found." });
  }
  res.json({ message: status === "paused" ? "Service paused." : "Service is live again." });
});

module.exports = router;
