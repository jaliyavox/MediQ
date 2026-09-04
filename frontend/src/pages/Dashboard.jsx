import { useEffect, useState } from 'react';
import { getMyLeads, getMyReviews, updateLeadStatus } from '../api';
import { useAuth } from '../context/AuthContext';
import Stars from '../components/Stars';

const STATUS_STYLES = {
  new: 'bg-teal-100 text-teal-800',
  contacted: 'bg-amber-100 text-amber-800',
  closed: 'bg-slate-200 text-slate-600',
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

  const advance = async (lead) => {
    const next = lead.status === 'new' ? 'contacted' : lead.status === 'contacted' ? 'closed' : 'new';
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

  if (loading) return <p className="text-slate-500">Loading...</p>;

  return (
    <section>
      <h1 className="text-2xl font-bold text-slate-900">{provider.name}</h1>
      <p className="mt-1 text-slate-600">
        {provider.role === 'doctor' ? provider.specialization : 'Pharmacy'} &middot; {provider.area}
      </p>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-2xl font-bold text-slate-900">{leads.length}</p>
          <p className="text-sm text-slate-600">Total requests</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-2xl font-bold text-teal-700">{leads.filter((l) => l.status === 'new').length}</p>
          <p className="text-sm text-slate-600">New, not yet contacted</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-2xl font-bold text-slate-900">
            <Stars rating={avg} count={reviews.length} />
          </div>
          <p className="text-sm text-slate-600">Average rating</p>
        </div>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Patient requests</h2>
      {leads.length === 0 ? (
        <p className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
          No requests yet. They will appear here as soon as a patient contacts you.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {leads.map((lead) => (
            <li key={lead._id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900">{lead.patientName}</p>
                  <a href={`tel:${lead.contactNumber}`} className="text-sm text-teal-700 underline">
                    {lead.contactNumber}
                  </a>
                </div>
                <button
                  onClick={() => advance(lead)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[lead.status]}`}
                  title="Click to change status"
                >
                  {lead.status}
                </button>
              </div>
              {lead.medicineName && (
                <p className="mt-2 text-sm">
                  <span className="text-slate-500">Medicine: </span>
                  <span className="font-medium text-slate-800">{lead.medicineName}</span>
                </p>
              )}
              {lead.note && <p className="mt-1 text-sm text-slate-600">{lead.note}</p>}
              <p className="mt-2 text-xs text-slate-400">
                {new Date(lead.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Your reviews</h2>
      {reviews.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">No reviews yet.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {reviews.map((r) => (
            <li key={r._id} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-800">{r.patientName}</span>
                <span className="text-amber-500">
                  {'★'.repeat(r.rating)}<span className="text-slate-300">{'★'.repeat(5 - r.rating)}</span>
                </span>
              </div>
              {r.comment && <p className="mt-1 text-sm text-slate-600">{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
