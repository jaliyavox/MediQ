// OWNER: Member A
const Review = require('../models/Review');

const TODO = (res, what) =>
  res.status(501).json({ message: `Not implemented yet: ${what} (Member A)` });

// POST /api/doctors/:id/reviews   (public)
// body: { patientName, rating, comment }
// Validate rating is a whole number 1-5 and patientName is present.
exports.addReview = async (req, res, next) => {
  TODO(res, 'POST /api/doctors/:id/reviews');
};

// GET /api/doctors/:id/reviews  -> newest first
exports.getReviews = async (req, res, next) => {
  TODO(res, 'GET /api/doctors/:id/reviews');
};
