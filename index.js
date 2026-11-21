// 1. Load packages (dotenv FIRST)
require("dotenv").config();
const express = require("express");
const session = require("express-session");

// 2. Load route files
const testRoutes = require("./routes/test");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const serviceRoutes = require("./routes/services");
const jobRoutes = require("./routes/jobs");

// 3. Create the app
const app = express();
const PORT = process.env.PORT || 3000;

// 4. Middleware
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,                  // JavaScript in the page can't read the cookie
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days, in milliseconds
    },
  })
);
app.use(express.static("public"));

// 5. API routes
app.use("/api", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/jobs", jobRoutes);

// Unknown API URL → JSON 404 (instead of an HTML page)
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found." });
});

// Error handler: if any route throws an error, reply with JSON instead of crashing.
// It must have 4 parameters (err, req, res, next) so Express knows it handles errors.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong. Try again." });
});

// 6. Start the server — always LAST
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
