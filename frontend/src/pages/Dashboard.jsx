import { useEffect, useState } from 'react';
import { getMyLeads, getMyReviews, updateLeadStatus, updateMyProfile } from '../api';
import { useAuth } from '../context/AuthContext';
import Field from '../components/Field';

const STATUS = {
  new: 'bg-accent-soft text-accent',
  contacted: 'bg-muted text-body',
  closed: 'bg-muted text-subtle line-through',
};

const profileFrom = (provider) => ({
  name: provider.name || '', email: provider.email || '', area: provider.area || '',
  district: provider.district || '', contact: provider.contact || '', about: provider.about || '',
  specialization: provider.specialization || '', fee: provider.fee ?? '', openHours: provider.openHours || '',
});

export default function Dashboard() {
  const { provider, updateProvider } = useAuth();
  const [leads, setLeads] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => profileFrom(provider));
  const [profileErrors, setProfileErrors] = useState({});
  const [profileMessage, setProfileMessage] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

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

  const setProfileField = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileErrors({}); setProfileMessage(''); setSavingProfile(true);
    try {
      const updated = await updateMyProfile(form);
      updateProvider(updated);
      setForm(profileFrom(updated));
      setEditing(false);
      setProfileMessage('Profile updated.');
    } catch (err) {
      setProfileErrors(err.errors || {});
      setProfileMessage(err.message);
    } finally {
      setSavingProfile(false);
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="mt-3 text-5xl sm:text-6xl">{provider.name}</h1>
        <button
          type="button"
          className="btn-secondary mt-4"
          onClick={() => {
            setForm(profileFrom(provider));
            setProfileErrors({});
            setProfileMessage('');
            setEditing(!editing);
          }}
        >
          {editing ? 'Cancel' : 'Edit profile'}
        </button>
      </div>

      {profileMessage && !Object.keys(profileErrors).length && (
        <p className="mt-4 rounded-xl bg-accent-soft px-4 py-3 text-sm text-accent">{profileMessage}</p>
      )}

      {editing && (
        <form onSubmit={saveProfile} noValidate className="card mt-8 space-y-4 p-7">
          {profileMessage && Object.keys(profileErrors).length > 0 && (
            <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">{profileMessage}</p>
          )}
          <Field label={provider.role === 'doctor' ? 'Full name' : 'Pharmacy name'} name="name"
                 value={form.name} onChange={setProfileField} error={profileErrors.name} />
          <Field label="Email" name="email" type="email" value={form.email}
                 onChange={setProfileField} error={profileErrors.email} />
          {provider.role === 'doctor' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Specialization" name="specialization" value={form.specialization}
                     onChange={setProfileField} error={profileErrors.specialization} />
              <Field label="Consultation fee" hint="Rs." name="fee" type="number" min="0"
                     value={form.fee} onChange={setProfileField} error={profileErrors.fee} />
            </div>
          ) : (
            <Field label="Opening hours" name="openHours" value={form.openHours}
                   onChange={setProfileField} error={profileErrors.openHours} />
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Area" name="area" value={form.area} onChange={setProfileField}
                   error={profileErrors.area} />
            <Field label="District" hint="optional" name="district" value={form.district}
                   onChange={setProfileField} error={profileErrors.district} />
          </div>
          <Field label="Contact number" hint="optional" name="contact" value={form.contact}
                 onChange={setProfileField} error={profileErrors.contact} inputMode="tel" />
          <Field as="textarea" rows={3} label="About" hint="optional" name="about"
                 value={form.about} onChange={setProfileField} error={profileErrors.about} />
          <button type="submit" disabled={savingProfile} className="btn-primary w-full">
            {savingProfile ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      )}

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
