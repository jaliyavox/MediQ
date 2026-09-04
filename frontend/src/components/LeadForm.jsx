import { useState } from 'react';
import { createLead } from '../api';
import Field from './Field';

// Requirement 4 (a form) and requirement 5 (validation). Field-level errors
// come straight from the backend as err.errors, keyed by field name.
export default function LeadForm({ provider }) {
  const isPharmacy = provider.role === 'pharmacy';
  const empty = { patientName: '', contactNumber: '', medicineName: '', note: '' };

  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState('');
  const [banner, setBanner] = useState('');

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErrors({}); setBanner(''); setSending(true);
    try {
      const res = await createLead({ providerId: provider._id, ...form });
      setForm(empty);
      setSent(res.message);
    } catch (err) {
      setErrors(err.errors || {});
      setBanner(err.message);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="card p-6 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent">
          ✓
        </span>
        <h4 className="mt-4 text-lg">Request sent</h4>
        <p className="mt-2 text-sm leading-relaxed text-body">{sent}</p>
        <button onClick={() => setSent('')} className="btn-quiet mt-5">
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="card space-y-4 p-6">
      <div>
        <h4 className="text-lg">
          {isPharmacy ? 'Ask about a medicine' : 'Request a consultation'}
        </h4>
        <p className="mt-1 text-sm text-subtle">
          {provider.name} will call you back.
        </p>
      </div>

      {banner && !Object.keys(errors).length && (
        <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">{banner}</p>
      )}

      <Field label="Your name" name="patientName" value={form.patientName}
             onChange={set} error={errors.patientName} placeholder="Kasun Perera" />

      <Field label="Contact number" name="contactNumber" value={form.contactNumber}
             onChange={set} error={errors.contactNumber} placeholder="0771234567" inputMode="tel" />

      {isPharmacy && (
        <Field label="Medicine needed" name="medicineName" value={form.medicineName}
               onChange={set} error={errors.medicineName} placeholder="Paracetamol 500mg" />
      )}

      <Field as="textarea" rows={3} label="Note" hint="optional" name="note"
             value={form.note} onChange={set} error={errors.note}
             placeholder={isPharmacy ? 'Quantity, or anything else they should know'
                                     : 'Briefly, what do you need help with?'} />

      <button type="submit" disabled={sending} className="btn-primary w-full">
        {sending ? 'Sending…' : 'Send request'}
      </button>

      <p className="text-xs leading-relaxed text-subtle">
        Your name and number are shared only with {provider.name}.
      </p>
    </form>
  );
}
