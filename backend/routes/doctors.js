const router = require('express').Router();
const { listDoctors, getDoctor } = require('../controllers/doctorController');
const { addReview, getReviews } = require('../controllers/reviewController');

router.get('/', listDoctors);
router.get('/:id', getDoctor);
router.get('/:id/reviews', getReviews);
router.post('/:id/reviews', addReview);

module.exports = router;
