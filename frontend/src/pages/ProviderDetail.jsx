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
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="font-medium text-red-800">{error}</p>
        <Link to="/doctors" className="mt-2 inline-block text-sm text-teal-700 underline">
          Back to listings
        </Link>
      </div>
    );
  }

  if (!provider) return <p className="text-slate-500">Loading...</p>;

  const isDoctor = provider.role === 'doctor';

  return (
    <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <Link to={isDoctor ? '/doctors' : '/pharmacies'} className="text-sm text-teal-700 underline">
          &larr; Back to {isDoctor ? 'doctors' : 'pharmacies'}
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">{provider.name}</h1>
        <p className="text-teal-700">{isDoctor ? provider.specialization : 'Pharmacy'}</p>

        <div className="mt-2">
          <Stars rating={provider.avgRating} count={provider.reviewCount} />
        </div>

        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div><dt className="text-slate-500">Area</dt><dd className="text-slate-900">{provider.area}{provider.district && `, ${provider.district}`}</dd></div>
          {provider.contact && <div><dt className="text-slate-500">Contact</dt><dd className="text-slate-900">{provider.contact}</dd></div>}
          {isDoctor && provider.fee > 0 && <div><dt className="text-slate-500">Consultation fee</dt><dd className="text-slate-900">Rs. {provider.fee.toLocaleString()}</dd></div>}
          {!isDoctor && provider.openHours && <div><dt className="text-slate-500">Open</dt><dd className="text-slate-900">{provider.openHours}</dd></div>}
        </dl>

        {provider.about && <p className="mt-4 text-slate-600">{provider.about}</p>}

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          Reviews {reviews.length > 0 && <span className="text-slate-400">({reviews.length})</span>}
        </h2>

        {reviews.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            No reviews yet. Be the first to leave one.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {reviews.map((r) => (
              <li key={r._id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{r.patientName}</span>
                  <span className="text-amber-500" aria-label={`${r.rating} out of 5`}>
                    {'★'.repeat(r.rating)}
                    <span className="text-slate-300">{'★'.repeat(5 - r.rating)}</span>
                  </span>
                </div>
                {r.comment && <p className="mt-1 text-sm text-slate-600">{r.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-4">
        <LeadForm provider={provider} />
        <ReviewForm providerId={provider._id} onAdded={load} />
      </div>
    </section>
  );
}
