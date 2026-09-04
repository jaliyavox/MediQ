# MediQ — Build Plan

SE3090 Assignment 2 · Mini Hackathon · 4 members

---

## 1. What MediQ is

A directory that connects Sri Lankan patients to doctors and pharmacies near
them, so they can check and contact before travelling.

Two sides, one app:

- **Patients** browse, compare and contact — no account needed
- **Doctors and pharmacies** register, get listed, and receive patient requests

## 2. The problem

Outside Colombo, finding the right doctor means asking around, and finding a
medicine means travelling pharmacy to pharmacy hoping one has it. People take a
day off work, pay for transport, and often come home with nothing. There is no
single place to see who practises nearby, what they charge, or whether a
pharmacy can supply a prescription. That cost falls hardest on people who
cannot easily take time off.

## 3. What users can actually do

**As a patient (no login):**

1. Browse every listed doctor, filtered by **specialization** and **area**
2. Browse every listed pharmacy, filtered by **area**
3. Search any listing by name
4. Open a listing to see the fee or opening hours, contact number, and what
   other patients said
5. Send a **consultation request** to a doctor — name, phone, note
6. Send a **medicine enquiry** to a pharmacy — name, phone, the medicine needed
7. Leave a **star rating and comment** on any doctor or pharmacy

**As a doctor:**

8. Register with specialization, area and consultation fee
9. Log in and stay logged in across refreshes
10. See every patient request in a dashboard, with phone numbers
11. Mark a request as new → contacted → closed
12. See their average rating and every review left for them

**As a pharmacy:**

13. Register with area and opening hours
14. Receive medicine enquiries showing exactly which medicine is wanted
15. Same dashboard, statuses, ratings and reviews as a doctor

**Explicitly not in scope:** queue tokens, appointment scheduling, medicine
stock inventory, patient accounts, payments, prescriptions.

## 4. Mapping to the 10 Minimum Requirements

| # | Requirement | Where it lives |
|---|---|---|
| 1 | Landing page / main UI | `Home.jsx` — hero, how-it-works, listing call to action |
| 2 | Problem explained in-app | "The problem we are solving" section on Home |
| 3 | 2+ functional features | Doctor directory, pharmacy directory, lead capture, reviews, provider accounts |
| 4 | A form with input | Register, Login, LeadForm, ReviewForm — four separate forms |
| 5 | Input validation | `validateInput.js` — per-field messages rendered under each input |
| 6 | Display/search/filter/**calculate** | Filter by role, area, specialization, name; **average rating** aggregated from reviews |
| 7 | Responsive UI | Tailwind v4, mobile-first, Navbar collapses to a menu under 640px |
| 8 | Navigation | React Router: Home, Doctors, Pharmacies, Listing detail, Register, Login, Dashboard |
| 9 | Sample data | `npm run seed` — 8 doctors, 8 pharmacies, ~25 reviews, 2 leads |
| 10 | Demonstrated value | Send a request live, log in as that provider, show it arrived |

> **Requirement 6 needs a calculation, and average rating is the only one.**
> It is aggregated from the Review collection in `providerController.js`, never
> stored on the provider. Do not replace it with a hardcoded number.

## 5. Tech Stack

React 19 (Vite 8) · React Router 7 · Axios · Tailwind CSS v4 ·
Node 24 · **Express 5** · MongoDB Atlas (**Mongoose 9**) · bcryptjs · jsonwebtoken

> Express 5 and Mongoose 9, not 4 and 8. Most tutorials online are Express 4 —
> error-handling middleware and some route patterns differ.

## 6. Data Models

Three collections. One `Provider` model covers both doctors and pharmacies via
a `role` field, so both share one login, one lead inbox and one review system.

| Model | Fields |
|---|---|
| `Provider` | role (`doctor`\|`pharmacy`), name, email, passwordHash, area, district, contact, about, specialization, fee, openHours, status |
| `Lead` | providerId, patientName, contactNumber, medicineName, note, status (`new`\|`contacted`\|`closed`) |
| `Review` | providerId, patientName, rating (1–5), comment |

`passwordHash` is stripped in the model's `toJSON`, so it can never leak
through an API response.

## 7. API

```
GET    /api/health                        is the API up?

GET    /api/providers?role=&area=&specialization=&q=
GET    /api/providers/:id
GET    /api/providers/meta/filters        areas + specializations for dropdowns
GET    /api/providers/:id/reviews
POST   /api/providers/:id/reviews         public

POST   /api/leads                         public
GET    /api/leads/mine                    JWT required
PATCH  /api/leads/:id                     JWT required, owner only

POST   /api/auth/register                 -> { token, provider }
POST   /api/auth/login                    -> { token, provider }
GET    /api/auth/me                       JWT required
GET    /api/reviews/mine                  JWT required
```

Validation failures return `400` with `{ message, errors: { field: 'why' } }`.
The frontend reads `err.errors` and renders each message under its own input.

The frontend never calls axios directly — everything goes through
`frontend/src/api/index.js`.

## 8. Current State

The app is **built and passing tests**. `npm test` in `backend/` runs 30
end-to-end checks against a throwaway in-memory MongoDB — registration, login,
filtering, lead capture, the rating calculation, and the access-control rules.
It needs no Atlas connection.

What is **not** yet done: nothing has run against the real Atlas cluster, and
nothing is deployed.

This scaffold was generated with Claude and must be declared as such in the
README and the submission PDF — that is worth 10 marks, and the rubric asks you
to explain AI-generated code line by line in the demo. Each member owns their
component: read it, extend it, test it, and be able to talk through it.

## 9. Team Components

Full per-member checklists are in `MEMBER-TASKS.md`. Summary:

| Member | Theme | Branch | Owns requirement |
|---|---|---|---|
| A | Accounts — auth, session, dashboard | `feat/accounts` | 8 |
| B | Design system — tokens, navbar, home | `feat/ui-shell` | 1, 2, 7 |
| C | Directory — search, filters, rating aggregate | `feat/directory` | 6 |
| D | Forms, reviews, seed, tests, deployment | `feat/contact-reviews` | 4, 5, 10 |

**Locked files — tell the team before editing:** `backend/server.js` ·
`backend/app.js` · `backend/models/*` · `frontend/src/App.jsx` ·
`frontend/src/api/*` · `frontend/vite.config.js` · `index.html` ·
both `package.json`

### Design system

`frontend/src/index.css` holds every colour, font and shared class
(`.btn-primary`, `.card`, `.tile`, `.input`, `.eyebrow`). Components never
hardcode colours — changing a token there restyles the whole app. Type is
Instrument Serif for display, Inter for body.

## 10. Setup

```bash
git clone https://github.com/jaliyavox/MediQ.git
cd MediQ

cd backend   && npm install && cp .env.example .env    # fill MONGO_URI, JWT_SECRET
cd ../frontend && npm install && cp .env.example .env.local

cd backend   && npm run seed && npm run dev    # terminal 1, port 5000
cd frontend  && npm run dev                    # terminal 2, port 5173
```

Check <http://localhost:5000/api/health> before writing code. Run `npm test` in
`backend/` any time — it needs no database.

**Demo logins after seeding:** `nimal@mediq.demo` (doctor) and
`senehasa@mediq.demo` (pharmacy), both `mediq1234`.

> **If `npm install` hangs on campus wifi:** the university Fortinet firewall
> intercepts TLS and breaks the npm registry. Use a phone hotspot.

## 11. Atlas and Deployment

- **Network Access must be `0.0.0.0/0`.** A single whitelisted IP breaks the
  moment anyone changes network, and breaks Render entirely.
- The connection string needs a database name: `.../mediq?retryWrites=true...`
  Without it everything lands in a database called `test`.
- **Rotate the database password before submitting** if it has ever been pasted
  into a chat, a screenshot or a commit.
- Set `MONGO_URI` and `JWT_SECRET` on the backend host; set `VITE_API_URL` to
  the deployed backend URL on the frontend host.
- Render's free tier cold-starts at ~50s. Hit the URL once before recording.
- Test the live link in an **incognito window** before submitting.

## 12. Rubric Focus (100 marks)

- **Minimum requirements — 20.** All 10 above are covered; keep them working.
- **Practicality & creativity — 15.** Pitch: "check before you travel."
- **Quality & usability — 15.** Empty results and bad input must never crash.
  Every list already has an empty state — keep it that way.
- **Successful deployment — 10.** Incognito test before submitting.
- **Git & documentation — 10.** Small commits throughout, complete README.
- **Effective use of AI — 10.** Declare the AI-generated scaffold honestly and
  keep the prompt log. Be ready to explain any of it line by line.
