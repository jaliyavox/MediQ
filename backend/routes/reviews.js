const router = require('express').Router();
const { getMyReviews, getTopReviews } = require('../controllers/reviewController');
const requireProvider = require('../middleware/auth');

router.get('/top', getTopReviews);
router.get('/mine', requireProvider, getMyReviews);

module.exports = router;
