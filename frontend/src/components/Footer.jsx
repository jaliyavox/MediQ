import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <p className="font-display text-xl text-ink">MediQ</p>
          <p className="mt-1 text-sm text-subtle">Check before you travel.</p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-body">
          <Link to="/doctors" className="hover:text-ink">Doctors</Link>
          <Link to="/pharmacies" className="hover:text-ink">Pharmacies</Link>
          <Link to="/register" className="hover:text-ink">List yourself</Link>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-5 pb-8 sm:px-8">
        <p className="text-xs text-subtle">
          A student project for SE3090. Listings shown are sample data, not real
          practitioners.
        </p>
      </div>
    </footer>
  );
}
