const Pharmacy = require('../models/Pharmacy');

// OWNER: Member C
//
// GET /api/pharmacies?area=Kandy&q=osu
// Must return: [{ _id, name, area, district, contact }]
exports.listPharmacies = async (req, res, next) => {
  try {
    const { area, district, q } = req.query;
    const filter = {};

    if (area) filter.area = new RegExp(`^${area}$`, 'i');
    if (district) filter.district = new RegExp(`^${district}$`, 'i');
    if (q) filter.name = new RegExp(q, 'i');

    const pharmacies = await Pharmacy.find(filter).sort({ name: 1 });
    res.json(pharmacies);
  } catch (err) {
    next(err);
  }
};
