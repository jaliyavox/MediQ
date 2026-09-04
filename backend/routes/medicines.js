const router = require('express').Router();
const { listMedicines } = require('../controllers/medicineController');

router.get('/', listMedicines);

module.exports = router;
