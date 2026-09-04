import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';
import { useAuth } from '../context/AuthContext';
import Field from '../components/Field';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
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
      signIn(await login(form));
      navigate('/dashboard');
    } catch (err) {
      setErrors(err.errors || {});
      setBanner(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
      <p className="mt-1 mb-5 text-slate-600">For doctors and pharmacies listed on MediQ.</p>

      <form onSubmit={submit} noValidate className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
        {banner && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{banner}</p>}

        <Field label="Email" name="email" type="email" value={form.email}
               onChange={set} error={errors.email} />
        <Field label="Password" name="password" type="password" value={form.password}
               onChange={set} error={errors.password} />

        <button type="submit" disabled={sending}
                className="w-full rounded-lg bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800 disabled:opacity-60">
          {sending ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="text-center text-sm text-slate-600">
          Not listed yet? <Link to="/register" className="text-teal-700 underline">Create an account</Link>
        </p>
      </form>
    </section>
  );
}
