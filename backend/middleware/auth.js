// Verifies the "Authorization: Bearer <token>" header and puts the provider's
// id on req.providerId.
const jwt = require('jsonwebtoken');
const Provider = require('../models/Provider');

module.exports = async function requireProvider(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Please log in to continue.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.kind === 'admin') throw new Error('Wrong token type');

    const provider = await Provider.findById(payload.id);
    if (!provider) return res.status(401).json({ message: 'Account not found.' });
    if (provider.isBanned) {
      return res.status(403).json({ message: 'This account has been suspended by an administrator.' });
    }

    req.providerId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Your session expired. Please log in again.' });
  }
};
