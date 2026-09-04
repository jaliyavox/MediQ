const router = require('express').Router();
const { bookToken, listTokens } = require('../controllers/tokenController');
const { validateTokenBooking } = require('../middleware/validateInput');

router.get('/', listTokens);
router.post('/', validateTokenBooking, bookToken);

module.exports = router;
