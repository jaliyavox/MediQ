// LOCKED FILE - the agreed API contract (plan section 9).
// Every page calls these helpers instead of using axios directly, so the
// frontend and backend can be built in parallel without guessing shapes.
import client from './client';

/* ---- Clinics & queue tokens (Member C backend, Members B/D frontend) ---- */

// -> [{ _id, name, area, district, type, slots[], walkInQueue,
//       bookedTokens, queueLength, estimatedWaitMins }]
export const getClinics = (params) =>
  client.get('/clinics', { params }).then((r) => r.data);

export const getClinic = (id) => client.get(`/clinics/${id}`).then((r) => r.data);

// body: { patientName, contactNumber, nic, clinicId, slotTime }
// -> { token, clinicName, peopleAhead, estimatedWaitMins }
export const bookToken = (body) => client.post('/tokens', body).then((r) => r.data);

export const getTokens = (params) =>
  client.get('/tokens', { params }).then((r) => r.data);

/* ---- Pharmacies & medicine stock (Member C backend, Member D frontend) ---- */

export const getPharmacies = (params) =>
  client.get('/pharmacies', { params }).then((r) => r.data);

export const getMedicines = (params) =>
  client.get('/medicines', { params }).then((r) => r.data);

// params: { medicine, area } (medicine is required)
// -> [{ pharmacyName, area, district, contact, medicineName,
//       quantity, inStock, updatedAt }]
export const searchStock = (params) =>
  client.get('/stock', { params }).then((r) => r.data);

/* ---- Doctor portal (Member A, both ends) ---- */

// body: { name, email, password, specialization, area, district, fee }
// -> { token, doctor }
export const registerDoctor = (body) =>
  client.post('/auth/register', body).then((r) => r.data);

// body: { email, password } -> { token, doctor }
export const loginDoctor = (body) =>
  client.post('/auth/login', body).then((r) => r.data);

// -> the logged-in doctor (needs the JWT)
export const getMe = () => client.get('/auth/me').then((r) => r.data);

// params: { specialization, area, q }
// -> [{ _id, name, specialization, area, district, fee, avgRating, reviewCount }]
export const getDoctors = (params) =>
  client.get('/doctors', { params }).then((r) => r.data);

export const getDoctor = (id) => client.get(`/doctors/${id}`).then((r) => r.data);

// body: { doctorId, patientName, contactNumber, note }
export const createLead = (body) => client.post('/leads', body).then((r) => r.data);

// the logged-in doctor's own patient leads (needs the JWT)
export const getMyLeads = () => client.get('/leads/mine').then((r) => r.data);

// body: { patientName, rating (1-5), comment }
export const addReview = (doctorId, body) =>
  client.post(`/doctors/${doctorId}/reviews`, body).then((r) => r.data);

export const getReviews = (doctorId) =>
  client.get(`/doctors/${doctorId}/reviews`).then((r) => r.data);
