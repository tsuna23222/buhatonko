function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Please log in first." });
  }
  next(); // logged in → continue to the route
}

module.exports = requireLogin;