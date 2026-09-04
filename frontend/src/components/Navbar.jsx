// OWNER: Member B - make this responsive (hamburger on mobile) for requirement 7.
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Home' },
  { to: '/clinics', label: 'Clinics' },
  { to: '/book', label: 'Book Token' },
  { to: '/pharmacies', label: 'Pharmacies' },
  { to: '/doctors', label: 'Doctors' },
];

export default function Navbar() {
  const { doctor, logout } = useAuth();

  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 py-3">
        <Link to="/" className="text-lg font-bold text-teal-700">
          MediQ
        </Link>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              isActive ? 'text-teal-700 font-medium' : 'text-gray-600'
            }
          >
            {l.label}
          </NavLink>
        ))}
        <div className="ml-auto">
          {doctor ? (
            <button onClick={logout} className="text-gray-600">
              Log out ({doctor.name})
            </button>
          ) : (
            <Link to="/doctor/login" className="text-gray-600">
              Doctor login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
