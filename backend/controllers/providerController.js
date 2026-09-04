const mongoose = require('mongoose');
const Provider = require('../models/Provider');
const Review = require('../models/Review');

// A patient typing "Dr(" would otherwise be interpolated straight into a
// RegExp and throw "Unterminated group", crashing the search with a 500.
// Escape every regex metacharacter before building a pattern from user input.
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Attaches avgRating + reviewCount to a set of providers in ONE query,
// instead of a query per provider. Requirement 6's "calculate" lives here.
async function withRatings(providers) {
  const ids = providers.map((p) => p._id);

  const stats = await Review.aggregate([
    { $match: { providerId: { $in: ids } } },
    { $group: { _id: '$providerId', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const byProvider = new Map(stats.map((s) => [String(s._id), s]));

  return providers.map((p) => {
    const s = byProvider.get(String(p._id));
    return {
      ...p.toJSON(),
      avgRating: s ? Math.round(s.avg * 10) / 10 : null,
      reviewCount: s ? s.count : 0,
    };
  });
}

// GET /api/providers?role=doctor&area=Kandy&specialization=Cardiology&q=perera
exports.listProviders = async (req, res, next) => {
  try {
    const { role, area, district, specialization, q } = req.query;
    const filter = { status: 'approved', isBanned: { $ne: true } };

    if (role) filter.role = role;
    if (area) filter.area = new RegExp(`^${escapeRegex(area)}$`, 'i');
    if (district) filter.district = new RegExp(`^${escapeRegex(district)}$`, 'i');
    if (specialization) filter.specialization = new RegExp(escapeRegex(specialization), 'i');
    if (q) filter.name = new RegExp(escapeRegex(q), 'i');

    const providers = await Provider.find(filter).sort({ name: 1 });
    res.json(await withRatings(providers));
  } catch (err) {
    next(err);
  }
};

// GET /api/providers/:id
exports.getProvider = async (req, res, next) => {
  try {
    // A hand-typed or stale URL gives a malformed id; treat it as not-found
    // rather than letting Mongoose throw a CastError into a 500.
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Not found.' });
    }
    const provider = await Provider.findOne({
      _id: req.params.id,
      status: 'approved',
      isBanned: { $ne: true },
    });
    if (!provider) return res.status(404).json({ message: 'Not found.' });

    const [withRating] = await withRatings([provider]);
    res.json(withRating);
  } catch (err) {
    next(err);
  }
};

// GET /api/providers/meta/areas - powers the area dropdown without hardcoding
exports.getFilterOptions = async (req, res, next) => {
  try {
    const [areas, specializations] = await Promise.all([
      Provider.distinct('area', { status: 'approved', isBanned: { $ne: true } }),
      Provider.distinct('specialization', {
        role: 'doctor', status: 'approved', isBanned: { $ne: true },
      }),
    ]);
    res.json({
      areas: areas.filter(Boolean).sort(),
      specializations: specializations.filter(Boolean).sort(),
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/providers/me
exports.updateMyProfile = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.providerId);
    if (!provider) return res.status(404).json({ message: 'Account not found.' });

    const fields = ['name', 'email', 'area', 'district', 'contact', 'about'];
    if (provider.role === 'doctor') fields.push('specialization', 'fee');
    if (provider.role === 'pharmacy') fields.push('openHours');

    fields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        provider[field] = typeof req.body[field] === 'string'
          ? req.body[field].trim()
          : req.body[field];
      }
    });
    if (Object.prototype.hasOwnProperty.call(req.body, 'email')) {
      provider.email = provider.email.toLowerCase();
    }
    if (provider.role === 'doctor' && provider.fee === '') provider.fee = 0;

    await provider.save();
    res.json(provider);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: 'That email is already registered.',
        errors: { email: 'That email is already registered.' },
      });
    }
    next(err);
  }
};
