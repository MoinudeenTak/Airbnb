import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getListingById } from "../services/listingService";
import ListingGallery from "../components/ListingGallery";

export default function ListingDetailsPage() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getListingById(id);
        setListing(data.listing || null);
      } catch (err) {
        console.error("FETCH LISTING ERROR:", err);
        setError(err.response?.data?.message || "Failed to load listing");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <section className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="space-y-3">
              <div className="h-10 w-2/3 rounded-xl bg-gray-200" />
              <div className="h-5 w-1/3 rounded-xl bg-gray-200" />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="h-80 rounded-3xl bg-gray-200 md:col-span-2" />
              <div className="h-80 rounded-3xl bg-gray-200" />
              <div className="h-80 rounded-3xl bg-gray-200" />
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <div className="h-8 w-1/3 rounded-xl bg-gray-200" />
                <div className="h-5 w-full rounded-xl bg-gray-200" />
                <div className="h-5 w-full rounded-xl bg-gray-200" />
                <div className="h-5 w-4/5 rounded-xl bg-gray-200" />
              </div>

              <div className="h-64 rounded-3xl bg-gray-200" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
              ⚠️
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-red-700">
              Unable to load listing
            </h2>
            <p className="mt-2 text-sm text-red-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!listing) {
    return (
      <section className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-2xl">
              🏠
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-gray-900">
              Listing not found
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              The listing you are looking for does not exist or may have been
              removed.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const fullLocation = [
    listing.location?.address,
    listing.location?.city,
    listing.location?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const amenities = listing.amenities || [];

  return (
    <section className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600">
                  {listing.propertyType || "Stay"}
                </span>
                <span className="text-sm font-medium text-gray-500">
                  ★ 4.9 · Guest favorite
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
                {listing.title}
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">
                {fullLocation || "Location details not available"}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                  {listing.maxGuests || 1} guests
                </span>
                <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                  {listing.bedrooms || 1} bedrooms
                </span>
                <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                  {listing.bathrooms || 1} bathrooms
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Share
              </button>
              <button
                type="button"
                className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[2rem] border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
          <ListingGallery images={listing.images} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-xl font-semibold text-rose-600">
                  {listing.host?.name?.charAt(0)?.toUpperCase() || "H"}
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Entire {listing.propertyType || "property"} hosted by{" "}
                    {listing.host?.name || "Host"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Spacious stay for {listing.maxGuests || 1} guest
                    {(listing.maxGuests || 1) > 1 ? "s" : ""} ·{" "}
                    {listing.bedrooms || 1} bedroom
                    {(listing.bedrooms || 1) > 1 ? "s" : ""} ·{" "}
                    {listing.bathrooms || 1} bathroom
                    {(listing.bathrooms || 1) > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-900">
                    Self check-in
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Smooth arrival experience
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-900">
                    Great location
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Convenient and guest-friendly area
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-900">
                    Clean & comfortable
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Designed for a relaxing stay
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900">
                About this place
              </h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-700 sm:text-base">
                {listing.description}
              </p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-2xl font-semibold text-gray-900">
                Property details
              </h3>

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Guests</p>
                  <p className="mt-2 text-lg font-semibold text-gray-900">
                    {listing.maxGuests || 1}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Bedrooms</p>
                  <p className="mt-2 text-lg font-semibold text-gray-900">
                    {listing.bedrooms || 1}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Bathrooms</p>
                  <p className="mt-2 text-lg font-semibold text-gray-900">
                    {listing.bathrooms || 1}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="mt-2 text-lg font-semibold capitalize text-gray-900">
                    {listing.propertyType || "Stay"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-2xl font-semibold text-gray-900">
                What this place offers
              </h3>

              {amenities.length > 0 ? (
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {amenities.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm font-medium capitalize text-gray-700"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-600">
                  No amenities listed for this property yet.
                </p>
              )}
            </div>
          </div>

          <aside className="lg:sticky lg:top-8 lg:h-fit">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-semibold text-gray-900">
                    ₹{Number(listing.price || 0).toLocaleString("en-IN")}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">per night</p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">★ 4.9</p>
                  <p className="text-xs text-gray-500">128 reviews</p>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-gray-300">
                <div className="grid grid-cols-2">
                  <div className="border-b border-r border-gray-300 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-900">
                      Check-in
                    </p>
                    <p className="mt-1 text-sm text-gray-500">Add date</p>
                  </div>

                  <div className="border-b border-gray-300 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-900">
                      Check-out
                    </p>
                    <p className="mt-1 text-sm text-gray-500">Add date</p>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-900">
                    Guests
                  </p>
                  <p className="mt-1 text-sm text-gray-500">1 guest</p>
                </div>
              </div>

              <button className="mt-6 w-full rounded-2xl bg-rose-500 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-600 active:scale-[0.99]">
                Reserve
              </button>

              <p className="mt-3 text-center text-sm text-gray-500">
                You won’t be charged yet
              </p>

              <div className="mt-6 space-y-4 border-t border-gray-200 pt-6 text-sm">
                <div className="flex items-center justify-between text-gray-700">
                  <span>
                    ₹{Number(listing.price || 0).toLocaleString("en-IN")} x 5 nights
                  </span>
                  <span>
                    ₹{Number((listing.price || 0) * 5).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center justify-between text-gray-700">
                  <span>Cleaning fee</span>
                  <span>₹1,200</span>
                </div>

                <div className="flex items-center justify-between text-gray-700">
                  <span>Service fee</span>
                  <span>₹850</span>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-base font-semibold text-gray-900">
                  <span>Total before taxes</span>
                  <span>
                    ₹
                    {Number((listing.price || 0) * 5 + 1200 + 850).toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}