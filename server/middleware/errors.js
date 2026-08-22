function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(error, req, res, next) {
  if (error.code === 11000) return res.status(409).json({ error: 'A record with that unique value already exists' });
  if (error.name === 'ValidationError' || error.name === 'CastError') return res.status(400).json({ error: error.message });
  console.error(error);
  return res.status(500).json({ error: 'Internal server error' });
}

module.exports = { notFound, errorHandler };
