// OWNER: Member A
const Doctor = require('../models/Doctor');
const Review = require('../models/Review');

const TODO = (res, what) =>
  res.status(501).json({ message: `Not implemented yet: ${what} (Member A)` });

// GET /api/doctors?specialization=Cardiology&area=Kandy&q=perera
// Only return status: 'approved' doctors.
// Attach avgRating and reviewCount - use the same aggregate pattern as
// withLiveQueue() in clinicController.js, it is the closest working example.
// -> [{ _id, name, specialization, area, district, fee, avgRating, reviewCount }]
exports.listDoctors = async (req, res, next) => {
  TODO(res, 'GET /api/doctors');
};

// GET /api/doctors/:id  -> one doctor + avgRating + reviewCount
exports.getDoctor = async (req, res, next) => {
  TODO(res, 'GET /api/doctors/:id');
};
