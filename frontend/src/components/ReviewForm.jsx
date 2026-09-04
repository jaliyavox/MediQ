import { useState } from 'react';
import { addReview } from '../api';
import Field from './Field';

export default function ReviewForm({ providerId, onAdded }) {
  const empty = { patientName: '', rating: '', comment: '' };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [sending, setSending] = useState(false);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErrors({}); setBanner(''); setSending(true);
    try {
      await addReview(providerId, form);
      setForm(empty);
      onAdded?.();
    } catch (err) {
      setErrors(err.errors || {});
      setBanner(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="card space-y-4 p-6">
      <h4 className="text-lg">Leave a review</h4>

      {banner && !Object.keys(errors).length && (
        <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">{banner}</p>
      )}

      <Field label="Your name" name="patientName" value={form.patientName}
             onChange={set} error={errors.patientName} />

      <Field as="select" label="Rating" name="rating" value={form.rating}
             onChange={set} error={errors.rating}>
        <option value="">Choose a rating</option>
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</option>
        ))}
      </Field>

      <Field as="textarea" rows={3} label="Comment" hint="optional" name="comment"
             value={form.comment} onChange={set} error={errors.comment} />

      <button type="submit" disabled={sending} className="btn-secondary w-full">
        {sending ? 'Posting…' : 'Post review'}
      </button>
    </form>
  );
}
