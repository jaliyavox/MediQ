const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    contact: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pharmacy', pharmacySchema);
