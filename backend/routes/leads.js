const router = require('express').Router();
const { createLead, getMyLeads, updateLeadStatus } = require('../controllers/leadController');
const { validateLead } = require('../middleware/validateInput');
const requireProvider = require('../middleware/auth');

router.get('/mine', requireProvider, getMyLeads);
router.post('/', validateLead, createLead);
router.patch('/:id', requireProvider, updateLeadStatus);

module.exports = router;
