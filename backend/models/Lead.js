// A lead is a patient reaching out to a listed provider:
// a consultation request to a doctor, or a medicine enquiry to a pharmacy.
const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
    patientName: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    // Only used when the provider is a pharmacy.
    medicineName: { type: String, trim: true },
    note: { type: String, trim: true, maxlength: 500 },
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', leadSchema);
