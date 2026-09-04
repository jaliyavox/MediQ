const router = require('express').Router();
const { createLead, getMyLeads } = require('../controllers/leadController');
const requireDoctor = require('../middleware/auth');

// Keep /mine above any ':id' route that gets added later.
router.get('/mine', requireDoctor, getMyLeads);
router.post('/', createLead);

module.exports = router;
