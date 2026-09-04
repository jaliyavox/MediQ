// OWNER: Member D
// Run with:  npm run seed
// Wipes the sample collections and reloads them, so it is safe to re-run.

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Clinic = require('../models/Clinic');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const Stock = require('../models/Stock');
const QueueToken = require('../models/QueueToken');
const Doctor = require('../models/Doctor');
const Lead = require('../models/Lead');
const Review = require('../models/Review');

const SLOTS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00'];

const clinics = [
  { name: 'National Hospital OPD', area: 'Colombo', district: 'Colombo', type: 'OPD', walkInQueue: 24, avgMinsPerPatient: 5 },
  { name: 'Colombo South Teaching Hospital', area: 'Dehiwala', district: 'Colombo', type: 'Hospital', walkInQueue: 15, avgMinsPerPatient: 6 },
  { name: 'Kandy General Hospital OPD', area: 'Kandy', district: 'Kandy', type: 'OPD', walkInQueue: 18, avgMinsPerPatient: 6 },
  { name: 'Peradeniya Base Hospital', area: 'Peradeniya', district: 'Kandy', type: 'Hospital', walkInQueue: 9, avgMinsPerPatient: 7 },
  { name: 'Galle Karapitiya OPD', area: 'Galle', district: 'Galle', type: 'OPD', walkInQueue: 21, avgMinsPerPatient: 5 },
  { name: 'Matara District Hospital', area: 'Matara', district: 'Matara', type: 'Hospital', walkInQueue: 12, avgMinsPerPatient: 6 },
  { name: 'Jaffna Teaching Hospital OPD', area: 'Jaffna', district: 'Jaffna', type: 'OPD', walkInQueue: 16, avgMinsPerPatient: 6 },
  { name: 'Kurunegala Base Hospital', area: 'Kurunegala', district: 'Kurunegala', type: 'Hospital', walkInQueue: 11, avgMinsPerPatient: 7 },
  { name: 'Anuradhapura Clinic Centre', area: 'Anuradhapura', district: 'Anuradhapura', type: 'Clinic', walkInQueue: 6, avgMinsPerPatient: 8 },
  { name: 'Badulla Provincial OPD', area: 'Badulla', district: 'Badulla', type: 'OPD', walkInQueue: 8, avgMinsPerPatient: 7 },
];

const pharmacies = [
  { name: 'Osu Sala Colombo', area: 'Colombo', district: 'Colombo', contact: '0112345678' },
  { name: 'Union Chemists', area: 'Colombo', district: 'Colombo', contact: '0112223344' },
  { name: 'Dehiwala Pharmacy', area: 'Dehiwala', district: 'Colombo', contact: '0112789456' },
  { name: 'Kandy City Pharmacy', area: 'Kandy', district: 'Kandy', contact: '0812234567' },
  { name: 'Peradeniya Medicals', area: 'Peradeniya', district: 'Kandy', contact: '0812388990' },
  { name: 'Galle Fort Pharmacy', area: 'Galle', district: 'Galle', contact: '0912233445' },
  { name: 'Matara Osu Sala', area: 'Matara', district: 'Matara', contact: '0412266778' },
  { name: 'Jaffna Central Pharmacy', area: 'Jaffna', district: 'Jaffna', contact: '0212244556' },
  { name: 'Kurunegala Health Pharmacy', area: 'Kurunegala', district: 'Kurunegala', contact: '0372255667' },
  { name: 'Badulla Medicare', area: 'Badulla', district: 'Badulla', contact: '0552244668' },
];

const medicines = [
  { name: 'Paracetamol 500mg', category: 'Painkiller' },
  { name: 'Ibuprofen 400mg', category: 'Painkiller' },
  { name: 'Amoxicillin 250mg', category: 'Antibiotic' },
  { name: 'Azithromycin 500mg', category: 'Antibiotic' },
  { name: 'Metformin 500mg', category: 'Diabetes' },
  { name: 'Insulin Pen', category: 'Diabetes' },
  { name: 'Losartan 50mg', category: 'Blood Pressure' },
  { name: 'Atenolol 50mg', category: 'Blood Pressure' },
  { name: 'Salbutamol Inhaler', category: 'Respiratory' },
  { name: 'Cetirizine 10mg', category: 'Allergy' },
  { name: 'Omeprazole 20mg', category: 'Gastric' },
  { name: 'Domperidone 10mg', category: 'Gastric' },
  { name: 'Atorvastatin 20mg', category: 'Cholesterol' },
  { name: 'Ferrous Sulphate', category: 'Supplement' },
  { name: 'ORS Sachet', category: 'Rehydration' },
];

// Fictional doctors - do NOT put real practitioners' names here, the app
// shows public star ratings against whatever name is listed.
// Every seeded doctor logs in with the password below.
const DEMO_PASSWORD = 'mediq1234';

const doctors = [
  { name: 'Dr. Nimal Perera', email: 'nimal@mediq.demo', specialization: 'General Physician', area: 'Colombo', district: 'Colombo', fee: 2000 },
  { name: 'Dr. Anoma Silva', email: 'anoma@mediq.demo', specialization: 'Cardiology', area: 'Colombo', district: 'Colombo', fee: 4500 },
  { name: 'Dr. Ruwan Jayasuriya', email: 'ruwan@mediq.demo', specialization: 'Paediatrics', area: 'Kandy', district: 'Kandy', fee: 3000 },
  { name: 'Dr. Kumari Fernando', email: 'kumari@mediq.demo', specialization: 'Dermatology', area: 'Kandy', district: 'Kandy', fee: 3500 },
  { name: 'Dr. Suresh Kumar', email: 'suresh@mediq.demo', specialization: 'General Physician', area: 'Jaffna', district: 'Jaffna', fee: 1800 },
  { name: 'Dr. Malini Rajapaksha', email: 'malini@mediq.demo', specialization: 'Gynaecology', area: 'Galle', district: 'Galle', fee: 4000 },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Clearing old sample data...');

  await Promise.all([
    Clinic.deleteMany({}),
    Pharmacy.deleteMany({}),
    Medicine.deleteMany({}),
    Stock.deleteMany({}),
    QueueToken.deleteMany({}),
    Doctor.deleteMany({}),
    Lead.deleteMany({}),
    Review.deleteMany({}),
  ]);

  const savedClinics = await Clinic.insertMany(
    clinics.map((c) => ({ ...c, slots: SLOTS }))
  );
  const savedPharmacies = await Pharmacy.insertMany(pharmacies);
  const savedMedicines = await Medicine.insertMany(medicines);

  // Give every pharmacy a mix of in-stock and out-of-stock medicines, so the
  // search demo can show both a hit and an "out of stock" result.
  const stockRows = [];
  savedPharmacies.forEach((pharmacy, pIdx) => {
    savedMedicines.forEach((medicine, mIdx) => {
      if ((pIdx + mIdx) % 3 === 0) return; // this pharmacy simply does not carry it
      const outOfStock = (pIdx + mIdx) % 7 === 0;
      stockRows.push({
        pharmacyId: pharmacy._id,
        medicineId: medicine._id,
        quantity: outOfStock ? 0 : 10 + ((pIdx * 7 + mIdx * 13) % 90),
      });
    });
  });
  await Stock.insertMany(stockRows);

  // Seeded doctors are pre-approved so the Doctors page is not empty in the demo.
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const savedDoctors = await Doctor.insertMany(
    doctors.map((d) => ({ ...d, passwordHash, status: 'approved' }))
  );

  // A few reviews so the average rating has something to calculate.
  const reviewSeed = [];
  savedDoctors.forEach((doctor, i) => {
    const ratings = [[5, 4, 5], [4, 4], [5, 3, 4, 5], [3, 4], [5, 5], [4, 5, 4]][i] || [4];
    ratings.forEach((rating, j) => {
      reviewSeed.push({
        doctorId: doctor._id,
        patientName: `Patient ${j + 1}`,
        rating,
        comment: rating >= 4 ? 'Helpful and did not keep me waiting.' : 'Consultation was fine, the wait was long.',
      });
    });
  });
  await Review.insertMany(reviewSeed);

  console.log(
    `Seeded ${savedClinics.length} clinics, ${savedPharmacies.length} pharmacies, ` +
      `${savedMedicines.length} medicines, ${stockRows.length} stock rows, ` +
      `${savedDoctors.length} doctors, ${reviewSeed.length} reviews.`
  );
  console.log(`Demo doctor login: ${doctors[0].email} / ${DEMO_PASSWORD}`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
