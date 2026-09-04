// A Provider is anyone who lists themselves on MediQ - a doctor or a pharmacy.
// One model with a `role` field, so both sides share the same login,
// the same lead inbox and the same review system.
const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['doctor', 'pharmacy'], required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Never store the plain password. authController hashes it with bcrypt.
    passwordHash: { type: String, required: true },

    area: { type: String, required: true, trim: true },
    district: { type: String, trim: true },
    contact: { type: String, trim: true },
    about: { type: String, trim: true, maxlength: 400 },

    // Doctors only
    specialization: { type: String, trim: true },
    fee: { type: Number, min: 0 },

    // Pharmacies only
    openHours: { type: String, trim: true },

    status: { type: String, enum: ['pending', 'approved'], default: 'approved' },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String, trim: true, maxlength: 300, default: '' },
    bannedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Make sure the hash can never leak through an API response.
providerSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

providerSchema.index({ role: 1, area: 1 });

module.exports = mongoose.model('Provider', providerSchema);
