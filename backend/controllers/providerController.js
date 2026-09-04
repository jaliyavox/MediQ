const Provider = require('../models/Provider');
const Review = require('../models/Review');

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
    const filter = { status: 'approved' };

    if (role) filter.role = role;
    if (area) filter.area = new RegExp(`^${area}$`, 'i');
    if (district) filter.district = new RegExp(`^${district}$`, 'i');
    if (specialization) filter.specialization = new RegExp(specialization, 'i');
    if (q) filter.name = new RegExp(q, 'i');

    const providers = await Provider.find(filter).sort({ name: 1 });
    res.json(await withRatings(providers));
  } catch (err) {
    next(err);
  }
};

// GET /api/providers/:id
exports.getProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.id);
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
      Provider.distinct('area', { status: 'approved' }),
      Provider.distinct('specialization', { role: 'doctor', status: 'approved' }),
    ]);
    res.json({
      areas: areas.filter(Boolean).sort(),
      specializations: specializations.filter(Boolean).sort(),
    });
  } catch (err) {
    next(err);
  }
};
