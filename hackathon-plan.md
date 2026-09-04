# Mini Hackathon Plan — MediQ (Healthcare, MERN Stack)

SE3090 Assignment 2 · Team build plan · 4 members

---

## 0. Before anyone starts — known blocker

`npm install` currently fails on this network. A **Fortinet FortiGate firewall
is intercepting TLS**: it re-signs `registry.npmjs.org` with its own CA, and
that CA is not in the macOS trust store, so npm cannot verify the chain and
hangs.

Fix it before the clock starts, in this order:

1. **Phone hotspot** — fastest, no config, works immediately. Run
   `npm install` in both folders, then you can go back to campus wifi.
2. **Get the CA from IT** — ask for the FortiGate root certificate, then
   `export NODE_EXTRA_CA_CERTS=/path/to/fortinet-ca.pem` and add
   `cafile=/path/to/fortinet-ca.pem` to `~/.npmrc`. This is the correct fix.
3. **Last resort:** `npm config set strict-ssl false`. This turns off
   certificate checking entirely — it will unblock you, but do not leave it
   set after the hackathon.

Everyone must confirm `npm install` works before you split up, or three
people will be blocked at once.

---

## 1. Problem

Sri Lankan patients, especially outside Colombo, waste hours at government
OPD clinics because they cannot see the current queue length before leaving
home, and they cannot check which nearby pharmacy actually has a prescribed
medicine in stock. This causes repeat trips, crowding, and delayed treatment
for people who cannot easily take time off work.

## 2. Solution — MediQ

A web app with two sides.

**For patients:**
1. Browse clinics/hospitals with a **live** queue estimate
2. Book a queue token for a chosen clinic and time slot
3. Search pharmacies for medicine stock availability
4. Find a doctor by specialization and area, send a consultation request,
   and leave a star rating

**For doctors:**
5. Register and log in (JWT), get listed publicly, and see the patient
   leads and reviews that come in

No medical advice or diagnosis is given. The app only shows queue, stock and
listing information.

> **The live queue estimate is the demo centrepiece.** A clinic's wait is
> computed as `(walkInQueue + booked tokens) × avgMinsPerPatient`. So when you
> book a token on stage and go back to the Clinics page, the wait time visibly
> jumps. Do not replace this with a static seeded number.

## 3. Mapping to the 10 Minimum Requirements

| # | Requirement | How MediQ meets it |
|---|---|---|
| 1 | Landing page / main UI | Home page explaining MediQ + nav to features |
| 2 | Problem explanation in-app | "About the problem" section on Home page |
| 3 | 2+ functional features | Queue booking, medicine stock search, doctor listing + leads |
| 4 | A form with input | Booking form, doctor registration, login, lead request, review form |
| 5 | Input validation | Required fields, NIC/phone format, password rules, rating 1–5 |
| 6 | Display/search/filter/calculate | Filter clinics/pharmacies/doctors; calculate live wait time and average rating |
| 7 | Responsive UI | Tailwind CSS, mobile-first |
| 8 | Navigation between sections | React Router: Home, Clinics, Book, Pharmacies, Doctors, Doctor portal |
| 9 | Sample data | Seed script: 10 clinics, 10 pharmacies, 15 medicines, stock, 6 doctors, reviews |
| 10 | Demonstrated value | Book a token live and watch the wait time change; find a medicine live |

## 4. Tech Stack (MERN)

- **MongoDB Atlas** — free cluster
- **Express.js** — REST API, one controller per resource
- **React 19** (Vite) — React Router, Axios
- **Node.js** — Express server, dotenv
- **Tailwind CSS v4** — via `@tailwindcss/vite`
- **bcryptjs + jsonwebtoken** — doctor authentication

## 5. Data Models

| Model | Fields | Owner |
|---|---|---|
| `Clinic` | name, area, district, type, walkInQueue, avgMinsPerPatient, slots[] | C |
| `Pharmacy` | name, area, district, contact | C |
| `Medicine` | name, category | C |
| `Stock` | pharmacyId, medicineId, quantity, updatedAt | C |
| `QueueToken` | patientName, contactNumber, nic, clinicId, slotTime, tokenNumber, status | C |
| `Doctor` | name, email, passwordHash, specialization, area, district, fee, status | A |
| `Lead` | doctorId, patientName, contactNumber, note, status | A |
| `Review` | doctorId, patientName, rating, comment | A |

All eight models are already written and committed. Do not redefine them —
if a field is missing, add it and tell the team.

## 6. API Endpoints (the agreed contract)

```
GET    /api/health                     is the API up?

GET    /api/clinics?area=&type=&q=     list + filter, includes live queue
GET    /api/clinics/:id
POST   /api/tokens                     book a token (validated)
GET    /api/tokens?clinicId=

GET    /api/pharmacies?area=&q=
GET    /api/medicines?q=
GET    /api/stock?medicine=&area=      medicine availability across pharmacies

POST   /api/auth/register              doctor signs up   -> { token, doctor }
POST   /api/auth/login                 doctor logs in    -> { token, doctor }
GET    /api/auth/me                    current doctor    (JWT required)
GET    /api/doctors?specialization=&area=&q=
GET    /api/doctors/:id
POST   /api/leads                      patient requests a consultation
GET    /api/leads/mine                 that doctor's own leads (JWT required)
GET    /api/doctors/:id/reviews
POST   /api/doctors/:id/reviews
```

The frontend never calls axios directly — every call goes through
`frontend/src/api/index.js`, which already has a typed helper and the exact
response shape for each endpoint above.

## 7. Team Components and File Ownership

Each member owns a **disjoint set of files** and works on their **own branch**.
If you stay inside your files, you will never hit a merge conflict.

### Member A — Doctor portal (backend + frontend)
Branch: `feat/doctor-portal`

| Files | State |
|---|---|
| `backend/models/{Doctor,Lead,Review}.js` | written |
| `backend/middleware/auth.js` (JWT verify) | written |
| `backend/controllers/authController.js` | **stub — your work** |
| `backend/controllers/doctorController.js` | **stub — your work** |
| `backend/controllers/leadController.js` | **stub — your work** |
| `backend/controllers/reviewController.js` | **stub — your work** |
| `backend/routes/{auth,doctors,leads}.js` | wired |
| `frontend/src/context/AuthContext.jsx` | written |
| `frontend/src/components/ProtectedRoute.jsx` | written |
| `frontend/src/pages/{Doctors,DoctorRegister,DoctorLogin,DoctorDashboard}.jsx` | **stub — your work** |
| `frontend/src/components/{DoctorCard,ReviewForm}.jsx` | **stub — your work** |

Every stub has a comment block saying exactly what to build. **Start this only
after B, C and D have the core booking + stock flow working** — this is the
biggest single piece and it is not one of the 10 minimum requirements.

Two things to get right:
- `GET /api/leads/mine` must filter on `req.doctorId` from the JWT, never on a
  `doctorId` sent by the client, or any doctor could read another doctor's
  patient contacts.
- Login must return the same error for a wrong email and a wrong password, so
  the form does not reveal which accounts exist.

### Member B — UI shell and clinics
Branch: `feat/ui-shell-clinics`

| Files | State |
|---|---|
| `frontend/src/components/Navbar.jsx` | basic version written, make it responsive |
| `frontend/src/index.css` | Tailwind imported, add your tokens |
| `frontend/src/pages/Home.jsx` | **stub — your work** (requirements 1 and 2) |
| `frontend/src/pages/Clinics.jsx` | **stub — your work** (requirement 6) |
| `frontend/src/components/ClinicCard.jsx` | **stub — your work** |

You own how the whole app looks. Requirement 7 (responsive) is graded on your
work — test at 375px width early, not at the end.

### Member C — Core backend API and sample data
Branch: `feat/backend-core`

| Files | State |
|---|---|
| `backend/models/{Clinic,Pharmacy,Medicine,Stock,QueueToken}.js` | written |
| `backend/controllers/clinicController.js` | written — includes the live queue calc |
| `backend/controllers/tokenController.js` | written |
| `backend/controllers/{pharmacy,medicine,stock}Controller.js` | written |
| `backend/middleware/validateInput.js` | written |
| `backend/seed/seedData.js` | written |

The API is scaffolded and syntax-checked but **has never been run against a
real database**. Your job is to make it actually work: create the Atlas
cluster, run `npm run seed`, hit every endpoint, fix what breaks, and tell B, D
and A the moment their endpoints return real data. You are the critical path —
everyone else is blocked until the API is live.

### Member D — Booking, pharmacy search, deployment
Branch: `feat/booking-pharmacy-ui`

| Files | State |
|---|---|
| `frontend/src/pages/BookToken.jsx` | **stub — your work** (requirements 4 and 5) |
| `frontend/src/components/TokenForm.jsx` | **stub — your work** |
| `frontend/src/pages/Pharmacies.jsx` | **stub — your work** |
| `frontend/src/components/{PharmacyCard,SearchBar}.jsx` | **stub — your work** |
| `README.md`, deployment | **your work** |

The booking form is the single most-graded screen in the app (requirements 4,
5 and 10). Render per-field errors from `err.errors` — the backend already
returns them keyed by field name. You also own deployment and the Git history.

### Locked files — nobody edits alone
`backend/server.js` · `frontend/src/App.jsx` · `frontend/src/api/client.js` ·
`frontend/src/api/index.js` · `frontend/vite.config.js` · both `package.json`

All routes and all API helpers are already written in these, so you should not
need to. If you genuinely do, say so in the group chat first — these are the
only files where four people can collide.

## 8. Git Workflow

```bash
git clone https://github.com/jaliyavox/MediQ.git
cd MediQ
git checkout -b feat/your-part            # your branch from section 7

cd backend  && npm install && cp .env.example .env
cd ../frontend && npm install && cp .env.example .env.local

# terminal 1
cd backend && npm run seed && npm run dev
# terminal 2
cd frontend && npm run dev
```

Rules:
- **Commit small and often** — Git history is worth 10 marks and graders can
  see one big dump at the end.
- Push your branch and open a PR into `main`. Member D reviews and merges.
- `git pull origin main` before you start each new chunk of work.
- Never commit `.env`. It is gitignored — keep it that way.

## 9. Build Order (4-hour schedule)

| Time | What | Who |
|---|---|---|
| 0–15 | Everyone: clone, `npm install` (see section 0), confirm it runs | all |
| 15–30 | Atlas cluster up, `npm run seed`, `/api/health` returns connected | C |
| 30–90 | Home + Clinics page; booking form; API fixes | B, D, C |
| 90–150 | Pharmacy search; live queue verified end to end | D, C, B |
| 150–210 | **Only once the above works:** doctor portal | A (+ any free member) |
| 210–225 | Deploy backend (Render/Railway) + frontend (Vercel/Netlify) | D |
| 225–240 | Test the live link in incognito, record the 2-min video, submit | all |

If you are behind at minute 150, **cut the doctor portal**, not the booking
flow. The 20-mark core requirements come first.

## 10. Deployment Notes

- **MongoDB Atlas:** set Network Access to `0.0.0.0/0`, or the deployed
  backend cannot reach the database. This is the classic last-minute failure.
- **Render free tier** cold-starts at roughly 50 seconds. Hit the live URL once
  right before recording the demo video so it is already warm.
- Set `VITE_API_URL` on the frontend host to the deployed backend URL, and
  `MONGO_URI` + `JWT_SECRET` on the backend host.
- Test the live link in an **incognito window** before submitting.

## 11. README.md Checklist (Member D)

- [ ] Project title and one-line pitch
- [ ] Selected problem (Sri Lankan context)
- [ ] Proposed solution summary
- [ ] Main features list
- [ ] Technologies used
- [ ] AI tools used during development, one line each
- [ ] Team member names, IDs, and what each person built
- [ ] Installation and run instructions
- [ ] Deployed application link
- [ ] Demonstration video link

## 12. Submission PDF Checklist

- [ ] Git repository link
- [ ] Deployed application link
- [ ] 2-minute demo video link
- [ ] Team member names and student IDs
- [ ] Short problem/solution description
- [ ] Technologies and AI tools list
- [ ] AI Prompt Log (tool, exact prompt, purpose, how output was checked)
- [ ] AI usage declaration

## 13. Rubric Focus (100 marks)

- **Minimum functional requirements — 20.** The biggest chunk. All 10 basics
  before anything else.
- **Practicality & creativity — 15.** Pitch: "stop wasting trips to clinics
  and pharmacies."
- **Quality & usability — 15.** Empty search results and bad form input must
  be handled gracefully, never crash.
- **Successful deployment — 10.** Incognito test before submitting.
- **Git & documentation — 10.** Small commits throughout, complete README.
- **Effective use of AI — 10.** This means AI tools used to *build* the app
  (Claude, Copilot), not an AI feature inside it. Keep the prompt log as you
  go, and be ready to explain any AI-generated code line by line.

## 14. Deliberately Skipped

- Patient login (only doctors authenticate)
- Payment integration
- Real hospital data or external APIs
- In-app AI / symptom checker — dropped, it earns no rubric marks
- Admin approval UI (doctors are approved directly in the database for now)

## 15. Data Caution

All seeded doctors, pharmacies and reviews are **fictional**. The app shows
public star ratings against a named person, so never seed or demo with a real
practitioner's name.
