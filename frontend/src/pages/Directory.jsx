import { useEffect, useState } from 'react';
import { getProviders, getFilterOptions } from '../api';
import ProviderCard from '../components/ProviderCard';
import SearchBar from '../components/SearchBar';

// Shared by /doctors and /pharmacies - the only difference is the role filter.
export default function Directory({ role, title, blurb }) {
  const [providers, setProviders] = useState([]);
  const [options, setOptions] = useState({ areas: [], specializations: [] });
  const [query, setQuery] = useState('');
  const [area, setArea] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getFilterOptions().then(setOptions).catch(() => {});
  }, []);

  // Reset filters when switching between doctors and pharmacies.
  useEffect(() => {
    setQuery('');
    setArea('');
    setSpecialization('');
  }, [role]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    // Debounced so typing in the search box does not fire a request per keystroke.
    const t = setTimeout(() => {
      getProviders({ role, q: query || undefined, area: area || undefined,
                     specialization: specialization || undefined })
        .then((data) => !cancelled && setProviders(data))
        .catch((err) => !cancelled && setError(err.message))
        .finally(() => !cancelled && setLoading(false));
    }, 250);

    return () => { cancelled = true; clearTimeout(t); };
  }, [role, query, area, specialization]);

  return (
    <section>
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-1 mb-5 text-slate-600">{blurb}</p>

      <SearchBar
        query={query} onQuery={setQuery}
        area={area} onArea={setArea} areas={options.areas}
        {...(role === 'doctor'
          ? { specialization, onSpecialization: setSpecialization,
              specializations: options.specializations }
          : {})}
      />

      {loading && <p className="text-slate-500">Loading...</p>}

      {error && !loading && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="font-medium text-red-800">Could not load listings</p>
          <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
      )}

      {!loading && !error && providers.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="font-medium text-slate-800">Nothing matched your search</p>
          <p className="mt-1 text-sm text-slate-600">
            Try a different area, or clear the filters to see everyone.
          </p>
          <button
            onClick={() => { setQuery(''); setArea(''); setSpecialization(''); }}
            className="mt-3 text-sm text-teal-700 underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {!loading && !error && providers.length > 0 && (
        <>
          <p className="mb-3 text-sm text-slate-500">
            {providers.length} {providers.length === 1 ? 'result' : 'results'}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {providers.map((p) => (
              <ProviderCard key={p._id} provider={p} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
