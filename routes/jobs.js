const express = require("express");
const db = require("../db");
const requireLogin = require("../middleware/requireLogin");

const router = express.Router();
router.use(requireLogin); // every job route needs a logged-in user

// Which status changes are allowed, and by whom.
// Example: a provider can move a job from "requested" to "accepted" or "declined".
const TRANSITIONS = {
  provider: {
    requested: ["accepted", "declined"],
    accepted: ["in_progress"],
    in_progress: ["submitted"],
  },
  customer: {
    requested: ["cancelled"],
    accepted: ["cancelled"],
    submitted: ["completed", "in_progress"], // in_progress = ask for changes
  },
};

// Loads a job and checks that the current user is part of it.
async function loadJob(jobId, userId) {
  const [rows] = await db.query(
    `SELECT j.*, s.title AS service_title,
            c.full_name AS customer_name, p.full_name AS provider_name
     FROM jobs j
     JOIN services s ON s.id = j.service_id
     JOIN users c ON c.id = j.customer_id
     JOIN users p ON p.id = j.provider_id
     WHERE j.id = ?`,
    [jobId]
  );
  const job = rows[0];
  if (!job) return null;
  if (job.customer_id !== userId && job.provider_id !== userId) return null;
  job.my_role = job.customer_id === userId ? "customer" : "provider";
  return job;
}

// POST /api/jobs — request a service
router.post("/", async (req, res) => {
  const { service_id, brief, budget, deadline } = req.body;
  if (!service_id || !brief) {
    return res.status(400).json({ error: "Please describe what you need." });
  }
  if (brief.length > 3000) {
    return res.status(400).json({ error: "Brief must be 3000 characters or less." });
  }

  const [services] = await db.query(
    "SELECT id, provider_id FROM services WHERE id = ? AND status = 'active'",
    [service_id]
  );
  const service = services[0];
  if (!service) return res.status(404).json({ error: "Service not found." });
  if (service.provider_id === req.session.userId) {
    return res.status(400).json({ error: "You can't request your own service." });
  }

  const [result] = await db.query(
    `INSERT INTO jobs (service_id, customer_id, provider_id, brief, budget, deadline)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [service_id, req.session.userId, service.provider_id, brief, budget || null, deadline || null]
  );
  await db.query(
    "INSERT INTO job_status_history (job_id, status, changed_by) VALUES (?, 'requested', ?)",
    [result.insertId, req.session.userId]
  );

  res.status(201).json({ message: "Request sent!", id: result.insertId });
});

// GET /api/jobs/mine — jobs I requested, and jobs requested from me
router.get("/mine", async (req, res) => {
  const sql = `
    SELECT j.id, j.status, j.budget, j.deadline, j.created_at, s.title AS service_title,
           c.full_name AS customer_name, p.full_name AS provider_name
    FROM jobs j
    JOIN services s ON s.id = j.service_id
    JOIN users c ON c.id = j.customer_id
    JOIN users p ON p.id = j.provider_id
    WHERE j.%s = ?
    ORDER BY j.updated_at DESC`;

  const [asCustomer] = await db.query(sql.replace("%s", "customer_id"), [req.session.userId]);
  const [asProvider] = await db.query(sql.replace("%s", "provider_id"), [req.session.userId]);
  res.json({ as_customer: asCustomer, as_provider: asProvider });
});

// GET /api/jobs/:id — job details, history, messages and review
router.get("/:id", async (req, res) => {
  const job = await loadJob(req.params.id, req.session.userId);
  if (!job) return res.status(404).json({ error: "Job not found." });

  const [history] = await db.query(
    `SELECT h.status, h.changed_at, u.full_name AS changed_by_name
     FROM job_status_history h JOIN users u ON u.id = h.changed_by
     WHERE h.job_id = ? ORDER BY h.id`,
    [job.id]
  );
  const [messages] = await db.query(
    `SELECT m.id, m.body, m.created_at, m.sender_id, u.full_name AS sender_name
     FROM messages m JOIN users u ON u.id = m.sender_id
     WHERE m.job_id = ? ORDER BY m.id`,
    [job.id]
  );
  const [reviews] = await db.query(
    "SELECT rating, comment, created_at FROM reviews WHERE job_id = ?",
    [job.id]
  );

  job.history = history;
  job.messages = messages;
  job.review = reviews[0] || null;
  job.allowed_statuses = TRANSITIONS[job.my_role][job.status] || [];
  res.json(job);
});

// PATCH /api/jobs/:id/status — move the job to its next status
router.patch("/:id/status", async (req, res) => {
  const { status } = req.body;
  const job = await loadJob(req.params.id, req.session.userId);
  if (!job) return res.status(404).json({ error: "Job not found." });

  const allowed = TRANSITIONS[job.my_role][job.status] || [];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `You can't change this job from "${job.status}" to "${status}".` });
  }

  await db.query("UPDATE jobs SET status = ? WHERE id = ?", [status, job.id]);
  await db.query(
    "INSERT INTO job_status_history (job_id, status, changed_by) VALUES (?, ?, ?)",
    [job.id, status, req.session.userId]
  );
  res.json({ message: "Job updated." });
});

// POST /api/jobs/:id/messages — send a message in this job
router.post("/:id/messages", async (req, res) => {
  const { body } = req.body;
  if (!body || !body.trim()) return res.status(400).json({ error: "Message is empty." });
  if (body.length > 2000) return res.status(400).json({ error: "Message is too long." });

  const job = await loadJob(req.params.id, req.session.userId);
  if (!job) return res.status(404).json({ error: "Job not found." });

  await db.query(
    "INSERT INTO messages (job_id, sender_id, body) VALUES (?, ?, ?)",
    [job.id, req.session.userId, body.trim()]
  );
  res.status(201).json({ message: "Sent." });
});

// POST /api/jobs/:id/review — customer reviews a completed job (once)
router.post("/:id/review", async (req, res) => {
  const rating = Number(req.body.rating);
  const comment = req.body.comment || null;

  const job = await loadJob(req.params.id, req.session.userId);
  if (!job) return res.status(404).json({ error: "Job not found." });
  if (job.my_role !== "customer") {
    return res.status(403).json({ error: "Only the customer can leave a review." });
  }
  if (job.status !== "completed") {
    return res.status(400).json({ error: "You can only review a completed job." });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be from 1 to 5." });
  }

  const [existing] = await db.query("SELECT id FROM reviews WHERE job_id = ?", [job.id]);
  if (existing.length > 0) {
    return res.status(409).json({ error: "You already reviewed this job." });
  }

  await db.query(
    "INSERT INTO reviews (job_id, reviewer_id, reviewee_id, rating, comment) VALUES (?, ?, ?, ?, ?)",
    [job.id, req.session.userId, job.provider_id, rating, comment]
  );
  res.status(201).json({ message: "Thanks for your review!" });
});

module.exports = router;
