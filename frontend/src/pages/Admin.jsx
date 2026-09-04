import { useCallback, useEffect, useMemo, useState } from 'react';
import Field from '../components/Field';
import {
  adminLogin,
  deleteAdminReview,
  getAdminMe,
  getAdminProviders,
  getAdminReviews,
  setProviderBan,
} from '../api';

const TOKEN_KEY = 'mediq_admin_token';

function AdminLogin({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setErrors({});
    setBanner('');
    setSending(true);
    try {
      onLogin(await adminLogin(form));
    } catch (err) {
      setErrors(err.errors || {});
      setBanner(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-5 py-16">
      <div className="w-full max-w-md">
        <div className="text-center">
          <p className="eyebrow !text-white/55">Restricted access</p>
          <h1 className="mt-3 text-5xl text-white">MediQ Admin</h1>
          <p className="mt-3 text-sm text-white/65">
            Review moderation and provider account controls.
          </p>
        </div>

        <form onSubmit={submit} noValidate className="mt-9 space-y-4 rounded-card bg-white p-7">
          {banner && (
            <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">{banner}</p>
          )}
          <Field
            label="Admin email"
            name="email"
            type="email"
            autoComplete="username"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            error={errors.email}
          />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            error={errors.password}
          />
          <button type="submit" disabled={sending} className="btn-primary w-full">
            {sending ? 'Signing in...' : 'Sign in to admin'}
          </button>
        </form>
        <a href="/" className="mt-6 block text-center text-sm text-white/60 hover:text-white">
          Back to MediQ
        </a>
      </div>
    </div>
  );
}

function AdminDashboard({ token, admin, onLogout }) {
  const [providers, setProviders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [tab, setTab] = useState('providers');
  const [query, setQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [providerRows, reviewRows] = await Promise.all([
        getAdminProviders(token),
        getAdminReviews(token),
      ]);
      setProviders(providerRows);
      setReviews(reviewRows);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const visibleProviders = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return providers;
    return providers.filter((provider) =>
      [provider.name, provider.email, provider.area, provider.role]
        .some((value) => value?.toLowerCase().includes(term))
    );
  }, [providers, query]);

  const visibleReviews = providerFilter
    ? reviews.filter((review) => review.providerId?._id === providerFilter)
    : reviews;

  const toggleBan = async (provider) => {
    const banned = !provider.isBanned;
    let reason = '';
    if (banned) {
      reason = window.prompt('Reason for suspending this listing:', 'Admin moderation') ?? '';
      if (!reason) return;
    }

    setBusyId(provider._id);
    setError('');
    try {
      const updated = await setProviderBan(token, provider._id, banned, reason);
      setProviders((rows) => rows.map((row) => row._id === updated._id ? updated : row));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId('');
    }
  };

  const removeReview = async (review) => {
    if (!window.confirm(`Remove the review from ${review.patientName}?`)) return;
    setBusyId(review._id);
    setError('');
    try {
      await deleteAdminReview(token, review._id);
      setReviews((rows) => rows.filter((row) => row._id !== review._id));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-ink text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-5 sm:px-8">
          <div>
            <p className="font-display text-2xl">MediQ Admin</p>
            <p className="mt-0.5 text-xs text-white/55">Signed in as {admin.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-white/65 hover:text-white">View website</a>
            <button onClick={onLogout} className="rounded-full border border-white/25 px-4 py-2 text-sm hover:border-white/60">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Administration</p>
            <h1 className="mt-2 text-5xl">Control centre</h1>
          </div>
          <button onClick={load} disabled={loading} className="btn-quiet">
            {loading ? 'Refreshing...' : 'Refresh data'}
          </button>
        </div>

        {error && <p className="mt-6 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">{error}</p>}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="tile"><p className="font-display text-5xl text-ink">{providers.length}</p><p className="eyebrow mt-2">Providers</p></div>
          <div className="tile"><p className="font-display text-5xl text-danger">{providers.filter((p) => p.isBanned).length}</p><p className="eyebrow mt-2">Suspended</p></div>
          <div className="tile"><p className="font-display text-5xl text-accent">{reviews.length}</p><p className="eyebrow mt-2">Reviews</p></div>
        </div>

        <div className="mt-10 flex gap-2 border-b border-line">
          {[
            ['providers', 'Providers'],
            ['reviews', 'Review moderation'],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition ${tab === value ? 'border-accent text-ink' : 'border-transparent text-subtle hover:text-ink'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'providers' ? (
          <section className="mt-7">
            <input
              type="search"
              className="input max-w-md"
              placeholder="Search name, email, area, or type"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />

            <div className="mt-5 overflow-x-auto rounded-card border border-line bg-surface">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-line bg-muted text-xs uppercase tracking-wider text-subtle">
                  <tr><th className="px-5 py-4">Provider</th><th className="px-5 py-4">Type</th><th className="px-5 py-4">Area</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {visibleProviders.map((provider) => (
                    <tr key={provider._id} className={provider.isBanned ? 'bg-danger-soft/40' : ''}>
                      <td className="px-5 py-4"><p className="font-medium text-ink">{provider.name}</p><p className="mt-1 text-xs text-subtle">{provider.email}</p></td>
                      <td className="px-5 py-4 capitalize">{provider.role}</td>
                      <td className="px-5 py-4">{provider.area}</td>
                      <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-medium ${provider.isBanned ? 'bg-danger-soft text-danger' : 'bg-accent-soft text-accent'}`}>{provider.isBanned ? 'Suspended' : 'Active'}</span>{provider.isBanned && provider.banReason && <p className="mt-2 max-w-xs text-xs text-subtle">{provider.banReason}</p>}</td>
                      <td className="px-5 py-4 text-right"><button onClick={() => toggleBan(provider)} disabled={busyId === provider._id} className={provider.isBanned ? 'btn-quiet' : 'rounded-full border border-danger/30 px-4 py-2 text-xs font-medium text-danger hover:bg-danger-soft'}>{busyId === provider._id ? 'Saving...' : provider.isBanned ? 'Restore' : 'Suspend'}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && visibleProviders.length === 0 && <p className="px-6 py-12 text-center text-body">No providers match this search.</p>}
            </div>
          </section>
        ) : (
          <section className="mt-7">
            <label className="block max-w-md">
              <span className="mb-1.5 block text-sm font-medium text-ink">Filter by provider</span>
              <select className="input" value={providerFilter} onChange={(event) => setProviderFilter(event.target.value)}>
                <option value="">All doctors and pharmacies</option>
                {providers.map((provider) => <option key={provider._id} value={provider._id}>{provider.name} ({provider.role})</option>)}
              </select>
            </label>

            <div className="mt-5 space-y-3">
              {visibleReviews.map((review) => (
                <article key={review._id} className="card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-ink">{review.patientName}</p>
                      <p className="mt-1 text-sm text-accent">{'★'.repeat(review.rating)}<span className="text-line">{'★'.repeat(5 - review.rating)}</span></p>
                    </div>
                    <button onClick={() => removeReview(review)} disabled={busyId === review._id} className="rounded-full border border-danger/30 px-4 py-2 text-xs font-medium text-danger hover:bg-danger-soft">
                      {busyId === review._id ? 'Removing...' : 'Remove review'}
                    </button>
                  </div>
                  {review.comment && <p className="mt-3 text-sm leading-relaxed text-body">{review.comment}</p>}
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-3 text-xs text-subtle">
                    <span className="font-medium text-ink">{review.providerId?.name || 'Deleted provider'}</span>
                    {review.providerId && <span className="capitalize">{review.providerId.role} · {review.providerId.area}</span>}
                    <span>{new Date(review.createdAt).toLocaleString()}</span>
                  </div>
                </article>
              ))}
              {!loading && visibleReviews.length === 0 && <div className="rounded-card bg-muted px-8 py-14 text-center text-body">No reviews found for this provider.</div>}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(Boolean(token));

  useEffect(() => {
    if (!token) return;
    getAdminMe(token)
      .then(setAdmin)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setChecking(false));
  }, [token]);

  const signIn = (session) => {
    localStorage.setItem(TOKEN_KEY, session.token);
    setToken(session.token);
    setAdmin(session.admin);
    setChecking(false);
  };

  const signOut = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setAdmin(null);
  };

  if (checking) {
    return <div className="flex min-h-screen items-center justify-center bg-ink text-sm text-white/65">Checking admin session...</div>;
  }
  if (!token || !admin) return <AdminLogin onLogin={signIn} />;
  return <AdminDashboard token={token} admin={admin} onLogout={signOut} />;
}
