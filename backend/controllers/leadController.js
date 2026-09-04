// OWNER: Member A
const Lead = require('../models/Lead');

const TODO = (res, what) =>
  res.status(501).json({ message: `Not implemented yet: ${what} (Member A)` });

// POST /api/leads   (public - a patient sends this)
// body: { doctorId, patientName, contactNumber, note }
// Reuse the phone rule from middleware/validateInput.js so the error
// messages match the booking form.
exports.createLead = async (req, res, next) => {
  TODO(res, 'POST /api/leads');
};

// GET /api/leads/mine   (behind requireDoctor)
// Return ONLY leads where doctorId === req.doctorId - never trust a
// doctorId sent from the client here, or any doctor could read another
// doctor's patient contacts.
exports.getMyLeads = async (req, res, next) => {
  TODO(res, 'GET /api/leads/mine');
};
