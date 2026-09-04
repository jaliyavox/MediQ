// Verifies the "Authorization: Bearer <token>" header and puts the provider's
// id on req.providerId.
const jwt = require('jsonwebtoken');

module.exports = function requireProvider(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Please log in to continue.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.providerId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Your session expired. Please log in again.' });
  }
};
