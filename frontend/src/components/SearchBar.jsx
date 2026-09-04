// Search box + filters. This is requirement 6: search and filter.
export default function SearchBar({ query, onQuery, area, onArea, areas,
                                    specialization, onSpecialization, specializations }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle">
          ⌕
        </span>
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search by name"
          className="input !pl-9"
          aria-label="Search by name"
        />
      </div>

      <select value={area} onChange={(e) => onArea(e.target.value)}
              className="input sm:w-44" aria-label="Filter by area">
        <option value="">All areas</option>
        {areas.map((a) => <option key={a} value={a}>{a}</option>)}
      </select>

      {specializations && (
        <select value={specialization} onChange={(e) => onSpecialization(e.target.value)}
                className="input sm:w-52" aria-label="Filter by specialization">
          <option value="">All specializations</option>
          {specializations.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      )}
    </div>
  );
}
