import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <Link to="/" className="mt-2 inline-block text-teal-700 underline">
        Back to home
      </Link>
    </section>
  );
}
