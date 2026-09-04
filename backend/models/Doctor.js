// OWNER: Member A
const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Never store the plain password. authController hashes it with bcrypt.
    passwordHash: { type: String, required: true },
    specialization: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    district: { type: String, trim: true },
    fee: { type: Number, default: 0, min: 0 },
    // Newly registered doctors are 'pending' until an admin approves them.
    // For the demo, seeded doctors are 'approved' so the list is not empty.
    status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
  },
  { timestamps: true }
);

// Make sure the hash can never leak through an API response.
doctorSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

module.exports = mongoose.model('Doctor', doctorSchema);
