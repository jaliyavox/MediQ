const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    type: { type: String, enum: ['OPD', 'Hospital', 'Clinic'], default: 'OPD' },
    // People physically waiting who did not book through MediQ.
    // Booked tokens are added on top of this to get the live queue length.
    walkInQueue: { type: Number, default: 0, min: 0 },
    avgMinsPerPatient: { type: Number, default: 6, min: 1 },
    slots: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Clinic', clinicSchema);
