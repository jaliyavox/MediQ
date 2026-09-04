import { useEffect, useState } from 'react';
import { getMyLeads, getMyReviews, updateLeadStatus } from '../api';
import { useAuth } from '../context/AuthContext';
import Stars from '../components/Stars';

const STATUS = {
  new: 'bg-accent-soft text-accent',
  contacted: 'bg-muted text-body',
  closed: 'bg-muted text-subtle line-through',
};

export default function Dashboard() {
  const { provider } = useAuth();
  const [leads, setLeads] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyLeads(), getMyReviews()])
      .then(([l, r]) => { setLeads(l); setReviews(r); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Cycles new -> contacted -> closed -> new, so the whole flow is demoable
  // from one control without building a separate edit screen.
  const advance = async (lead) => {
    const next = lead.status === 'new' ? 'contacted'
               : lead.status === 'contacted' ? 'closed' : 'new';
    try {
      const updated = await updateLeadStatus(lead._id, next);
      setLeads((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
    } catch (err) {
      setError(err.message);
    }
  };

  const avg = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : null;

  if (loading) {
    return <p className="mx-auto max-w-6xl px-5 py-32 text-center text-subtle sm:px-8">Loading…</p>;
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
      <p className="eyebrow">
        {provider.role === 'doctor' ? provider.specialization : 'Pharmacy'} · {provider.area}
      </p>
      <h1 className="mt-3 text-5xl sm:text-6xl">{provider.name}</h1>

      {error && (
        <p className="mt-6 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">{error}</p>
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="tile">
          <p className="font-display text-5xl text-ink">{leads.length}</p>
          <p className="eyebrow mt-2">Total requests</p>
        </div>
        <div className="tile">
          <p className="font-display text-5xl text-accent">
            {leads.filter((l) => l.status === 'new').length}
          </p>
          <p className="eyebrow mt-2">Not yet contacted</p>
        </div>
        <div className="tile">
          <p className="font-display text-5xl text-ink">{avg ?? '—'}</p>
          <p className="eyebrow mt-2">Average rating</p>
        </div>
      </div>

      <h2 className="mt-16 text-3xl">Patient requests</h2>
      {leads.length === 0 ? (
        <div className="mt-6 rounded-card border border-line bg-muted px-8 py-16 text-center">
          <p className="font-display text-2xl text-ink">Nothing yet</p>
          <p className="mt-2 text-body">
            Requests appear here as soon as a patient contacts you.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-px overflow-hidden rounded-card border border-line bg-line">
          {leads.map((lead) => (
            <li key={lead._id} className="bg-surface p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg text-ink">{lead.patientName}</p>
                  <a href={`tel:${lead.contactNumber}`}
                     className="text-sm text-body underline underline-offset-4 hover:text-ink">
                    {lead.contactNumber}
                  </a>
                </div>
                <button
                  onClick={() => advance(lead)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${STATUS[lead.status]}`}
                  title="Click to change status"
                >
                  {lead.status}
                </button>
              </div>

              {lead.medicineName && (
                <p className="mt-3 text-sm">
                  <span className="text-subtle">Medicine · </span>
                  <span className="text-ink">{lead.medicineName}</span>
                </p>
              )}
              {lead.note && <p className="mt-2 text-sm leading-relaxed text-body">{lead.note}</p>}
              <p className="mt-3 text-xs text-subtle">
                {new Date(lead.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-16 text-3xl">
        Your reviews {reviews.length > 0 && <span className="text-subtle">({reviews.length})</span>}
      </h2>
      {reviews.length === 0 ? (
        <p className="mt-4 text-body">No reviews yet.</p>
      ) : (
        <ul className="mt-6 space-y-px overflow-hidden rounded-card border border-line bg-line">
          {reviews.map((r) => (
            <li key={r._id} className="bg-surface p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium text-ink">{r.patientName}</span>
                <span className="text-sm text-accent">
                  {'★'.repeat(r.rating)}<span className="text-line">{'★'.repeat(5 - r.rating)}</span>
                </span>
              </div>
              {r.comment && <p className="mt-2 text-sm leading-relaxed text-body">{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
