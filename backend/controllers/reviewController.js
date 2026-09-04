const Review = require('../models/Review');
const Provider = require('../models/Provider');

// POST /api/providers/:id/reviews   (public)
exports.addReview = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ message: 'That listing no longer exists.' });

    const review = await Review.create({
      providerId: req.params.id,
      patientName: req.body.patientName.trim(),
      rating: Number(req.body.rating),
      comment: req.body.comment?.trim(),
    });

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

// GET /api/providers/:id/reviews  - newest first
exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ providerId: req.params.id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

// GET /api/reviews/mine  (behind requireProvider)
exports.getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ providerId: req.providerId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};
