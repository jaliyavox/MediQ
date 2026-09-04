// OWNER: Member A
// Verifies the "Authorization: Bearer <token>" header and puts the doctor's
// id on req.doctorId. Getting this subtly wrong is the usual time sink, so
// it is written out in full - use it, don't rewrite it.
const jwt = require('jsonwebtoken');

module.exports = function requireDoctor(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Please log in to continue.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.doctorId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Your session expired. Please log in again.' });
  }
};
