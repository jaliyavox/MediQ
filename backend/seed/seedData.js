// Run with:  npm run seed
// Wipes the sample collections and reloads them, so it is safe to re-run.
//
// Every name here is FICTIONAL. The app shows public star ratings against a
// named person or business, so never seed or demo with a real practitioner
// or a real pharmacy.

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDatabase } = require('../config/database');

const Provider = require('../models/Provider');
const Lead = require('../models/Lead');
const Review = require('../models/Review');

// Every seeded account logs in with this password.
const DEMO_PASSWORD = 'mediq1234';

const doctors = [
  { name: 'Dr. Nimal Perera', email: 'nimal@mediq.demo', specialization: 'General Physician', area: 'Colombo', district: 'Colombo', fee: 2000, contact: '0771000001', about: 'Family medicine, 12 years at a government OPD.' },
  { name: 'Dr. Anoma Silva', email: 'anoma@mediq.demo', specialization: 'Cardiology', area: 'Colombo', district: 'Colombo', fee: 4500, contact: '0771000002', about: 'Consultant cardiologist. Channelling on weekday evenings.' },
  { name: 'Dr. Ruwan Jayasuriya', email: 'ruwan@mediq.demo', specialization: 'Paediatrics', area: 'Kandy', district: 'Kandy', fee: 3000, contact: '0771000003', about: 'Children up to 14 years.' },
  { name: 'Dr. Kumari Fernando', email: 'kumari@mediq.demo', specialization: 'Dermatology', area: 'Kandy', district: 'Kandy', fee: 3500, contact: '0771000004', about: 'Skin and allergy clinic.' },
  { name: 'Dr. Suresh Kumar', email: 'suresh@mediq.demo', specialization: 'General Physician', area: 'Jaffna', district: 'Jaffna', fee: 1800, contact: '0771000005', about: 'Walk-in consultations most mornings.' },
  { name: 'Dr. Malini Rajapaksha', email: 'malini@mediq.demo', specialization: 'Gynaecology', area: 'Galle', district: 'Galle', fee: 4000, contact: '0771000006', about: 'Maternal health and routine screening.' },
  { name: 'Dr. Tharindu Bandara', email: 'tharindu@mediq.demo', specialization: 'Orthopaedics', area: 'Kurunegala', district: 'Kurunegala', fee: 3800, contact: '0771000007', about: 'Fractures, joint pain, sports injuries.' },
  { name: 'Dr. Shanika Wijesinghe', email: 'shanika@mediq.demo', specialization: 'ENT', area: 'Matara', district: 'Matara', fee: 3200, contact: '0771000008', about: 'Ear, nose and throat.' },
];

const pharmacies = [
  { name: 'Senehasa Pharmacy', email: 'senehasa@mediq.demo', area: 'Colombo', district: 'Colombo', contact: '0112000001', openHours: '8am - 9pm daily', about: 'Full prescription counter, home delivery within 5km.' },
  { name: 'Nawaloka Medicals', email: 'nawaloka.med@mediq.demo', area: 'Colombo', district: 'Colombo', contact: '0112000002', openHours: '24 hours', about: 'Open around the clock, including channelled medicines.' },
  { name: 'Kandy City Pharmacy', email: 'kandycity@mediq.demo', area: 'Kandy', district: 'Kandy', contact: '0812000003', openHours: '8am - 8pm', about: 'Near the main bus stand.' },
  { name: 'Sisila Pharmacy', email: 'sisila@mediq.demo', area: 'Kandy', district: 'Kandy', contact: '0812000004', openHours: '9am - 7pm, closed Sunday', about: 'Diabetic and cardiac medicines usually in stock.' },
  { name: 'Jaffna Central Pharmacy', email: 'jaffnacentral@mediq.demo', area: 'Jaffna', district: 'Jaffna', contact: '0212000005', openHours: '8am - 8pm', about: 'Tamil and English speaking staff.' },
  { name: 'Fort Medicals', email: 'fortmed@mediq.demo', area: 'Galle', district: 'Galle', contact: '0912000006', openHours: '8:30am - 8pm', about: 'Inside the Fort, opposite the clock tower.' },
  { name: 'Ayubo Pharmacy', email: 'ayubo@mediq.demo', area: 'Kurunegala', district: 'Kurunegala', contact: '0372000007', openHours: '8am - 9pm', about: 'Ayurvedic and western medicines.' },
  { name: 'Ruhunu Pharmacy', email: 'ruhunu@mediq.demo', area: 'Matara', district: 'Matara', contact: '0412000008', openHours: '8am - 8pm', about: 'Free blood pressure checks.' },
];

const comments = {
  5: ['Very helpful and did not keep me waiting.', 'Explained everything clearly. Highly recommended.', 'Answered the phone immediately and had what I needed.'],
  4: ['Good service, slightly long wait.', 'Helpful staff, fair prices.', 'Got what I needed after a short wait.'],
  3: ['Consultation was fine, the wait was long.', 'Average experience, but they did call back.'],
};

async function seed() {
  await connectDatabase();
  console.log('Connected. Clearing old sample data...');

  await Promise.all([Provider.deleteMany({}), Lead.deleteMany({}), Review.deleteMany({})]);

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const savedProviders = await Provider.insertMany([
    ...doctors.map((d) => ({ ...d, role: 'doctor', passwordHash, status: 'approved' })),
    ...pharmacies.map((p) => ({ ...p, role: 'pharmacy', passwordHash, status: 'approved' })),
  ]);

  // Reviews, so the average rating has something real to calculate from.
  const ratingSets = [[5, 4, 5], [4, 4, 5], [5, 3, 4, 5], [3, 4], [5, 5], [4, 5, 4], [4, 3], [5, 4]];
  const reviews = [];
  savedProviders.forEach((provider, i) => {
    ratingSets[i % ratingSets.length].forEach((rating, j) => {
      reviews.push({
        providerId: provider._id,
        patientName: ['Kasun', 'Dilani', 'Ahmed', 'Priya', 'Sunil', 'Nadeesha'][j % 6],
        rating,
        comment: comments[rating][j % comments[rating].length],
      });
    });
  });
  await Review.insertMany(reviews);

  // A couple of leads so a demo login has something in its inbox.
  const firstDoctor = savedProviders.find((p) => p.role === 'doctor');
  const firstPharmacy = savedProviders.find((p) => p.role === 'pharmacy');
  await Lead.insertMany([
    { providerId: firstDoctor._id, patientName: 'Chamara Perera', contactNumber: '0779876543', note: 'Chest pain for two days, would like an appointment this week.' },
    { providerId: firstPharmacy._id, patientName: 'Ishara Silva', contactNumber: '0761234567', medicineName: 'Metformin 500mg', note: 'Need a full month supply.' },
  ]);

  console.log(
    `Seeded ${savedProviders.length} providers ` +
      `(${doctors.length} doctors, ${pharmacies.length} pharmacies), ` +
      `${reviews.length} reviews, 2 leads.`
  );
  console.log(`Demo doctor login:   ${doctors[0].email} / ${DEMO_PASSWORD}`);
  console.log(`Demo pharmacy login: ${pharmacies[0].email} / ${DEMO_PASSWORD}`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
