const express = require("express");
const db = require("../db");
const requireLogin = require("../middleware/requireLogin");

const router = express.Router();

// POST /api/reports — flag a service or a student
router.post("/", requireLogin, async (req, res) => {
  const { target_type, target_id, reason } = req.body;

  if (!["service", "user"].includes(target_type) || !target_id) {
    return res.status(400).json({ error: "Invalid report." });
  }
  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: "Please give a reason." });
  }
  if (reason.length > 1000) {
    return res.status(400).json({ error: "Reason must be 1000 characters or less." });
  }

  await db.query(
    "INSERT INTO reports (reporter_id, target_type, target_id, reason) VALUES (?, ?, ?, ?)",
    [req.session.userId, target_type, target_id, reason.trim()]
  );
  res.status(201).json({ message: "Thanks. An admin will review this report." });
});

module.exports = router;
