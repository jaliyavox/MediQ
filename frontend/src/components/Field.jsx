// One labelled input plus its validation message. Every form uses this, so a
// backend error like { errors: { email: '...' } } renders the same way everywhere.
export default function Field({ label, name, error, as = 'input', children, ...props }) {
  const Tag = as;
  const base =
    'w-full rounded-lg border px-3 py-2 text-sm outline-none transition ' +
    'focus:ring-2 focus:ring-teal-500/40 ' +
    (error ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white');

  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <Tag name={name} className={base} aria-invalid={!!error} {...props}>
        {children}
      </Tag>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
