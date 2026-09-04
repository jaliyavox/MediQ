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

## Component ownership at a glance

Every file in the app belongs to exactly one member. Stay inside your column and
you will not hit a merge conflict.

| | Member A | Member B | Member C | Member D |
|---|---|---|---|---|
| **Theme** | Accounts | Design system | Search | Forms & ship |
| **Branch** | `feat/accounts` | `feat/ui-shell` | `feat/directory` | `feat/contact-reviews` |
| **Backend** | `authController.js`<br>`middleware/auth.js` | — | `providerController.js` | `leadController.js`<br>`reviewController.js`<br>`validateInput.js`<br>`seed/seedData.js`<br>`tests/e2e.js` |
| **Pages** | `Register.jsx`<br>`Login.jsx`<br>`Dashboard.jsx` | `Home.jsx`<br>`NotFound.jsx` | `Directory.jsx`<br>`Doctors.jsx`<br>`Pharmacies.jsx` | `ProviderDetail.jsx` |
| **Components** | `ProtectedRoute.jsx`<br>`AuthContext.jsx` | `Navbar.jsx`<br>`Footer.jsx`<br>`Field.jsx`<br>`Stars.jsx`<br>`index.css` | `SearchBar.jsx`<br>`ProviderCard.jsx` | `LeadForm.jsx`<br>`ReviewForm.jsx` |
| **Owns requirement** | 8 (navigation/auth) | 1, 2, 7 (UI + responsive) | 6 (search/filter/calculate) | 4, 5, 10 (forms + demo) |

**Locked — nobody edits alone:** `backend/server.js` · `backend/app.js` ·
`backend/models/*` · `frontend/src/App.jsx` · `frontend/src/api/*` ·
`frontend/vite.config.js` · `index.html` · both `package.json`

---

## Member A — Accounts and dashboard

**Branch:** `feat/accounts` · **Requirement 8**

Registration with bcrypt hashing, JWT login, a session that survives refresh,
and a dashboard showing leads and reviews with stat tiles and clickable status
badges.

**Understand before you demo**
- Why `login` returns the *same* message for a wrong email and a wrong password
  (so the form cannot be used to discover which accounts exist).
- Why `passwordHash` is deleted in the model's `toJSON` rather than in each
  controller.
- How `AuthContext` restores a session from `localStorage` on page load.
- The status badge in `Dashboard.jsx` cycles new → contacted → closed on click.

**Extend:** an "edit my listing" page · password strength hint · a
`status: pending` approval flow · a lead count badge in the navbar.

**Done when:** you can register, sign out, sign back in, refresh, stay logged
in — and explain the three points above.

---

## Member B — Design system and home page

**Branch:** `feat/ui-shell` · **Requirements 1, 2 and 7**

You own how the entire app looks. `index.css` is the design system: fonts,
colours, spacing and the `.btn-primary` / `.card` / `.tile` / `.input` classes
every other member uses.

**Understand before you demo**
- Changing `--color-accent` in `index.css` restyles the whole app. That is the
  point — nobody hardcodes colours in components.
- `Field.jsx` is why every form shows validation errors identically: it takes an
  `error` prop and renders the message plus the red border.
- The navbar collapses to a hamburger under 768px.
- The hero card uses **normal flow, not absolute positioning** — floating chips
  over the card overlapped the doctor's name at some widths. Don't reintroduce that.

**Extend:** a dark section between stats and problem · hover states on cards ·
loading skeletons · a real logo mark.

**Done when:** nothing overflows horizontally at 375px (check
`document.documentElement.scrollWidth === 375`), and Home explains the problem
to someone who has never heard of MediQ.

---

## Member C — Directory and search

**Branch:** `feat/directory` · **Requirement 6 — the biggest scoring item**

One `Directory` component powers both `/doctors` and `/pharmacies`. Debounced
search, area and specialization filters populated from the database, result
counts, and an empty state with a "clear filters" button.

**Understand before you demo**
- `withRatings()` computes every provider's average rating in **one** aggregate
  query, not one per provider. Be able to explain why that matters.
- The average is recalculated from the Review collection on every request and is
  never stored on the provider. Cache it and it goes stale.
- Search is debounced 250ms so typing does not fire a request per keystroke.
- User input is escaped before becoming a RegExp. Without that, typing `(` in
  the search box returned a 500. There are regression tests for this.

**Extend:** sort by rating or fee · a district filter · pagination · remember
the last filter in the URL query string.

**Done when:** every filter combination returns correct results, the empty state
reads well, and you can explain the aggregate.

---

## Member D — Contact forms, reviews, deployment

**Branch:** `feat/contact-reviews` · **Requirements 4, 5 and 10**

The listing detail page with the lead form and review form, per-field validation
messages, a success state, and reviews refreshing immediately after posting.
You also own validation for the whole app, the seed data, and the test suite.

**Understand before you demo**
- The backend returns `{ message, errors: { field: 'why' } }` and the forms
  render `err.errors[fieldName]` under each input. That *is* requirement 5.
- A pharmacy enquiry rejects a missing `medicineName`; a doctor request does
  not. The rule lives in `leadController.js`, not the form.
- `getMyLeads` filters on `req.providerId` from the JWT, never a client-supplied
  id. Work out what would break if it did not.
- You own `validateInput.js`, so Member A must ask you before changing the
  registration rules.

**Deployment**
- Backend to Render/Railway: set `MONGO_URI` and `JWT_SECRET`
- Frontend to Vercel/Netlify: set `VITE_API_URL` to the deployed backend URL
- Atlas Network Access stays `0.0.0.0/0`
- Render free tier cold-starts ~50s — hit the URL before recording
- **Test the live link in incognito before submitting**

Also: fill the README team table and AI declaration, and review/merge PRs.

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
