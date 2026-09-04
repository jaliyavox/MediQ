import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getFilterOptions, getProviders, getTopReviews } from '../api';
import Stars from '../components/Stars';
import ProviderCard from '../components/ProviderCard';
import SearchBar from '../components/SearchBar';

// A composed preview of a real listing card, used as the hero visual.
// Built from the same tokens as the app, so the hero cannot drift out of sync
// with how listings actually look.
//
// Laid out in normal flow rather than with absolute positioning - floating
// chips over the card overlapped the name at some widths.
function HeroPreview() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-3 flex justify-end">
        <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3.5 py-2 text-xs font-medium text-ink shadow-[0_6px_24px_rgba(0,0,0,0.07)]">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] text-white">
            ✓
          </span>
          Request sent
        </span>
      </div>

      <div className="card p-7 shadow-[0_20px_60px_rgba(0,0,0,0.07)]">
        <p className="eyebrow">Dermatology</p>
        <h3 className="mt-2 text-3xl leading-tight">Dr. Kumari Fernando</h3>
        <p className="mt-1.5 text-sm text-body">Kandy · Rs. 3,500</p>

        <div className="mt-3">
          <Stars rating={4.5} count={8} />
        </div>

        <div className="mt-6 space-y-2 border-t border-line pt-5">
          {['Skin and allergy clinic', 'Usually replies within a day'].map((line) => (
            <p key={line} className="flex items-center gap-2.5 text-sm text-body">
              <span className="h-1 w-1 shrink-0 rounded-full bg-accent" />
              {line}
            </p>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-muted p-4">
          <p className="text-xs text-subtle">Your request</p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink">
            &ldquo;Rash on both arms for a week, can I come Saturday?&rdquo;
          </p>
          <div className="mt-4 rounded-full bg-ink py-2.5 text-center text-xs font-medium text-white">
            Send request
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [areas, setAreas] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [counts, setCounts] = useState({ doctors: null, pharmacies: null });
  const [role, setRole] = useState('doctor');
  const [query, setQuery] = useState('');
  const [area, setArea] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [matches, setMatches] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [searching, setSearching] = useState(false);

  // The numbers on the page are read from the database, not hardcoded, so a
  // demo never shows a figure that contradicts the listings.
  useEffect(() => {
    getFilterOptions().then((o) => {
      setAreas(o.areas);
      setSpecializations(o.specializations);
    }).catch(() => {});
    getTopReviews().then(setReviews).catch(() => {});
    Promise.all([getProviders({ role: 'doctor' }), getProviders({ role: 'pharmacy' })])
      .then(([d, p]) => setCounts({ doctors: d.length, pharmacies: p.length }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(() => {
      getProviders({
        role,
        q: query || undefined,
        area: area || undefined,
        specialization: role === 'doctor' ? specialization || undefined : undefined,
      })
        .then((data) => !cancelled && setMatches(data.slice(0, 6)))
        .catch(() => !cancelled && setMatches([]))
        .finally(() => !cancelled && setSearching(false));
    }, 250);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [role, query, area, specialization]);

  const switchRole = (nextRole) => {
    setRole(nextRole);
    setSpecialization('');
  };

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pt-14 pb-20 sm:px-8 sm:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-body">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent-soft text-[10px] text-accent">
                ★
              </span>
              Rated by real patients
            </span>

            <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl">
              Find care near you,
              <br />
              <span className="italic">before</span> you travel
            </h1>

            <p className="mt-6 max-w-md text-lg leading-relaxed text-body">
              Search doctors and pharmacies by area, see what other patients said,
              and send your request from home — no more wasted trips.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/doctors" className="btn-primary">
                Find a doctor
              </Link>
              <Link to="/pharmacies" className="btn-secondary">
                Find a pharmacy
              </Link>
            </div>
          </div>

          <HeroPreview />
        </div>
      </section>

      {/* Search directly from the landing page */}
      <section className="border-y border-line bg-muted/60">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="eyebrow">Start here</p>
              <h2 className="mt-3 text-4xl sm:text-5xl">Find care nearby</h2>
            </div>
            <div className="flex rounded-full border border-line bg-surface p-1" role="group" aria-label="Provider type">
              {[
                { value: 'doctor', label: 'Doctors' },
                { value: 'pharmacy', label: 'Pharmacies' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => switchRole(option.value)}
                  className={`rounded-full px-4 py-2 text-sm transition ${role === option.value ? 'bg-ink text-white' : 'text-body hover:text-ink'}`}
                  aria-pressed={role === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <SearchBar
              query={query} onQuery={setQuery}
              area={area} onArea={setArea} areas={areas}
              {...(role === 'doctor'
                ? { specialization, onSpecialization: setSpecialization, specializations }
                : {})}
            />
          </div>

          <div className="mt-5 flex items-center justify-between text-sm text-subtle">
            <span>{searching ? 'Searching…' : `${matches.length} nearby ${role}${matches.length === 1 ? '' : 's'}`}</span>
            <Link to={role === 'doctor' ? '/doctors' : '/pharmacies'} className="text-body underline underline-offset-4 hover:text-ink">
              View all
            </Link>
          </div>

          {!searching && matches.length > 0 && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {matches.map((provider) => <ProviderCard key={provider._id} provider={provider} />)}
            </div>
          )}
        </div>
      </section>

      {/* Areas strip - the reference's logo wall, adapted to real coverage */}
      {areas.length > 0 && (
        <section className="border-y border-line bg-surface/60">
          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
            <p className="eyebrow text-center">Listings across</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
              {areas.map((a) => (
                <span key={a} className="font-display text-xl text-subtle">
                  {a}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { value: counts.doctors, label: 'Doctors listed' },
            { value: counts.pharmacies, label: 'Pharmacies listed' },
            { value: areas.length || null, label: 'Areas covered' },
          ].map((s) => (
            <div key={s.label} className="tile">
              <p className="font-display text-6xl text-ink">
                {s.value ?? '—'}
              </p>
              <p className="eyebrow mt-3">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The problem - requirement 2 */}
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1fr]">
          <h2 className="text-4xl sm:text-5xl">
            The problem
            <br />
            we are solving
          </h2>
          <div className="space-y-4 text-lg leading-relaxed text-body">
            <p>
              Outside Colombo, finding the right doctor means asking around, and
              finding a medicine means travelling from pharmacy to pharmacy hoping
              one has it in stock.
            </p>
            <p>
              People take a day off work, pay for transport, and often come home
              with nothing. There is no single place to see who practises nearby,
              what they charge, or whether a pharmacy can supply a prescription.
            </p>
            <p className="text-ink">
              That cost falls hardest on the people who can least afford to lose a
              day&rsquo;s wages. MediQ puts both in one searchable list, and lets a
              patient send a request in under a minute.
            </p>
          </div>
        </div>
      </section>

      {/* Patient feedback */}
      {reviews.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="eyebrow">Patient voices</p>
              <h2 className="mt-3 text-4xl sm:text-5xl">Trusted by people nearby</h2>
            </div>
            <span className="hidden text-sm text-subtle sm:block">Top-rated experiences</span>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <article key={review._id} className="card flex flex-col p-6">
                <Stars rating={review.rating} />
                <p className="mt-5 flex-1 text-base leading-relaxed text-body">&ldquo;{review.comment || 'A great experience.'}&rdquo;</p>
                <div className="mt-6 border-t border-line pt-4">
                  <p className="text-sm font-medium text-ink">{review.patientName}</p>
                  <Link to={`/provider/${review.provider._id}`} className="mt-1 block text-sm text-subtle hover:text-ink">
                    {review.provider.name} · {review.provider.area}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <h2 className="text-4xl sm:text-5xl">How it works</h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-3">
          {[
            { n: '01', t: 'Search', b: 'Filter doctors by specialization and area, or pharmacies by area.' },
            { n: '02', t: 'Compare', b: 'Read ratings and comments left by other patients before deciding.' },
            { n: '03', t: 'Contact', b: 'Send a consultation request or medicine enquiry. They call you back.' },
          ].map((c) => (
            <div key={c.n} className="bg-surface p-8">
              <p className="eyebrow">{c.n}</p>
              <h4 className="mt-4 text-lg">{c.t}</h4>
              <p className="mt-2 text-sm leading-relaxed text-body">{c.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Provider CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-8 sm:px-8">
        <div className="rounded-card bg-ink px-8 py-14 text-center sm:px-14">
          <h2 className="text-4xl text-white sm:text-5xl">
            Are you a doctor
            <br className="hidden sm:block" /> or a pharmacy?
          </h2>
          <p className="mx-auto mt-5 max-w-md text-white/70">
            List yourself for free. Patient requests arrive in your dashboard with
            their phone number, ready to call back.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-medium text-ink transition hover:bg-white/90"
          >
            List yourself — it&rsquo;s free
          </Link>
        </div>
      </section>
    </>
  );
}
