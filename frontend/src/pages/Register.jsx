import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api';
import { useAuth } from '../context/AuthContext';
import Field from '../components/Field';

export default function Register() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('doctor');
  const [form, setForm] = useState({
    name: '', email: '', password: '', area: '', district: '',
    contact: '', about: '', specialization: '', fee: '', openHours: '',
  });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [sending, setSending] = useState(false);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErrors({}); setBanner(''); setSending(true);
    try {
      signIn(await register({ role, ...form }));
      navigate('/dashboard');
    } catch (err) {
      setErrors(err.errors || {});
      setBanner(err.message);
    } finally {
      setSending(false);
    }
  };

  const tab = (value, label) => (
    <button
      type="button"
      onClick={() => setRole(value)}
      aria-pressed={role === value}
      className={`flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition ${
        role === value ? 'bg-ink text-white' : 'text-body hover:text-ink'
      }`}
    >
      {label}
    </button>
  );

  return (
    <section className="mx-auto max-w-xl px-5 py-16 sm:px-8">
      <h1 className="text-center text-5xl sm:text-6xl">List yourself</h1>
      <p className="mx-auto mt-4 max-w-sm text-center text-body">
        Patients find you by area, and their requests arrive in your dashboard.
      </p>

      <div className="mt-8 flex gap-1 rounded-full border border-line bg-surface p-1">
        {tab('doctor', 'I am a doctor')}
        {tab('pharmacy', 'I am a pharmacy')}
      </div>

      <form onSubmit={submit} noValidate className="card mt-5 space-y-4 p-7">
        {banner && !Object.keys(errors).length && (
          <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">{banner}</p>
        )}

        <Field label={role === 'doctor' ? 'Full name' : 'Pharmacy name'} name="name"
               value={form.name} onChange={set} error={errors.name}
               placeholder={role === 'doctor' ? 'Dr. Nimal Perera' : 'Senehasa Pharmacy'} />

        <Field label="Email" name="email" type="email" autoComplete="email"
               value={form.email} onChange={set} error={errors.email} placeholder="you@example.com" />

        <Field label="Password" name="password" type="password" hint="at least 8 characters"
               autoComplete="new-password" value={form.password} onChange={set} error={errors.password} />

        {role === 'doctor' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Specialization" name="specialization" value={form.specialization}
                   onChange={set} error={errors.specialization} placeholder="General Physician" />
            <Field label="Consultation fee" hint="Rs." name="fee" type="number" min="0"
                   value={form.fee} onChange={set} error={errors.fee} placeholder="2000" />
          </div>
        ) : (
          <Field label="Opening hours" name="openHours" value={form.openHours}
                 onChange={set} error={errors.openHours} placeholder="8am - 9pm daily" />
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Area" name="area" value={form.area} onChange={set}
                 error={errors.area} placeholder="Kandy" />
          <Field label="District" hint="optional" name="district" value={form.district}
                 onChange={set} error={errors.district} placeholder="Kandy" />
        </div>

        <Field label="Contact number" hint="optional" name="contact" value={form.contact}
               onChange={set} error={errors.contact} placeholder="0771234567" inputMode="tel" />

        <Field as="textarea" rows={3} label="About" hint="optional" name="about"
               value={form.about} onChange={set} error={errors.about}
               placeholder="A sentence patients will see on your listing." />

        <button type="submit" disabled={sending} className="btn-primary w-full">
          {sending ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-body">
        Already listed?{' '}
        <Link to="/login" className="text-ink underline underline-offset-4">Sign in</Link>
      </p>
    </section>
  );
}
