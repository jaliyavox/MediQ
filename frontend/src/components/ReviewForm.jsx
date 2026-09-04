import { useState } from 'react';
import { addReview } from '../api';
import Field from './Field';

export default function ReviewForm({ providerId, onAdded }) {
  const [form, setForm] = useState({ patientName: '', rating: '', comment: '' });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [sending, setSending] = useState(false);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setBanner('');
    setSending(true);
    try {
      const review = await addReview(providerId, form);
      setForm({ patientName: '', rating: '', comment: '' });
      onAdded?.(review);
    } catch (err) {
      setErrors(err.errors || {});
      setBanner(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="font-semibold text-slate-900">Leave a review</h3>

      {banner && !Object.keys(errors).length && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{banner}</p>
      )}

      <Field label="Your name" name="patientName" value={form.patientName}
             onChange={set} error={errors.patientName} />

      <Field as="select" label="Rating" name="rating" value={form.rating}
             onChange={set} error={errors.rating}>
        <option value="">Choose a rating</option>
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>
        ))}
      </Field>

      <Field as="textarea" rows={3} label="Comment (optional)" name="comment"
             value={form.comment} onChange={set} error={errors.comment} />

      <button
        type="submit"
        disabled={sending}
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      >
        {sending ? 'Posting...' : 'Post review'}
      </button>
    </form>
  );
}
