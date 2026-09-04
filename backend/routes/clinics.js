const router = require('express').Router();
const { listClinics, getClinic } = require('../controllers/clinicController');

router.get('/', listClinics);
router.get('/:id', getClinic);

module.exports = router;
