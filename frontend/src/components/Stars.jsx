// Read-only star display. Pass rating=null for "no reviews yet".
export default function Stars({ rating, count }) {
  if (rating == null) {
    return <span className="text-xs text-slate-400">No reviews yet</span>;
  }
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <span className="text-amber-500" aria-hidden="true">
        {'★'.repeat(full)}
        <span className="text-slate-300">{'★'.repeat(5 - full)}</span>
      </span>
      <span className="font-medium text-slate-700">{rating.toFixed(1)}</span>
      <span className="text-xs text-slate-500">({count})</span>
    </span>
  );
}
