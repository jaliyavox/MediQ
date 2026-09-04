import { Link } from 'react-router-dom';
import Stars from './Stars';

export default function ProviderCard({ provider }) {
  const isDoctor = provider.role === 'doctor';

  return (
    <Link
      to={`/provider/${provider._id}`}
      className="card group flex flex-col p-6 transition hover:border-ink/20 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="eyebrow">{isDoctor ? provider.specialization : 'Pharmacy'}</p>
        {isDoctor && provider.fee > 0 && (
          <span className="shrink-0 text-sm text-body">Rs. {provider.fee.toLocaleString()}</span>
        )}
      </div>

      <h3 className="mt-2 text-2xl leading-tight">{provider.name}</h3>

      <p className="mt-1 text-sm text-body">
        {provider.area}
        {provider.district && provider.district !== provider.area && `, ${provider.district}`}
        {!isDoctor && provider.openHours && ` · ${provider.openHours}`}
      </p>

      {provider.about && (
        <p className="mt-3 mb-5 line-clamp-2 text-sm leading-relaxed text-subtle">{provider.about}</p>
      )}

      {/* mt-auto keeps every card's footer on the same line, however many
          lines the description above it wraps to. */}
      <div className="mt-auto flex items-center justify-between border-t border-line pt-4">
        <Stars rating={provider.avgRating} count={provider.reviewCount} />
        <span className="text-sm text-body transition group-hover:text-ink">
          {isDoctor ? 'Request' : 'Ask'} &rarr;
        </span>
      </div>
    </Link>
  );
}
