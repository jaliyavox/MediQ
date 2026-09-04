const router = require('express').Router();
const {
  listProviders, getProvider, getFilterOptions,
} = require('../controllers/providerController');
const { addReview, getReviews } = require('../controllers/reviewController');
const { validateReview } = require('../middleware/validateInput');

// Keep the static path above '/:id' or Express treats "meta" as an id.
router.get('/meta/filters', getFilterOptions);
router.get('/', listProviders);
router.get('/:id', getProvider);
router.get('/:id/reviews', getReviews);
router.post('/:id/reviews', validateReview, addReview);

module.exports = router;
