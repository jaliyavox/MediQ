# Member Tasks — MediQ

Read this first, then `hackathon-plan.md` for the full context.

Everything below is already scaffolded: all eight models exist, every route is
wired, every page file exists, and the API contract is written. **Your job is to
fill in the files listed under your name.** Nothing else.

---

## Setup — everyone does this first (15 min)

```bash
git clone https://github.com/jaliyavox/MediQ.git
cd MediQ

cd backend
npm install
cp .env.example .env          # fill in MONGO_URI and JWT_SECRET (ask Member C)
cd ../frontend
npm install
cp .env.example .env.local    # VITE_API_URL=http://localhost:5000/api
```

Run it in two terminals:

```bash
cd backend  && npm run dev    # http://localhost:5000
cd frontend && npm run dev    # http://localhost:5173
```

Confirm <http://localhost:5000/api/health> returns `{"ok":true,"db":"connected"}`
before you write any code. If it says `disconnected`, your `MONGO_URI` is wrong.

> **If `npm install` hangs on campus wifi:** the university Fortinet firewall
> intercepts TLS and breaks the npm registry. Use a phone hotspot. Details in
> section 0 of `hackathon-plan.md`.

Then make your branch:

```bash
git checkout -b feat/your-part
```

---

## Ground rules

1. **Only edit the files listed under your name.** If you stay in your files you
   will never get a merge conflict.
2. **These files are locked** — tell the group chat before touching any of them:
   `backend/server.js` · `backend/app.js` · `frontend/src/App.jsx` ·
   `frontend/src/api/client.js` · `frontend/src/api/index.js` ·
   `frontend/vite.config.js` · both `package.json`.
   All routes and API helpers are already in there, so you should not need to.
3. **Never call axios directly.** Import from `../api` — every endpoint already
   has a helper with the exact response shape documented above it.
4. **Commit small and often.** Git history is worth 10 marks and a single dump
   at the end is visible to the grader.
5. **Never commit `.env`.** It is gitignored. Keep it that way.
6. **Be ready to explain any AI-generated code line by line** in the demo, and
   log your prompts as you go — that is 10 marks.

---

## Member A — Doctor portal

**Branch:** `feat/doctor-portal`

⚠️ **Start only after B, C and D have booking + stock working.** This is the
biggest piece and it is *not* one of the 10 minimum requirements. If the team is
behind at minute 150, this gets cut first. Help the others until then.

### Backend — these are stubs returning 501, write the real logic

- [ ] `backend/controllers/authController.js`
  - `register` — validate fields, reject duplicate email with **409**, hash with
    `bcrypt.hash(password, 10)`, `Doctor.create`, return `{ token, doctor }`
  - `login` — find by email, `bcrypt.compare`, return `{ token, doctor }`
  - `me` — return the doctor for `req.doctorId`
  - `signToken()` is already written at the top of the file, use it
- [ ] `backend/controllers/doctorController.js`
  - `listDoctors` — only `status: 'approved'`, filter by specialization/area/q,
    attach `avgRating` and `reviewCount`
  - `getDoctor` — one doctor with the same rating fields
- [ ] `backend/controllers/leadController.js`
  - `createLead` — public, validate phone the same way `validateInput.js` does
  - `getMyLeads` — the logged-in doctor's leads only
- [ ] `backend/controllers/reviewController.js`
  - `addReview` — validate rating is a whole number 1–5
  - `getReviews` — newest first

**Two things you must get right:**

- `getMyLeads` must filter on `req.doctorId` (from the JWT), **never** on a
  `doctorId` sent by the client — otherwise any doctor can read another
  doctor's patient phone numbers.
- `login` must return the **same** error message for a wrong email and a wrong
  password ("Invalid email or password"), so the form does not reveal which
  accounts exist.

For the rating average, copy the aggregate pattern in `withLiveQueue()` in
`backend/controllers/clinicController.js` — it is the closest working example.

### Frontend

- [ ] `frontend/src/pages/DoctorRegister.jsx` — name, email, password,
      specialization, area, district, fee. On success call
      `useAuth().login({token, doctor})` and redirect to the dashboard.
- [ ] `frontend/src/pages/DoctorLogin.jsx` — email + password
- [ ] `frontend/src/pages/DoctorDashboard.jsx` — protected; shows this doctor's
      leads (patient name, contact, note, date) and their reviews
- [ ] `frontend/src/pages/Doctors.jsx` — public list, filter by specialization
      and area, "Request consultation" button, review form
- [ ] `frontend/src/components/DoctorCard.jsx`
- [ ] `frontend/src/components/ReviewForm.jsx`

`AuthContext.jsx` and `ProtectedRoute.jsx` are already written for you.

**Done when:** you can register a doctor, log out, log back in, see them on
`/doctors`, send a lead as a patient, and see that lead on the dashboard.

---

## Member B — UI shell and clinics

**Branch:** `feat/ui-shell-clinics`

You own how the entire app looks. **Requirement 7 (responsive) is graded on
your work.**

- [ ] `frontend/src/pages/Home.jsx` — **requirements 1 and 2.** What MediQ is,
      an "About the problem" section explaining the Sri Lankan OPD/pharmacy
      problem, and cards linking to Clinics / Book / Pharmacies / Doctors.
- [ ] `frontend/src/pages/Clinics.jsx` — **requirement 6.** List clinics with
      their live queue estimate. Search by name, filter by area and type. Must
      show a friendly empty state when nothing matches.
- [ ] `frontend/src/components/ClinicCard.jsx` — name, area, type, queue length,
      estimated wait, and a link to `/book`.
- [ ] `frontend/src/components/Navbar.jsx` — a basic version exists; make it
      responsive (hamburger menu under ~640px).
- [ ] `frontend/src/index.css` — Tailwind is already imported; add your colours
      and any shared classes here.

Use `getClinics()` from `../api`. Each clinic comes back with `queueLength` and
`estimatedWaitMins` already calculated — do not recalculate them in the UI.

**Test at 375px width from the start**, not at the end. That is the single
easiest way to lose the responsive marks.

**Done when:** Home explains the problem, Clinics filters correctly, the empty
state reads well, and nothing overflows horizontally on a phone.

---

## Member C — Core backend API and sample data

**Branch:** `feat/backend-core`

**You are the critical path.** B, D and A are all blocked until the API returns
real data. Do the setup first and tell everyone the moment it works.

- [ ] Create the **MongoDB Atlas** free cluster
- [ ] Set Atlas **Network Access to `0.0.0.0/0`** — otherwise the deployed
      backend cannot connect later. This is the classic last-minute failure.
- [ ] Share the `MONGO_URI` and a generated `JWT_SECRET` with the team
      (over chat, never committed)
- [ ] Run `npm run seed` and confirm the counts it prints
- [ ] Hit every endpoint and fix whatever breaks:

```bash
curl localhost:5000/api/health
curl "localhost:5000/api/clinics?area=Kandy"
curl "localhost:5000/api/stock?medicine=Paracetamol"
curl "localhost:5000/api/pharmacies?area=Colombo"
curl -X POST localhost:5000/api/tokens -H 'Content-Type: application/json' \
  -d '{"patientName":"Test User","contactNumber":"0771234567","nic":"941234567V","clinicId":"<paste a real id>","slotTime":"09:00"}'
```

- [ ] Verify the **live queue** works: note a clinic's `estimatedWaitMins`, book
      a token for it, fetch it again, confirm the wait went **up**. This is the
      demo centrepiece — if it does not work, nothing else matters.
- [ ] Confirm validation: post a token with a bad phone number and check you get
      a 400 with a per-field `errors` object.

Your files: the five core controllers, `middleware/validateInput.js`,
`seed/seedData.js`, and the five core models. They are written but **have never
run against a database** — expect to fix things.

**Done when:** every endpoint above returns correct data and the wait time
provably changes after a booking.

---

## Member D — Booking, pharmacy search, deployment

**Branch:** `feat/booking-pharmacy-ui`

The booking form is the **most heavily graded screen in the app** —
requirements 4, 5 and 10 all land on it.

- [ ] `frontend/src/pages/BookToken.jsx` + `components/TokenForm.jsx`
  - fields: patient name, contact number, NIC, clinic dropdown, time slot
  - the backend returns per-field errors as `err.errors` keyed by field name —
    render each one under its own input, do not just show one generic message
  - on success show the **token number, people ahead, and estimated wait**
- [ ] `frontend/src/pages/Pharmacies.jsx` + `components/PharmacyCard.jsx` +
      `components/SearchBar.jsx`
  - search a medicine by name, filter by area
  - show quantity and a clear **"Out of stock"** state
  - handle no-results without crashing
- [ ] `README.md` — fill in the team table, AI tools used, and the two links
- [ ] **Deploy:** backend to Render/Railway, frontend to Vercel/Netlify
  - set `MONGO_URI` and `JWT_SECRET` on the backend host
  - set `VITE_API_URL` to the deployed backend URL on the frontend host
  - Render free tier cold-starts at ~50s — hit the URL once right before
    recording the video so it is warm
  - **test the live link in an incognito window** before submitting
- [ ] Review and merge everyone's pull requests into `main`

**Done when:** a booking works end to end on the deployed URL in incognito, and
the README has no `TODO` left in it.

---

## Suggested timeline

| Time | What | Who |
|---|---|---|
| 0–15 | Clone, install, confirm it runs | everyone |
| 15–30 | Atlas up, seed run, `/api/health` connected | C |
| 30–90 | Home + Clinics; booking form; API fixes | B, D, C |
| 90–150 | Pharmacy search; live queue verified end to end | D, C, B |
| 150–210 | **Only if the above works:** doctor portal | A + whoever is free |
| 210–225 | Deploy both halves | D |
| 225–240 | Incognito test, record 2-min video, submit | everyone |

**If you are behind at minute 150, cut the doctor portal — not the booking
flow.** The 20 marks for the minimum requirements come first.
