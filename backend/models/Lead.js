// OWNER: Member A
// A "lead" is a patient asking a listed doctor for a consultation.
const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patientName: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    note: { type: String, trim: true },
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', leadSchema);
