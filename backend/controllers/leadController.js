const Lead = require('../models/Lead');
const Provider = require('../models/Provider');

// POST /api/leads   (public - a patient sends this)
exports.createLead = async (req, res, next) => {
  try {
    const { providerId, patientName, contactNumber, medicineName, note } = req.body;

    const provider = await Provider.findById(providerId);
    if (!provider) return res.status(404).json({ message: 'That listing no longer exists.' });

    // A pharmacy enquiry is meaningless without naming the medicine.
    if (provider.role === 'pharmacy' && !medicineName?.trim()) {
      return res.status(400).json({
        message: 'Please fix the highlighted fields.',
        errors: { medicineName: 'Please enter the medicine you need.' },
      });
    }
    // A doctor enquiry is meaningless without naming the patient.

    const lead = await Lead.create({
      providerId,
      patientName: patientName.trim(),
      contactNumber: contactNumber.trim(),
      medicineName: medicineName?.trim(),
      note: note?.trim(),
    });
    // Send back the lead and a message to display to the patient.

    res.status(201).json({
      lead,
      providerName: provider.name,
      message:
        provider.role === 'pharmacy'
          ? `${provider.name} has your enquiry and will call you back.`
          : `${provider.name} has your request and will call you back.`,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/leads/mine   (behind requireProvider)
exports.getMyLeads = async (req, res, next) => {
  try {
    // Filtered on the id from the JWT, never on anything the client sent -
    // otherwise any provider could read another provider's patient contacts.
    const leads = await Lead.find({ providerId: req.providerId }).sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/leads/:id   (behind requireProvider) - mark contacted/closed
exports.updateLeadStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['new', 'contacted', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, providerId: req.providerId }, // scoped to the owner
      { status },
      { returnDocument: 'after' }
    );
    if (!lead) return res.status(404).json({ message: 'Lead not found.' });

    res.json(lead);
  } catch (err) {
    next(err);
  }
};
