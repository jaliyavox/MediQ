# MediQ

> Skip the queue, find your medicine. A web app that shows live OPD queue
> estimates, books clinic tokens, and finds which nearby pharmacy actually
> has your medicine in stock.

SE3090 Assignment 2 — Mini Hackathon. **Member D owns this file**; the
checklist below is from section 11 of `hackathon-plan.md`.

## The problem

Sri Lankan patients, especially outside Colombo, waste hours at government OPD
clinics because they cannot see the queue length before leaving home, and they
cannot check which nearby pharmacy has a prescribed medicine in stock. The
result is repeat trips, crowding, and delayed treatment for people who cannot
easily take time off work.

## Features

- **Live queue estimates** — a clinic's wait is computed from real booked
  tokens, so booking one immediately changes the wait shown to everyone else
- **Queue token booking** — validated form, per-field error messages, returns
  a token number and how many people are ahead
- **Medicine stock search** — search by medicine name, filter by area, see
  quantity and out-of-stock states
- **Doctor portal** — doctors register and log in (JWT), get listed publicly,
  and receive patient consultation requests and star ratings

## Tech stack

React 19 (Vite) · React Router · Axios · Tailwind CSS v4 ·
Node.js · Express · MongoDB Atlas (Mongoose) · bcryptjs · jsonwebtoken

## Running it locally

> **If `npm install` hangs**, see section 0 of `hackathon-plan.md` — the campus
> Fortinet firewall intercepts TLS and breaks the npm registry connection.

```bash
git clone https://github.com/jaliyavox/MediQ.git
cd MediQ
```

**Backend**

```bash
cd backend
npm install
cp .env.example .env        # then fill in MONGO_URI and JWT_SECRET
npm run seed                # loads the sample data
npm run dev                 # http://localhost:5000
```

Check it is up: <http://localhost:5000/api/health>

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env.local  # VITE_API_URL=http://localhost:5000/api
npm run dev                 # http://localhost:5173
```

**Demo doctor login:** `nimal@mediq.demo` / `mediq1234`

## Project structure

```
backend/    models, routes, controllers, middleware, seed
frontend/   src/{pages,components,context,api}
```

File ownership per team member is in section 7 of `hackathon-plan.md`.

## Team

| Member | Student ID | Built |
|---|---|---|
| _TODO_ | _TODO_ | Doctor portal — auth, listing, leads, reviews |
| _TODO_ | _TODO_ | UI shell, Home page, clinics list |
| _TODO_ | _TODO_ | Core backend API, validation, sample data |
| _TODO_ | _TODO_ | Booking form, pharmacy search, deployment |

## AI tools used

_TODO — one line per tool, e.g. "Claude — scaffolded the Express models and
the API contract; we reviewed each endpoint and wrote the controllers."_

## Links

- **Deployed app:** _TODO_
- **Demo video:** _TODO_
