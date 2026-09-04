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
    setQuery(''); setArea(''); setSpecialization('');
  }, [role]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    // Debounced so typing does not fire a request per keystroke.
    const t = setTimeout(() => {
      getProviders({ role, q: query || undefined, area: area || undefined,
                     specialization: specialization || undefined })
        .then((data) => !cancelled && setProviders(data))
        .catch((err) => !cancelled && setError(err.message))
        .finally(() => !cancelled && setLoading(false));
    }, 250);

    return () => { cancelled = true; clearTimeout(t); };
  }, [role, query, area, specialization]);

  const clear = () => { setQuery(''); setArea(''); setSpecialization(''); };
  const filtered = query || area || specialization;

  return (
    <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
      <h1 className="text-5xl sm:text-6xl">{title}</h1>
      <p className="mt-4 max-w-lg text-lg leading-relaxed text-body">{blurb}</p>

      <div className="mt-10">
        <SearchBar
          query={query} onQuery={setQuery}
          area={area} onArea={setArea} areas={options.areas}
          {...(role === 'doctor'
            ? { specialization, onSpecialization: setSpecialization,
                specializations: options.specializations }
            : {})}
        />
      </div>

      <div className="mt-6 flex h-6 items-center justify-between">
        <p className="text-sm text-subtle">
          {loading ? 'Searching…'
            : `${providers.length} ${providers.length === 1 ? 'result' : 'results'}`}
        </p>
        {filtered && !loading && (
          <button onClick={clear} className="text-sm text-body underline underline-offset-4 hover:text-ink">
            Clear filters
          </button>
        )}
      </div>

      {error && !loading && (
        <div className="mt-4 rounded-card border border-danger/25 bg-danger-soft p-6">
          <p className="font-medium text-danger">Could not load listings</p>
          <p className="mt-1 text-sm text-body">{error}</p>
        </div>
      )}

      {!loading && !error && providers.length === 0 && (
        <div className="mt-4 rounded-card border border-line bg-muted px-8 py-20 text-center">
          <p className="font-display text-3xl text-ink">Nothing matched</p>
          <p className="mx-auto mt-3 max-w-sm text-body">
            Try a different area, or clear the filters to see everyone listed.
          </p>
          {filtered && (
            <button onClick={clear} className="btn-quiet mt-6">Clear filters</button>
          )}
        </div>
      )}

      {!loading && !error && providers.length > 0 && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((p) => <ProviderCard key={p._id} provider={p} />)}
        </div>
      )}
    </section>
  );
}
