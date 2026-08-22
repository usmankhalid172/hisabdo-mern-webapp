const jwt = require('jsonwebtoken');

function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;

  if (!token || !process.env.JWT_SECRET) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired admin token' });
  }
}

module.exports = { requireAdmin };
