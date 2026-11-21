const express = require("express");
const db = require("../db");
const requireLogin = require("../middleware/requireLogin");

const router = express.Router();

// GET /api/profile/me — my own profile (for the edit page)
router.get("/me", requireLogin, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT bio, skills, school, avatar_url FROM profiles WHERE user_id = ?",
      [req.session.userId]
    );
    res.json(rows[0] || {}); // empty object if no profile yet
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// PUT /api/profile/me — create or update my profile
router.put("/me", requireLogin, async (req, res) => {
  const { bio, skills, school, avatar_url } = req.body;

  if (bio && bio.length > 1000) {
    return res.status(400).json({ error: "Bio must be 1000 characters or less." });
  }

  try {
    await db.query(
      `INSERT INTO profiles (user_id, bio, skills, school, avatar_url)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         bio = VALUES(bio), skills = VALUES(skills),
         school = VALUES(school), avatar_url = VALUES(avatar_url)`,
      [req.session.userId, bio, skills, school, avatar_url]
    );
    res.json({ message: "Profile saved!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// GET /api/profile/:userId — anyone's public profile
router.get("/:userId", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.full_name, u.is_verified,
              p.bio, p.skills, p.school, p.avatar_url
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id = ?`,
      [req.params.userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Student not found." });
    }
    const profile = rows[0];

    // Their active services
    const [services] = await db.query(
      `SELECT s.id, s.title, s.price, s.price_type, c.name AS category
       FROM services s JOIN categories c ON c.id = s.category_id
       WHERE s.provider_id = ? AND s.status = 'active'
       ORDER BY s.created_at DESC`,
      [profile.id]
    );

    // Their reviews and stats
    const [reviews] = await db.query(
      `SELECT r.rating, r.comment, r.created_at, u.full_name AS reviewer_name
       FROM reviews r JOIN users u ON u.id = r.reviewer_id
       WHERE r.reviewee_id = ? ORDER BY r.created_at DESC`,
      [profile.id]
    );
    const [[stats]] = await db.query(
      "SELECT COUNT(*) AS completed_jobs FROM jobs WHERE provider_id = ? AND status = 'completed'",
      [profile.id]
    );

    profile.services = services;
    profile.reviews = reviews;
    profile.completed_jobs = stats.completed_jobs;
    profile.rating = reviews.length
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
      : null;
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

module.exports = router;