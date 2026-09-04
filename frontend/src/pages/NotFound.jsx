import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-32 text-center sm:px-8">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 text-5xl sm:text-6xl">Page not found</h1>
      <p className="mx-auto mt-4 max-w-sm text-body">
        That link does not lead anywhere. The listing may have been removed.
      </p>
      <Link to="/" className="btn-primary mt-8">Back to home</Link>
    </section>
  );
}
