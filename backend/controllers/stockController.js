const Stock = require('../models/Stock');
const Medicine = require('../models/Medicine');

// OWNER: Member C
//
// GET /api/stock?medicine=Paracetamol&area=Kandy
//
// Searches by medicine NAME (not id) so the user can just type a medicine:
// find matching medicines by name -> find stock rows for those ids
// -> populate pharmacy -> filter by area -> shape the response.
//
// Must return:
// [{ pharmacyName, area, district, contact, medicineName, quantity, inStock, updatedAt }]
exports.searchStock = async (req, res, next) => {
  try {
    const { medicine, area } = req.query;

    if (!medicine || !medicine.trim()) {
      return res.status(400).json({ message: 'Please enter a medicine name to search.' });
    }

    const medicines = await Medicine.find({ name: new RegExp(medicine.trim(), 'i') });
    if (medicines.length === 0) return res.json([]);

    const rows = await Stock.find({ medicineId: { $in: medicines.map((m) => m._id) } })
      .populate('pharmacyId')
      .populate('medicineId')
      .sort({ quantity: -1 });

    const results = rows
      .filter((r) => r.pharmacyId)
      .filter((r) => !area || new RegExp(`^${area}$`, 'i').test(r.pharmacyId.area))
      .map((r) => ({
        pharmacyName: r.pharmacyId.name,
        area: r.pharmacyId.area,
        district: r.pharmacyId.district,
        contact: r.pharmacyId.contact,
        medicineName: r.medicineId.name,
        quantity: r.quantity,
        inStock: r.quantity > 0,
        updatedAt: r.updatedAt,
      }));

    res.json(results);
  } catch (err) {
    next(err);
  }
};
