import { Link } from "react-router-dom";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop";

export default function ListingCard({ listing }) {
  const primaryImage =
    listing?.images?.find((img) => img.isPrimary)?.url ||
    listing?.images?.[0]?.url ||
    FALLBACK_IMAGE;

  const title = listing?.title || "Untitled stay";
  const city = listing?.location?.city || "Unknown city";
  const country = listing?.location?.country || "Unknown country";
  const price = Number(listing?.price) || 0;
  const amenities = listing?.amenities?.slice(0, 3) || [];
  const propertyType = listing?.propertyType || "Stay";
  const maxGuests = listing?.maxGuests || 1;
  const bedrooms = listing?.bedrooms || 1;
  const description = listing?.description || "No description available.";

  return (
    <Link to={`/listings/${listing?._id}`} className="group block">
      <article className="overflow-hidden rounded-[1.75rem] bg-white transition duration-300">
        <div className="relative overflow-hidden rounded-[1.5rem] bg-gray-100">
          <div className="aspect-[4/4] overflow-hidden">
            <img
              src={primaryImage}
              alt={title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm backdrop-blur">
              Guest favorite
            </span>

            <button
              type="button"
              className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg shadow-sm backdrop-blur transition hover:scale-105"
              onClick={(e) => e.preventDefault()}
            >
              ♡
            </button>
          </div>
        </div>

        <div className="px-1 pb-1 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-1 text-base font-semibold text-gray-900">
                {title}
              </h3>
              <p className="mt-1 line-clamp-1 text-sm text-gray-500">
                {city}, {country}
              </p>
            </div>

            <div className="shrink-0 text-sm font-medium text-gray-900">
              ★ 4.9
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
            <span className="capitalize">{propertyType}</span>
            <span>·</span>
            <span>{maxGuests} guests</span>
            <span>·</span>
            <span>{bedrooms} bedrooms</span>
          </div>

          <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">
            {description}
          </p>

          {amenities.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {amenities.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-700"
                >
                  {item}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-base font-semibold text-gray-900">
                ₹{price.toLocaleString("en-IN")}
                <span className="ml-1 text-sm font-normal text-gray-500">
                  / night
                </span>
              </p>
            </div>

            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
              Available
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}