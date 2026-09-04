import { Link } from 'react-router-dom';
import Stars from './Stars';

export default function ProviderCard({ provider }) {
  const isDoctor = provider.role === 'doctor';

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-900">{provider.name}</h3>
          <p className="text-sm text-teal-700">
            {isDoctor ? provider.specialization : provider.openHours || 'Pharmacy'}
          </p>
        </div>
        {isDoctor && provider.fee > 0 && (
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            Rs. {provider.fee.toLocaleString()}
          </span>
        )}
      </div>

      <p className="mt-2 text-sm text-slate-600">
        {provider.area}
        {provider.district && provider.district !== provider.area && `, ${provider.district}`}
      </p>

      {provider.about && (
        <p className="mt-2 line-clamp-2 text-sm text-slate-500">{provider.about}</p>
      )}

      <div className="mt-3 flex items-center justify-between">
        <Stars rating={provider.avgRating} count={provider.reviewCount} />
        <Link
          to={`/provider/${provider._id}`}
          className="rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-800"
        >
          {isDoctor ? 'Request consultation' : 'Ask for medicine'}
        </Link>
      </div>
    </article>
  );
}
