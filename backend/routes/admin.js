const router = require('express').Router();
const {
  login,
  me,
  listProviders,
  setProviderBan,
  listReviews,
  deleteReview,
} = require('../controllers/adminController');
const { validateLogin } = require('../middleware/validateInput');
const requireAdmin = require('../middleware/adminAuth');

router.post('/login', validateLogin, login);

router.use(requireAdmin);
router.get('/me', me);
router.get('/providers', listProviders);
router.patch('/providers/:id/ban', setProviderBan);
router.get('/reviews', listReviews);
router.delete('/reviews/:id', deleteReview);

module.exports = router;
