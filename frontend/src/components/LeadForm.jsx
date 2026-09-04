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
  const [status, setStatus] = useState(null); // 'sending' | 'sent'
  const [banner, setBanner] = useState('');

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setBanner('');
    setStatus('sending');
    try {
      const res = await createLead({ providerId: provider._id, ...form });
      setForm(empty);
      setStatus('sent');
      setBanner(res.message);
    } catch (err) {
      setErrors(err.errors || {});
      setBanner(err.message);
      setStatus(null);
    }
  };

  if (status === 'sent') {
    return (
      <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
        <p className="font-medium text-teal-900">Request sent</p>
        <p className="mt-1 text-sm text-teal-800">{banner}</p>
        <button onClick={() => setStatus(null)} className="mt-3 text-sm text-teal-700 underline">
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="font-semibold text-slate-900">
        {isPharmacy ? 'Ask if they have your medicine' : 'Request a consultation'}
      </h3>

      {banner && !Object.keys(errors).length && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{banner}</p>
      )}

      <Field label="Your name" name="patientName" value={form.patientName}
             onChange={set} error={errors.patientName} placeholder="Kasun Perera" />

      <Field label="Contact number" name="contactNumber" value={form.contactNumber}
             onChange={set} error={errors.contactNumber} placeholder="0771234567" inputMode="tel" />

      {isPharmacy && (
        <Field label="Medicine needed" name="medicineName" value={form.medicineName}
               onChange={set} error={errors.medicineName} placeholder="Paracetamol 500mg" />
      )}

      <Field as="textarea" rows={3} label="Note (optional)" name="note" value={form.note}
             onChange={set} error={errors.note}
             placeholder={isPharmacy ? 'Quantity, or anything else they should know' : 'Briefly, what do you need help with?'} />

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full rounded-lg bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending...' : 'Send request'}
      </button>
      <p className="text-xs text-slate-500">
        Your name and number are shared only with {provider.name}.
      </p>
    </form>
  );
}
