const router = require('express').Router();
const { register, login, me } = require('../controllers/authController');
const requireDoctor = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireDoctor, me);

module.exports = router;
