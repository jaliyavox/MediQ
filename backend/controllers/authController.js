const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Provider = require('../models/Provider');

function signToken(provider) {
  return jwt.sign({ id: provider._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { role, name, email, password, area, district, contact, about,
            specialization, fee, openHours } = req.body;

    const existing = await Provider.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({
        message: 'That email is already registered.',
        errors: { email: 'That email is already registered.' },
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const provider = await Provider.create({
      role,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      area: area.trim(),
      district: district?.trim(),
      contact: contact?.trim(),
      about: about?.trim(),
      ...(role === 'doctor'
        ? { specialization: specialization.trim(), fee: fee ? Number(fee) : 0 }
        : { openHours: openHours?.trim() }),
    });

    res.status(201).json({ token: signToken(provider), provider });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const provider = await Provider.findOne({ email: email.trim().toLowerCase() });

    // Deliberately the SAME message for an unknown email and a wrong password,
    // so the form cannot be used to discover which accounts exist.
    const reject = () => res.status(401).json({ message: 'Invalid email or password.' });

    if (!provider) return reject();

    const ok = await bcrypt.compare(password, provider.passwordHash);
    if (!ok) return reject();

    res.json({ token: signToken(provider), provider });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me   (behind requireProvider)
exports.me = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.providerId);
    if (!provider) return res.status(404).json({ message: 'Account not found.' });
    res.json(provider);
  } catch (err) {
    next(err);
  }
};
