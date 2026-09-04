const router = require('express').Router();
const { register, login, me } = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validateInput');
const requireProvider = require('../middleware/auth');

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.get('/me', requireProvider, me);

module.exports = router;
