// End-to-end test of the real API against a throwaway in-memory MongoDB.
// Run with:  npm test
// Needs no Atlas connection and never touches your real data.
process.env.JWT_SECRET = 'e2e-secret';
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../app');

let pass = 0, fail = 0;
const check = (name, ok, detail = '') => {
  ok ? pass++ : fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' :: ' + detail : ''}`);
};

(async () => {
  const mem = await MongoMemoryServer.create();
  await mongoose.connect(mem.getUri('mediq'));
  const server = app.listen(0);
  const base = `http://localhost:${server.address().port}/api`;

  const req = async (method, path, body, token) => {
    const res = await fetch(base + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    let data = null;
    try { data = await res.json(); } catch {}
    return { status: res.status, data };
  };

  // --- registration ---
  const docBody = { role: 'doctor', name: 'Dr. Test Perera', email: 'doc@test.demo',
    password: 'password123', area: 'Kandy', district: 'Kandy', specialization: 'Cardiology',
    fee: 3000, contact: '0771234567' };
  let r = await req('POST', '/auth/register', docBody);
  check('register doctor -> 201', r.status === 201);
  check('register returns a JWT', typeof r.data?.token === 'string');
  check('passwordHash never leaves the API', r.data?.provider?.passwordHash === undefined);
  const docToken = r.data.token, docId = r.data.provider._id;

  r = await req('POST', '/auth/register', docBody);
  check('duplicate email -> 409', r.status === 409, `got ${r.status}`);

  r = await req('POST', '/auth/register', { ...docBody, email: 'x@t.d', password: 'short' });
  check('short password -> 400 with field error', r.status === 400 && !!r.data.errors.password);

  const phBody = { role: 'pharmacy', name: 'Test Pharmacy', email: 'ph@test.demo',
    password: 'password123', area: 'Kandy', openHours: '8am-8pm', contact: '0812234567' };
  r = await req('POST', '/auth/register', phBody);
  const phToken = r.data.token, phId = r.data.provider._id;
  check('register pharmacy -> 201', r.status === 201);

  // --- login ---
  r = await req('POST', '/auth/login', { email: 'doc@test.demo', password: 'password123' });
  check('login with correct password -> 200', r.status === 200);

  const wrongPw = await req('POST', '/auth/login', { email: 'doc@test.demo', password: 'wrongpass' });
  const noUser  = await req('POST', '/auth/login', { email: 'nobody@test.demo', password: 'whatever' });
  check('wrong password -> 401', wrongPw.status === 401);
  check('unknown email -> 401', noUser.status === 401);
  check('login does not leak which accounts exist',
        wrongPw.data.message === noUser.data.message, `"${wrongPw.data.message}" vs "${noUser.data.message}"`);

  r = await req('GET', '/auth/me', null, docToken);
  check('GET /auth/me with token -> 200', r.status === 200 && r.data.email === 'doc@test.demo');

  // --- directory + filtering ---
  r = await req('GET', '/providers?role=doctor');
  check('list doctors returns only doctors', r.status === 200 && r.data.every((p) => p.role === 'doctor'));
  r = await req('GET', '/providers?role=pharmacy');
  check('list pharmacies returns only pharmacies', r.data.every((p) => p.role === 'pharmacy'));
  r = await req('GET', '/providers?role=doctor&specialization=Cardio');
  check('partial specialization filter matches', r.data.length === 1);
  r = await req('GET', '/providers?role=doctor&area=Colombo');
  check('non-matching area returns empty list', r.data.length === 0);
  // Regression: a regex metacharacter in the search box used to return a 500.
  for (const bad of ['Dr(', '[', '*', '\\', '.*']) {
    r = await req('GET', `/providers?role=doctor&q=${encodeURIComponent(bad)}`);
    check(`search "${bad}" does not crash`, r.status === 200, `got ${r.status}`);
  }
  r = await req('GET', '/providers?role=doctor&q=.*');
  check('".*" is treated as text, not a wildcard', r.data.length === 0, `matched ${r.data.length}`);
  r = await req('GET', '/providers/notavalidid');
  check('malformed provider id -> 404 not 500', r.status === 404, `got ${r.status}`);

  r = await req('GET', '/providers/meta/filters');
  check('filter options expose areas + specializations',
        r.data.areas.includes('Kandy') && r.data.specializations.includes('Cardiology'));

  // --- leads ---
  r = await req('POST', '/leads', { providerId: docId, patientName: 'Kasun', contactNumber: '0779876543', note: 'Chest pain' });
  check('lead to doctor -> 201', r.status === 201);
  r = await req('POST', '/leads', { providerId: docId, patientName: 'Kasun', contactNumber: '12345' });
  check('bad phone -> 400 with field error', r.status === 400 && !!r.data.errors.contactNumber);
  r = await req('POST', '/leads', { providerId: phId, patientName: 'Ishara', contactNumber: '0761234567' });
  check('pharmacy lead without medicine -> 400', r.status === 400 && !!r.data.errors.medicineName);
  r = await req('POST', '/leads', { providerId: phId, patientName: 'Ishara', contactNumber: '0761234567', medicineName: 'Metformin 500mg' });
  check('pharmacy lead with medicine -> 201', r.status === 201);

  // --- the security property that matters most ---
  const docLeads = (await req('GET', '/leads/mine', null, docToken)).data;
  const phLeads  = (await req('GET', '/leads/mine', null, phToken)).data;
  check('doctor sees only their own lead', docLeads.length === 1 && docLeads[0].patientName === 'Kasun');
  check('pharmacy sees only their own lead', phLeads.length === 1 && phLeads[0].medicineName === 'Metformin 500mg');
  check('leads require a token', (await req('GET', '/leads/mine')).status === 401);

  // a provider must not be able to touch another provider's lead
  r = await req('PATCH', `/leads/${docLeads[0]._id}`, { status: 'closed' }, phToken);
  check('cannot update another provider\'s lead -> 404', r.status === 404, `got ${r.status}`);
  r = await req('PATCH', `/leads/${docLeads[0]._id}`, { status: 'contacted' }, docToken);
  check('owner can update their own lead', r.status === 200 && r.data.status === 'contacted');

  // --- reviews + the average rating calculation ---
  for (const rating of [5, 4, 3]) {
    await req('POST', `/providers/${docId}/reviews`, { patientName: 'P', rating, comment: 'ok' });
  }
  r = await req('POST', `/providers/${docId}/reviews`, { patientName: 'P', rating: 9 });
  check('rating out of range -> 400', r.status === 400 && !!r.data.errors.rating);

  r = await req('GET', `/providers/${docId}`);
  check('avgRating computed from reviews (5,4,3 -> 4)', r.data.avgRating === 4, `got ${r.data.avgRating}`);
  check('reviewCount correct', r.data.reviewCount === 3, `got ${r.data.reviewCount}`);

  r = await req('GET', '/providers?role=pharmacy');
  check('provider with no reviews -> avgRating null', r.data[0].avgRating === null);

  r = await req('GET', '/reviews/mine', null, docToken);
  check('provider can read their own reviews', r.status === 200 && r.data.length === 3);

  console.log(`\n${pass} passed, ${fail} failed`);
  await mongoose.disconnect(); await mem.stop(); server.close();
  process.exit(fail === 0 ? 0 : 1);
})();
