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
    setErrors({});
    setBanner('');
    setSending(true);
    try {
      const res = await register({ role, ...form });
      signIn(res);
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
      className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
        role === value ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <section className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-slate-900">List yourself on MediQ</h1>
      <p className="mt-1 mb-5 text-slate-600">
        Patients find you by area, and their requests arrive in your dashboard.
      </p>

      <div className="mb-4 flex gap-2">{tab('doctor', 'I am a doctor')}{tab('pharmacy', 'I am a pharmacy')}</div>

      <form onSubmit={submit} noValidate className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
        {banner && !Object.keys(errors).length && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{banner}</p>
        )}

        <Field label={role === 'doctor' ? 'Full name' : 'Pharmacy name'} name="name"
               value={form.name} onChange={set} error={errors.name}
               placeholder={role === 'doctor' ? 'Dr. Nimal Perera' : 'Senehasa Pharmacy'} />

        <Field label="Email" name="email" type="email" value={form.email}
               onChange={set} error={errors.email} placeholder="you@example.com" />

        <Field label="Password" name="password" type="password" value={form.password}
               onChange={set} error={errors.password} placeholder="At least 8 characters" />

        {role === 'doctor' ? (
          <>
            <Field label="Specialization" name="specialization" value={form.specialization}
                   onChange={set} error={errors.specialization} placeholder="General Physician" />
            <Field label="Consultation fee (Rs.)" name="fee" type="number" min="0"
                   value={form.fee} onChange={set} error={errors.fee} placeholder="2000" />
          </>
        ) : (
          <Field label="Opening hours" name="openHours" value={form.openHours}
                 onChange={set} error={errors.openHours} placeholder="8am - 9pm daily" />
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Area" name="area" value={form.area} onChange={set}
                 error={errors.area} placeholder="Kandy" />
          <Field label="District" name="district" value={form.district} onChange={set}
                 error={errors.district} placeholder="Kandy" />
        </div>

        <Field label="Contact number" name="contact" value={form.contact} onChange={set}
               error={errors.contact} placeholder="0771234567" inputMode="tel" />

        <Field as="textarea" rows={3} label="About (optional)" name="about" value={form.about}
               onChange={set} error={errors.about}
               placeholder="A sentence patients will see on your listing." />

        <button type="submit" disabled={sending}
                className="w-full rounded-lg bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800 disabled:opacity-60">
          {sending ? 'Creating account...' : 'Create account'}
        </button>

        <p className="text-center text-sm text-slate-600">
          Already listed? <Link to="/login" className="text-teal-700 underline">Sign in</Link>
        </p>
      </form>
    </section>
  );
}
