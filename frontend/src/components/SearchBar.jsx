// Search box + area filter (+ specialization filter on the doctors page).
// This is requirement 6: search and filter.
export default function SearchBar({ query, onQuery, area, onArea, areas,
                                    specialization, onSpecialization, specializations }) {
  const select =
    'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500/40';

  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row">
      <input
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder="Search by name..."
        className={`${select} flex-1`}
        aria-label="Search by name"
      />

      <select value={area} onChange={(e) => onArea(e.target.value)} className={select} aria-label="Filter by area">
        <option value="">All areas</option>
        {areas.map((a) => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>

      {specializations && (
        <select
          value={specialization}
          onChange={(e) => onSpecialization(e.target.value)}
          className={select}
          aria-label="Filter by specialization"
        >
          <option value="">All specializations</option>
          {specializations.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      )}
    </div>
  );
}
