import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Home' },
  { to: '/doctors', label: 'Find a Doctor' },
  { to: '/pharmacies', label: 'Find a Pharmacy' },
];

export default function Navbar() {
  const { provider, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `block py-2 sm:py-0 ${isActive ? 'font-semibold text-teal-700' : 'text-slate-600 hover:text-slate-900'}`;

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto max-w-5xl px-4">
        <div className="flex h-14 items-center justify-between">
          <Link to="/" className="text-lg font-bold tracking-tight text-teal-700">
            Medi<span className="text-slate-900">Q</span>
          </Link>

          <div className="hidden items-center gap-6 sm:flex">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
            {provider ? (
              <div className="flex items-center gap-3">
                <NavLink to="/dashboard" className={linkClass}>
                  Dashboard
                </NavLink>
                <button onClick={signOut} className="text-sm text-slate-500 hover:text-slate-900">
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                to="/register"
                className="rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-800"
              >
                List yourself
              </Link>
            )}
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded p-2 text-slate-600 sm:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span className="block h-0.5 w-5 bg-current" />
            <span className="mt-1 block h-0.5 w-5 bg-current" />
            <span className="mt-1 block h-0.5 w-5 bg-current" />
          </button>
        </div>

        {open && (
          <div className="border-t border-slate-100 pb-3 sm:hidden">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            {provider ? (
              <>
                <NavLink to="/dashboard" className={linkClass} onClick={() => setOpen(false)}>
                  Dashboard
                </NavLink>
                <button onClick={signOut} className="py-2 text-slate-500">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/register" className={linkClass} onClick={() => setOpen(false)}>
                  List yourself
                </NavLink>
                <NavLink to="/login" className={linkClass} onClick={() => setOpen(false)}>
                  Sign in
                </NavLink>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
