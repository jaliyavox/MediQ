const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Provider = require('../models/Provider');
const Review = require('../models/Review');

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function signToken(admin) {
  return jwt.sign(
    { id: admin._id, kind: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
}

// POST /api/admin/login
exports.login = async (req, res, next) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const admin = await Admin.findOne({ email });
    const reject = () => res.status(401).json({ message: 'Invalid admin email or password.' });

    if (!admin || !(await bcrypt.compare(req.body.password, admin.passwordHash))) {
      return reject();
    }

    res.json({ token: signToken(admin), admin });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/me
exports.me = (req, res) => res.json(req.admin);

// GET /api/admin/providers?role=doctor&q=perera
exports.listProviders = async (req, res, next) => {
  try {
    const filter = {};
    if (['doctor', 'pharmacy'].includes(req.query.role)) filter.role = req.query.role;
    if (req.query.q) filter.name = new RegExp(escapeRegex(req.query.q), 'i');

    const providers = await Provider.find(filter).sort({ isBanned: -1, name: 1 });
    res.json(providers);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/providers/:id/ban  body: { banned, reason? }
exports.setProviderBan = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Provider not found.' });
    }
    if (typeof req.body.banned !== 'boolean') {
      return res.status(400).json({ message: 'The banned field must be true or false.' });
    }

    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ message: 'Provider not found.' });

    provider.isBanned = req.body.banned;
    provider.bannedAt = req.body.banned ? new Date() : null;
    provider.banReason = req.body.banned ? req.body.reason?.trim() || '' : '';
    await provider.save();

    res.json(provider);
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/reviews?providerId=...
exports.listReviews = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.providerId) {
      if (!mongoose.isValidObjectId(req.query.providerId)) {
        return res.status(400).json({ message: 'Invalid provider filter.' });
      }
      filter.providerId = req.query.providerId;
    }

    const reviews = await Review.find(filter)
      .populate('providerId', 'name role area isBanned')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/reviews/:id
exports.deleteReview = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Review not found.' });
    }
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    res.json({ message: 'Review removed.' });
  } catch (err) {
    next(err);
  }
};
