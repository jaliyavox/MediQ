const router = require('express').Router();
const { listPharmacies } = require('../controllers/pharmacyController');

router.get('/', listPharmacies);

module.exports = router;
