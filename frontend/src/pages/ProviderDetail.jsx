import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProvider, getReviews } from '../api';
import LeadForm from '../components/LeadForm';
import ReviewForm from '../components/ReviewForm';
import Stars from '../components/Stars';

export default function ProviderDetail() {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');

  const load = () =>
    Promise.all([getProvider(id), getReviews(id)])
      .then(([p, r]) => { setProvider(p); setReviews(r); })
      .catch((err) => setError(err.message));

  useEffect(() => { load(); }, [id]);

  if (error) {
    return (
      <section className="mx-auto max-w-6xl px-5 py-32 text-center sm:px-8">
        <h1 className="text-4xl">{error}</h1>
        <Link to="/doctors" className="btn-quiet mt-6">Back to listings</Link>
      </section>
    );
  }

  if (!provider) {
    return <p className="mx-auto max-w-6xl px-5 py-32 text-center text-subtle sm:px-8">Loading…</p>;
  }

  const isDoctor = provider.role === 'doctor';
  const facts = [
    ['Area', [provider.area, provider.district].filter(Boolean).join(', ')],
    ['Contact', provider.contact],
    isDoctor
      ? ['Consultation fee', provider.fee > 0 ? `Rs. ${provider.fee.toLocaleString()}` : null]
      : ['Open', provider.openHours],
  ].filter(([, v]) => v);

  return (
    <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
      <Link to={isDoctor ? '/doctors' : '/pharmacies'}
            className="text-sm text-body underline underline-offset-4 hover:text-ink">
        &larr; All {isDoctor ? 'doctors' : 'pharmacies'}
      </Link>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="eyebrow">{isDoctor ? provider.specialization : 'Pharmacy'}</p>
          <h1 className="mt-3 text-5xl sm:text-6xl">{provider.name}</h1>

          <div className="mt-4">
            <Stars rating={provider.avgRating} count={provider.reviewCount} size="lg" />
          </div>

          {provider.about && (
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-body">{provider.about}</p>
          )}

          <dl className="mt-8 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-3">
            {facts.map(([k, v]) => (
              <div key={k} className="bg-surface p-5">
                <dt className="eyebrow">{k}</dt>
                <dd className="mt-2 text-ink">{v}</dd>
              </div>
            ))}
          </dl>

          <h2 className="mt-14 text-3xl">
            Reviews {reviews.length > 0 && <span className="text-subtle">({reviews.length})</span>}
          </h2>

          {reviews.length === 0 ? (
            <p className="mt-4 text-body">No reviews yet. Be the first to leave one.</p>
          ) : (
            <ul className="mt-6 space-y-px overflow-hidden rounded-card border border-line bg-line">
              {reviews.map((r) => (
                <li key={r._id} className="bg-surface p-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium text-ink">{r.patientName}</span>
                    <span className="text-sm text-accent" aria-label={`${r.rating} out of 5`}>
                      {'★'.repeat(r.rating)}<span className="text-line">{'★'.repeat(5 - r.rating)}</span>
                    </span>
                  </div>
                  {r.comment && <p className="mt-2 text-sm leading-relaxed text-body">{r.comment}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <LeadForm provider={provider} />
          <ReviewForm providerId={provider._id} onAdded={load} />
        </div>
      </div>
    </section>
  );
}
