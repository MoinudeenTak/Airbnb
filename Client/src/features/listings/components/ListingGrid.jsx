import ListingCard from "./ListingCard";

export default function ListingGrid({ listings = [] }) {
  if (!listings.length) {
    return (
      <div className="rounded-[2rem] border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-2xl">
          🏡
        </div>

        <h3 className="mt-4 text-2xl font-semibold text-gray-900">
          No listings found
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
          Try changing your filters or come back later to explore more stays.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard key={listing._id} listing={listing} />
      ))}
    </div>
  );
}