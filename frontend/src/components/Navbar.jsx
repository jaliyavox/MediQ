import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/doctors', label: 'Doctors' },
  { to: '/pharmacies', label: 'Pharmacies' },
];

export default function Navbar() {
  const { provider, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const linkClass = ({ isActive }) =>
    `text-sm transition ${isActive ? 'text-ink' : 'text-body hover:text-ink'}`;

  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-canvas/80 backdrop-blur-md">
      <nav className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          <Link to="/" className="font-display text-2xl tracking-tight text-ink">
            MediQ
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {provider ? (
              <>
                <NavLink to="/dashboard" className={linkClass}>
                  Dashboard
                </NavLink>
                <button onClick={signOut} className="text-sm text-subtle transition hover:text-ink">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-body transition hover:text-ink">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary !px-5 !py-2">
                  List yourself
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="-mr-2 flex h-10 w-10 items-center justify-center md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span className="relative block h-3 w-5">
              <span className={`absolute left-0 block h-px w-5 bg-ink transition ${open ? 'top-1.5 rotate-45' : 'top-0'}`} />
              <span className={`absolute left-0 top-1.5 block h-px w-5 bg-ink transition ${open ? 'opacity-0' : ''}`} />
              <span className={`absolute left-0 block h-px w-5 bg-ink transition ${open ? 'top-1.5 -rotate-45' : 'top-3'}`} />
            </span>
          </button>
        </div>

        {open && (
          <div className="space-y-1 border-t border-line py-4 md:hidden">
            {[...links, ...(provider ? [{ to: '/dashboard', label: 'Dashboard' }] : [])].map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`block py-2 text-sm ${pathname === l.to ? 'text-ink' : 'text-body'}`}
              >
                {l.label}
              </NavLink>
            ))}
            <div className="pt-3">
              {provider ? (
                <button onClick={() => { signOut(); setOpen(false); }} className="btn-secondary w-full">
                  Sign out
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/register" onClick={() => setOpen(false)} className="btn-primary w-full">
                    List yourself
                  </Link>
                  <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary w-full">
                    Sign in
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
