// One labelled input plus its validation message. Every form uses this, so a
// backend error like { errors: { email: '...' } } renders identically everywhere.
export default function Field({ label, name, error, as = 'input', hint, children, ...props }) {
  const Tag = as;

  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-ink">{label}</span>
        {hint && <span className="text-xs text-subtle">{hint}</span>}
      </span>

      <Tag
        name={name}
        className={`input ${error ? 'input-error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        {...props}
      >
        {children}
      </Tag>

      {error && (
        <span id={`${name}-error`} className="mt-1.5 block text-xs text-danger">
          {error}
        </span>
      )}
    </label>
  );
}
