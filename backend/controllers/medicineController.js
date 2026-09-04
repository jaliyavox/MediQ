const Medicine = require('../models/Medicine');

// GET /api/medicines?q=para
// Must return: [{ _id, name, category }]
exports.listMedicines = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.q) filter.name = new RegExp(req.query.q, 'i');

    const medicines = await Medicine.find(filter).sort({ name: 1 });
    res.json(medicines);
  } catch (err) {
    next(err);
  }
};
