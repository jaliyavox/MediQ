const router = require('express').Router();
const { searchStock } = require('../controllers/stockController');

router.get('/', searchStock);

module.exports = router;
