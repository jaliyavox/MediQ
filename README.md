# MediQ

> Check before you travel. A directory that connects Sri Lankan patients to
> doctors and pharmacies near them — search by area, read reviews, and send a
> request from home.

SE3090 Assignment 2 — Mini Hackathon.

## The problem

Outside Colombo, finding the right doctor means asking around, and finding a
medicine means travelling pharmacy to pharmacy hoping one has it. People take a
day off work, pay for transport, and often come home with nothing. There is no
single place to see who practises nearby, what they charge, or whether a
pharmacy can supply a prescription. That cost falls hardest on people who cannot
easily take time off work.

## What you can do

**As a patient — no account needed**
- Browse doctors, filtered by specialization and area
- Browse pharmacies, filtered by area
- Search any listing by name
- See fees or opening hours, contact numbers, and what other patients said
- Send a consultation request to a doctor
- Send a medicine enquiry to a pharmacy
- Leave a star rating and comment

**As a doctor or pharmacy**
- Register and get listed, with your area, fee or opening hours
- Log in and stay signed in
- See every patient request with their phone number
- Mark requests new → contacted → closed
- See your average rating and all your reviews

## Tech stack

React 19 (Vite 8) · React Router 7 · Axios · Tailwind CSS v4 ·
Node 24 · Express 5 · MongoDB Atlas (Mongoose 9) · bcryptjs · jsonwebtoken

## Running locally

```bash
git clone https://github.com/jaliyavox/MediQ.git
cd MediQ
```

**Backend**

```bash
cd backend
npm install
cp .env.example .env        # fill in MONGO_URI and JWT_SECRET
npm run seed                # 8 doctors, 8 pharmacies, reviews
npm run dev                 # http://localhost:5001
```

Health check: <http://localhost:5001/api/health>

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev                 # http://localhost:5173
```

**Demo logins:** `nimal@mediq.demo` (doctor) · `senehasa@mediq.demo` (pharmacy)
· both `mediq1234`

> The API runs on **5001**, not 5000 — on macOS, AirPlay Receiver occupies port
> 5000 and answers with a 403, which looks like a broken API.

## Tests

```bash
cd backend && npm test
```

30 end-to-end checks against a throwaway in-memory MongoDB — registration,
login, filtering, lead capture, the average-rating calculation, and the
access-control rules. Needs no Atlas connection.

## Project structure

```
backend/
  models/       Provider, Lead, Review
  controllers/  auth, provider, lead, review
  middleware/   auth (JWT), validateInput
  seed/         sample data
  tests/        end-to-end suite
frontend/
  src/pages/       Home, Doctors, Pharmacies, ProviderDetail,
                   Register, Login, Dashboard
  src/components/  Navbar, ProviderCard, SearchBar, LeadForm,
                   ReviewForm, Field, Stars, ProtectedRoute
  src/api/         axios client + the API contract
  src/context/     AuthContext
```

Per-member ownership is in [MEMBER-TASKS.md](MEMBER-TASKS.md).

## Team

| Member | Student ID | Built |
|---|---|---|
| _TODO_ | _TODO_ | Accounts and dashboard |
| _TODO_ | _TODO_ | UI shell and home page |
| _TODO_ | _TODO_ | Directory and search |
| _TODO_ | _TODO_ | Contact forms, reviews, deployment |

## AI tools used

_TODO — one line per tool, and keep the prompt log for the submission PDF._

Example: "Claude (Claude Code) — scaffolded the Express API, the Provider/Lead/
Review models and the React pages, and wrote the end-to-end test suite. Each
member reviewed, extended and tested their own component."

## Links

- **Deployed app:** _TODO_
- **Demo video:** _TODO_
