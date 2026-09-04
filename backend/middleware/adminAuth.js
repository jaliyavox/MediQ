const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

module.exports = async function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Admin login required.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.kind !== 'admin') throw new Error('Wrong token type');

    const admin = await Admin.findById(payload.id);
    if (!admin) return res.status(401).json({ message: 'Admin account not found.' });

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Your admin session expired. Please log in again.' });
  }
};
