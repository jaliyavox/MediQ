const Review = require('../models/Review');
const Provider = require('../models/Provider');

// POST /api/providers/:id/reviews   (public)
exports.addReview = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({
      _id: req.params.id,
      status: 'approved',
      isBanned: { $ne: true },
    });
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

// GET /api/reviews/top - highest-rated public reviews, newest first for ties
exports.getTopReviews = async (req, res, next) => {
  try {
    const reviews = await Review.aggregate([
      {
        $lookup: {
          from: 'providers',
          localField: 'providerId',
          foreignField: '_id',
          as: 'provider',
        },
      },
      { $unwind: '$provider' },
      {
        $match: {
          'provider.status': 'approved',
          'provider.isBanned': { $ne: true },
        },
      },
      { $sort: { rating: -1, createdAt: -1 } },
      { $limit: 6 },
      {
        $project: {
          _id: 1,
          patientName: 1,
          rating: 1,
          comment: 1,
          createdAt: 1,
          provider: { _id: 1, name: 1, role: 1, area: 1 },
        },
      },
    ]);
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
