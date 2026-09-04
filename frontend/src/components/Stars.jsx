// Read-only rating display. rating === null means "no reviews yet".
export default function Stars({ rating, count, size = 'sm' }) {
  if (rating == null) {
    return <span className="text-xs text-subtle">No reviews yet</span>;
  }

  const full = Math.round(rating);
  const text = size === 'lg' ? 'text-base' : 'text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 ${text}`}>
      <span className="tracking-tight text-accent" aria-hidden="true">
        {'★'.repeat(full)}
        <span className="text-line">{'★'.repeat(5 - full)}</span>
      </span>
      <span className="font-medium text-ink">{rating.toFixed(1)}</span>
      {count != null && <span className="text-xs text-subtle">({count})</span>}
    </span>
  );
}
