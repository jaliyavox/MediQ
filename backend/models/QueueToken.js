const mongoose = require('mongoose');

const queueTokenSchema = new mongoose.Schema(
  {
    patientName: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    nic: { type: String, required: true, trim: true },
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    slotTime: { type: String, required: true },
    tokenNumber: { type: Number, required: true },
    status: {
      type: String,
      enum: ['booked', 'served', 'cancelled'],
      default: 'booked',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('QueueToken', queueTokenSchema);
