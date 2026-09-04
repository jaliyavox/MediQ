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
    setErrors({}); setBanner(''); setSending(true);
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
    <section className="mx-auto max-w-md px-5 py-20 sm:px-8">
      <h1 className="text-center text-5xl">Sign in</h1>
      <p className="mt-3 text-center text-body">
        For doctors and pharmacies listed on MediQ.
      </p>

      <form onSubmit={submit} noValidate className="card mt-10 space-y-4 p-7">
        {banner && (
          <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">{banner}</p>
        )}

        <Field label="Email" name="email" type="email" autoComplete="email"
               value={form.email} onChange={set} error={errors.email} />
        <Field label="Password" name="password" type="password" autoComplete="current-password"
               value={form.password} onChange={set} error={errors.password} />

        <button type="submit" disabled={sending} className="btn-primary w-full">
          {sending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-body">
        Not listed yet?{' '}
        <Link to="/register" className="text-ink underline underline-offset-4">Create an account</Link>
      </p>
    </section>
  );
}
