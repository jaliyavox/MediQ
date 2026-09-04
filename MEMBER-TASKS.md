# Member Tasks — MediQ

Read this first, then `hackathon-plan.md` for full context.

---

## What MediQ does

A directory connecting Sri Lankan patients to doctors and pharmacies near them.

**Patients** (no account): browse and filter doctors by specialization and area,
browse pharmacies by area, read ratings, send a consultation request or a
medicine enquiry, and leave a star rating.

**Doctors and pharmacies**: register, log in, and receive those requests in a
dashboard with the patient's phone number, marking each new → contacted → closed.

There are **no queue tokens and no stock database.** Both were cut.

---

## Important: how to describe this work

The codebase was scaffolded with Claude and **must be declared honestly** in the
README and submission PDF. That is not a problem — the rubric awards **10 marks
for effective use of AI** and requires the declaration.

What it does mean: the rubric also says be ready to **explain AI-generated code
line by line** in the demo. So owning a component means reading it, understanding
it, extending it, and being able to talk through it. Do not present code you have
not read.

---

## Setup — everyone does this first

```bash
git clone https://github.com/jaliyavox/MediQ.git
cd MediQ

cd backend
npm install
cp .env.example .env          # ask for MONGO_URI and JWT_SECRET
npm run seed                  # loads 8 doctors, 8 pharmacies, reviews

cd ../frontend
npm install
cp .env.example .env.local
```

Two terminals:

```bash
cd backend  && npm run dev    # http://localhost:5001
cd frontend && npm run dev    # http://localhost:5173
```

Confirm <http://localhost:5001/api/health> says `{"ok":true,"db":"connected"}`.

**Demo logins:** `nimal@mediq.demo` (doctor), `senehasa@mediq.demo` (pharmacy),
both password `mediq1234`.

> **The API is on port 5001, not 5000.** On macOS, AirPlay Receiver occupies
> 5000 and answers requests with a 403, which looks exactly like a broken API.
>
> **If `npm install` hangs on campus wifi:** the Fortinet firewall intercepts
> TLS and breaks the npm registry. Use a phone hotspot.

Run the test suite any time — it needs no database and takes seconds:

```bash
cd backend && npm test        # 30 end-to-end checks
```

Then branch:

```bash
git checkout -b feat/your-part
```

---

## Ground rules

1. **Only edit files listed under your name.** Stay in your files, never hit a
   merge conflict.
2. **Locked files** — say so in the group chat first: `backend/server.js`,
   `backend/app.js`, `backend/models/*`, `frontend/src/App.jsx`,
   `frontend/src/api/*`, `frontend/vite.config.js`, both `package.json`.
3. **Never call axios directly.** Import from `../api`.
4. **Run `npm test` before you push.** If you broke something, it tells you.
5. **Commit small and often** — Git history is 10 marks.
6. **Never commit `.env`.**

---

## Member A — Accounts and dashboard

**Branch:** `feat/accounts`

**Your files:** `backend/controllers/authController.js` ·
`backend/middleware/auth.js` · auth half of `backend/middleware/validateInput.js` ·
`frontend/src/context/AuthContext.jsx` · `components/ProtectedRoute.jsx` ·
`pages/Register.jsx` · `pages/Login.jsx` · `pages/Dashboard.jsx`

Working today: registration with bcrypt hashing, JWT login, session that
survives refresh, a protected dashboard showing leads and reviews with stat
tiles and clickable status badges.

**Understand before you demo:**
- Why `login` returns the *same* message for a wrong email and a wrong password
  (so the form cannot be used to discover which accounts exist).
- Why `passwordHash` is deleted in the model's `toJSON` rather than in each
  controller.
- How `AuthContext` restores a session from `localStorage` on page load.

**Extend:** password strength hint · an "edit my listing" page · a
`status: pending` approval flow · logout confirmation.

**Done when:** you can register, sign out, sign back in, refresh, and still be
logged in — and you can explain the three points above.

---

## Member B — UI shell and home page

**Branch:** `feat/ui-shell`

**Your files:** `components/Navbar.jsx` · `components/Field.jsx` ·
`components/Stars.jsx` · `pages/Home.jsx` · `pages/NotFound.jsx` · `src/index.css`

Working today: sticky responsive navbar that collapses to a menu under 640px,
a home page with a hero, the problem section (requirement 2), a how-it-works
row and a call to action.

**Requirement 7 (responsive) is graded entirely on your work.** Test at 375px
from the start, not at the end.

**Understand before you demo:** `Field.jsx` is why every form shows validation
errors identically — it takes an `error` prop and renders the message plus the
red border. Every form in the app uses it.

**Extend:** a colour palette in `index.css` · loading skeletons · a footer ·
better empty-state illustrations · focus states for keyboard users.

**Done when:** nothing overflows horizontally at 375px, the menu works on a
phone, and the Home page clearly explains the problem to someone who has never
heard of MediQ.

---

## Member C — Directory and search

**Branch:** `feat/directory`

**Your files:** `backend/controllers/providerController.js` ·
`pages/Directory.jsx` · `pages/Doctors.jsx` · `pages/Pharmacies.jsx` ·
`components/SearchBar.jsx` · `components/ProviderCard.jsx`

Working today: one `Directory` component powering both `/doctors` and
`/pharmacies`, debounced search, area and specialization filters populated from
the database, result counts, and a real empty state with a "clear filters" button.

**You own requirement 6, the biggest scoring item** — search, filter *and*
calculate.

**Understand before you demo:**
- `withRatings()` computes every provider's average rating in **one** aggregate
  query, not one query per provider. Be able to explain why that matters.
- The average is calculated from the Review collection every time; it is never
  stored on the provider. If you cache it, it goes stale.
- Search is debounced by 250ms so typing does not fire a request per keystroke.

**Extend:** sort by rating or fee · district filter · pagination · "no results
in this area, here are nearby ones".

**Done when:** every filter combination returns correct results, the empty state
reads well, and you can explain the aggregate.

---

## Member D — Contact forms, reviews, deployment

**Branch:** `feat/contact-reviews`

**Your files:** `backend/controllers/leadController.js` ·
`backend/controllers/reviewController.js` · `backend/seed/seedData.js` ·
`pages/ProviderDetail.jsx` · `components/LeadForm.jsx` ·
`components/ReviewForm.jsx` · `README.md` · deployment

**You own requirements 4, 5 and 10** — the forms and the live demo.

Working today: a listing detail page with the lead form and review form side by
side, per-field validation messages from the backend, a success state, and
reviews refreshing immediately after one is posted.

**Understand before you demo:**
- The backend returns `{ message, errors: { field: 'why' } }` and the forms
  render `err.errors[fieldName]` under each input. That is requirement 5.
- A pharmacy enquiry rejects a missing `medicineName`, but a doctor request does
  not — the rule is in `leadController.js`, not the form.
- `getMyLeads` filters on `req.providerId` from the JWT, never a client-supplied
  id. Ask yourself what would break if it did not.

**Deployment:**
- Backend to Render/Railway: set `MONGO_URI` and `JWT_SECRET`
- Frontend to Vercel/Netlify: set `VITE_API_URL` to the deployed backend URL
- Atlas Network Access must stay `0.0.0.0/0`
- Render free tier cold-starts ~50s — hit the URL before recording
- **Test the live link in incognito before submitting**

Also: fill in the README team table and AI declaration, and review/merge PRs.

**Done when:** a request sent on the deployed site appears in that provider's
dashboard, in incognito, and the README has no `TODO` left.

---

## Timeline

| Time | What | Who |
|---|---|---|
| 0–15 | Clone, install, seed, confirm it runs | everyone |
| 15–45 | Read your component. Run it. Understand it. | everyone |
| 45–150 | Extend and polish your part | everyone |
| 150–195 | Integration: merge branches, fix conflicts, `npm test` | D merges |
| 195–215 | Deploy both halves | D |
| 215–240 | Incognito test, record 2-min video, submit | everyone |

The demo that scores best: search a doctor by area → open the listing → send a
request → log in as that doctor → the request is there. Practise it once.
