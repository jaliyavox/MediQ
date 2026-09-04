// OWNER: Member A
// Doctor registration and login with bcrypt + JWT.
// These are stubs on purpose - this is your part to write.
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');

const TODO = (res, what) =>
  res.status(501).json({ message: `Not implemented yet: ${what} (Member A)` });

// Helper you will need in both register and login.
function signToken(doctor) {
  return jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register
// body: { name, email, password, specialization, area, district, fee }
// Steps: validate the fields -> reject a duplicate email with 409
//        -> hash with bcrypt.hash(password, 10) -> Doctor.create
//        -> res.status(201).json({ token: signToken(doc), doctor: doc })
exports.register = async (req, res, next) => {
  TODO(res, 'POST /api/auth/register');
};

// POST /api/auth/login
// body: { email, password }
// Steps: find the doctor by email -> bcrypt.compare(password, doctor.passwordHash)
//        -> on failure return 401 with ONE message for both wrong email and
//           wrong password ("Invalid email or password"), so the form does not
//           reveal which accounts exist
//        -> on success res.json({ token: signToken(doctor), doctor })
exports.login = async (req, res, next) => {
  TODO(res, 'POST /api/auth/login');
};

// GET /api/auth/me   (behind requireDoctor, so req.doctorId is set)
// -> the Doctor document (the model already strips passwordHash)
exports.me = async (req, res, next) => {
  TODO(res, 'GET /api/auth/me');
};
