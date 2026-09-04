// The agreed API contract. Pages call these helpers instead of using axios
// directly, so request and response shapes stay in one place.
import client from './client';

/* ---------------- Public: browsing and contacting ---------------- */

// params: { role: 'doctor' | 'pharmacy', area, specialization, q }
// -> [{ _id, role, name, area, district, contact, about, specialization,
//       fee, openHours, avgRating, reviewCount }]
export const getProviders = (params) =>
  client.get('/providers', { params }).then((r) => r.data);

export const getProvider = (id) =>
  client.get(`/providers/${id}`).then((r) => r.data);

// -> { areas: [], specializations: [] }  (populates the filter dropdowns)
export const getFilterOptions = () =>
  client.get('/providers/meta/filters').then((r) => r.data);

// body: { providerId, patientName, contactNumber, medicineName?, note }
// medicineName is required when the provider is a pharmacy.
export const createLead = (body) => client.post('/leads', body).then((r) => r.data);

// body: { patientName, rating (1-5), comment }
export const addReview = (providerId, body) =>
  client.post(`/providers/${providerId}/reviews`, body).then((r) => r.data);

export const getReviews = (providerId) =>
  client.get(`/providers/${providerId}/reviews`).then((r) => r.data);

/* ---------------- Provider accounts (doctor or pharmacy) ---------------- */

// body: { role, name, email, password, area, district, contact, about,
//         specialization, fee }   (doctor)  |  { ..., openHours }  (pharmacy)
// -> { token, provider }
export const register = (body) =>
  client.post('/auth/register', body).then((r) => r.data);

// body: { email, password } -> { token, provider }
export const login = (body) => client.post('/auth/login', body).then((r) => r.data);

export const getMe = () => client.get('/auth/me').then((r) => r.data);

export const updateMyProfile = (body) =>
  client.patch('/providers/me', body).then((r) => r.data);

// The logged-in provider's own inbox.
export const getMyLeads = () => client.get('/leads/mine').then((r) => r.data);

export const updateLeadStatus = (id, status) =>
  client.patch(`/leads/${id}`, { status }).then((r) => r.data);

export const getMyReviews = () => client.get('/reviews/mine').then((r) => r.data);

/* ---------------- Admin panel ---------------- */

const adminHeaders = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const adminLogin = (body) =>
  client.post('/admin/login', body).then((r) => r.data);

export const getAdminMe = (token) =>
  client.get('/admin/me', adminHeaders(token)).then((r) => r.data);

export const getAdminProviders = (token) =>
  client.get('/admin/providers', adminHeaders(token)).then((r) => r.data);

export const getAdminReviews = (token, providerId) =>
  client.get('/admin/reviews', {
    ...adminHeaders(token),
    params: providerId ? { providerId } : {},
  }).then((r) => r.data);

export const setProviderBan = (token, providerId, banned, reason = '') =>
  client.patch(
    `/admin/providers/${providerId}/ban`,
    { banned, reason },
    adminHeaders(token)
  ).then((r) => r.data);

export const deleteAdminReview = (token, reviewId) =>
  client.delete(`/admin/reviews/${reviewId}`, adminHeaders(token)).then((r) => r.data);
