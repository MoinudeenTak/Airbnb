import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteListing, getListings } from "../../listings/services/listingService";
import { useAuth } from "../../auth/hooks/useAuth";
import { getFlashMessage, clearFlashMessage } from "../../../utils/flashMessage";

export default function HostDashboardPage() {
  const { user } = useAuth();

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const hostName = user?.name?.trim() || "Host";

  useEffect(() => {
    const message = getFlashMessage();
    if (message) {
      setSuccessMessage(message);
      clearFlashMessage();
    }
  }, []);

  const fetchListings = useCallback(async () => {
    if (!user?._id) {
      setListings([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getListings();
      const payload = response?.data ?? response;
      const allListings = Array.isArray(payload?.listings) ? payload.listings : [];

      const myListings = allListings.filter(
        (listing) => listing?.host?._id === user._id
      );

      setListings(myListings);
    } catch (err) {
      console.error("Failed to fetch host listings:", err);
      setErrorMessage(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch host listings"
      );
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this listing?"
    );
    if (!confirmed) return;

    try {
      setDeletingId(id);
      setErrorMessage("");

      await deleteListing(id);
      setListings((prev) => prev.filter((item) => item._id !== id));
      setSuccessMessage("Listing deleted successfully.");
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message || "Failed to delete listing"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getPrimaryImage = (listing) => {
    if (!listing?.images?.length) {
      return "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop";
    }

    const primary = listing.images.find((img) => img.isPrimary);
    return primary?.url || listing.images[0]?.url;
  };

  const stats = useMemo(() => {
    return {
      total: listings.length,
      active: listings.length,
      status: listings.length > 0 ? "Live" : "Getting started",
    };
  }, [listings]);

  const banner = successMessage
    ? {
        text: successMessage,
        className:
          "mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 shadow-sm",
      }
    : user
    ? {
        text: `Welcome ${hostName}! You are logged in as Host.`,
        className:
          "mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 shadow-sm",
      }
    : null;

  return (
    <section className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {banner && <div className={banner.className}>{banner.text}</div>}

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm">
            {errorMessage}
          </div>
        )}

        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-rose-500">Host space</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              Welcome, {hostName}
            </h1>
            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              Manage your listings, update details, and keep your hosting space
              ready for guests.
            </p>
          </div>
        </div>

        {!loading && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Total listings</p>
              <h3 className="mt-2 text-2xl font-semibold text-gray-900">
                {stats.total}
              </h3>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Active properties</p>
              <h3 className="mt-2 text-2xl font-semibold text-gray-900">
                {stats.active}
              </h3>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Hosting status</p>
              <h3 className="mt-2 text-2xl font-semibold text-gray-900">
                {stats.status}
              </h3>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="h-52 animate-pulse bg-gray-200" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
                  <div className="flex gap-3 pt-2">
                    <div className="h-10 w-24 animate-pulse rounded-xl bg-gray-200" />
                    <div className="h-10 w-24 animate-pulse rounded-xl bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-2xl">
              🏡
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-gray-900">
              No listings yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
              Start hosting by creating your first property listing. Add photos,
              pricing, amenities, and location details to attract guests.
            </p>
            <Link
              to="/host/listings/create"
              className="mt-6 inline-flex items-center rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
            >
              Create your first listing
            </Link>
          </div>
        ) : (
          <>
            <div className="hidden gap-6 md:grid lg:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing) => (
                <div
                  key={listing._id}
                  className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative">
                    <img
                      src={getPrimaryImage(listing)}
                      alt={listing.title}
                      className="h-56 w-full object-cover"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm backdrop-blur">
                      Active
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="line-clamp-1 text-lg font-semibold text-gray-900">
                          {listing.title}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          {listing.location?.city || "Unknown city"}
                          {listing.location?.country
                            ? `, ${listing.location.country}`
                            : ""}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ₹{listing.price}
                        </p>
                        <p className="text-xs text-gray-500">/ night</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {listing.propertyType && (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                          {listing.propertyType}
                        </span>
                      )}
                      {listing.maxGuests && (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                          {listing.maxGuests} guests
                        </span>
                      )}
                      {listing.bedrooms && (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                          {listing.bedrooms} bedrooms
                        </span>
                      )}
                    </div>

                    <div className="mt-5 flex items-center gap-3">
                      <Link
                        to={`/listings/${listing._id}`}
                        className="inline-flex flex-1 items-center justify-center rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        Preview
                      </Link>

                      <Link
                        to={`/host/listings/${listing._id}/edit`}
                        className="inline-flex flex-1 items-center justify-center rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(listing._id)}
                        disabled={deletingId === listing._id}
                        className="inline-flex flex-1 items-center justify-center rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === listing._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 md:hidden">
              {listings.map((listing) => (
                <div
                  key={listing._id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="flex gap-4 p-4">
                    <img
                      src={getPrimaryImage(listing)}
                      alt={listing.title}
                      className="h-24 w-24 rounded-2xl object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="line-clamp-1 text-base font-semibold text-gray-900">
                            {listing.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {listing.location?.city || "Unknown city"}
                          </p>
                        </div>
                        <p className="whitespace-nowrap text-sm font-semibold text-gray-900">
                          ₹{listing.price}
                        </p>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <Link
                          to={`/host/listings/${listing._id}/edit`}
                          className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDelete(listing._id)}
                          disabled={deletingId === listing._id}
                          className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600 disabled:opacity-60"
                        >
                          {deletingId === listing._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 hidden overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm xl:block">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Listings overview
                </h2>
              </div>

              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr className="text-left text-sm font-medium text-gray-600">
                    <th className="px-6 py-4">Listing</th>
                    <th className="px-6 py-4">City</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {listings.map((listing) => (
                    <tr
                      key={listing._id}
                      className="border-t border-gray-200 transition hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={getPrimaryImage(listing)}
                            alt={listing.title}
                            className="h-14 w-14 rounded-xl object-cover"
                          />
                          <div>
                            <p className="font-semibold text-gray-900">
                              {listing.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {listing.propertyType || "Property"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {listing.location?.city || "—"}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ₹{listing.price} / night
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Active
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/host/listings/${listing._id}/edit`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(listing._id)}
                            disabled={deletingId === listing._id}
                            className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-60"
                          >
                            {deletingId === listing._id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}