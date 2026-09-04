const router = require('express').Router();
const { getMyReviews } = require('../controllers/reviewController');
const requireProvider = require('../middleware/auth');

router.get('/mine', requireProvider, getMyReviews);

module.exports = router;
