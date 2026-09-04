require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDatabase } = require('../config/database');
const Admin = require('../models/Admin');

async function seedAdmin() {
  const name = process.env.ADMIN_NAME || 'MediQ Admin';
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password || password === 'replace_with_a_private_password') {
    throw new Error('Set ADMIN_EMAIL and a private ADMIN_PASSWORD in backend/.env first.');
  }
  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters.');
  }

  await connectDatabase();
  const passwordHash = await bcrypt.hash(password, 10);
  await Admin.findOneAndUpdate(
    { email },
    { name, email, passwordHash },
    { upsert: true, new: true, runValidators: true }
  );

  console.log(`Admin account ready: ${email}. The password was not printed.`);
  await mongoose.disconnect();
}

seedAdmin().catch(async (err) => {
  console.error('Admin seed failed:', err.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});
