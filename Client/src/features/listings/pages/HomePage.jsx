import { useCallback, useEffect, useMemo, useState } from "react";
import { getListings } from "../services/listingService";
import ListingGrid from "../components/ListingGrid";
import { useDebounce } from "../../../hooks/useDebounce";
import { useListingFilters } from "../hooks/useListingFilters";
import { useAuth } from "../../auth/hooks/useAuth";
import { getFlashMessage, clearFlashMessage } from "../../../utils/flashMessage";

const QUICK_FILTERS = ["Apartment", "House", "Villa", "Cabin", "Studio"];
const AMENITIES = ["wifi", "pool", "parking", "ac", "kitchen"];

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

const inputClass = (hasError = false) =>
  `w-full rounded-2xl border bg-white px-4 py-3 text-sm text-gray-700 outline-none transition ${
    hasError
      ? "border-red-400 focus:border-red-500"
      : "border-gray-300 focus:border-gray-900"
  }`;

const chipClass = (active) =>
  `rounded-full border px-4 py-2 text-sm font-medium capitalize transition ${
    active
      ? "border-gray-900 bg-gray-900 text-white shadow-sm"
      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
  }`;

export default function HomePage() {
  const { user } = useAuth();

  const {
    filters,
    errors,
    updateFilters,
    togglePropertyType,
    toggleAmenity,
    setPage,
    resetFilters,
    hasActiveFilters,
    validateFilters,
  } = useListingFilters();

  const [successMessage, setSuccessMessage] = useState("");
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const debouncedCity = useDebounce(filters.city, 500);

  useEffect(() => {
    const message = getFlashMessage();

    if (message) {
      setSuccessMessage(message);
      clearFlashMessage();
    }
  }, []);

  const apiParams = useMemo(() => {
    return {
      ...filters,
      city: debouncedCity,
    };
  }, [filters, debouncedCity]);

  const fetchListings = useCallback(async () => {
    const validation = validateFilters(apiParams);

    if (!validation.isValid) {
      setError("");
      setListings([]);
      setPagination(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getListings(apiParams);
      const payload = response?.data ?? response;

      setListings(Array.isArray(payload?.listings) ? payload.listings : []);
      setPagination(payload?.pagination || null);
    } catch (err) {
      console.error("FETCH LISTINGS ERROR:", err);
      setError(err?.response?.data?.message || "Failed to load listings");
      setListings([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [apiParams, validateFilters]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleSearchChange = (e) => {
    updateFilters({
      city: e.target.value,
      page: 1,
    });
  };

  const handleMinPriceChange = (e) => {
    updateFilters({
      minPrice: e.target.value,
      page: 1,
    });
  };

  const handleMaxPriceChange = (e) => {
    updateFilters({
      maxPrice: e.target.value,
      page: 1,
    });
  };

  const handleSortChange = (e) => {
    updateFilters({
      sort: e.target.value,
      page: 1,
    });
  };

  const handleLimitChange = (e) => {
    updateFilters({
      limit: Number(e.target.value),
      page: 1,
    });
  };

  const handleCheckInChange = (e) => {
    updateFilters({
      checkIn: e.target.value,
      page: 1,
    });
  };

  const handleCheckOutChange = (e) => {
    updateFilters({
      checkOut: e.target.value,
      page: 1,
    });
  };

  const handleQuickFilterClick = (propertyType) => {
    togglePropertyType(propertyType);
  };

  const handlePreviousPage = () => {
    if (filters.page > 1) {
      setPage(filters.page - 1);
    }
  };

  const handleNextPage = () => {
    const totalPages = pagination?.totalPages || 1;

    if (filters.page < totalPages) {
      setPage(filters.page + 1);
    }
  };

  const totalResults = pagination?.total || listings.length;
  const userName = user?.name?.trim() || "Guest";

  const banner = successMessage
    ? {
        text: successMessage,
        className:
          "mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 shadow-sm",
      }
    : user
    ? {
        text: `Welcome ${userName}! You are logged in as Guest.`,
        className:
          "mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 shadow-sm",
      }
    : null;

  const activeFilterChips = useMemo(() => {
    const chips = [];

    if (filters.city) {
      chips.push({ key: "city", label: `City: ${filters.city}` });
    }

    if (filters.propertyType) {
      chips.push({
        key: "propertyType",
        label: `Type: ${filters.propertyType}`,
      });
    }

    if (filters.minPrice) {
      chips.push({ key: "minPrice", label: `Min: ₹${filters.minPrice}` });
    }

    if (filters.maxPrice) {
      chips.push({ key: "maxPrice", label: `Max: ₹${filters.maxPrice}` });
    }

    if (filters.checkIn) {
      chips.push({ key: "checkIn", label: `Check-in: ${filters.checkIn}` });
    }

    if (filters.checkOut) {
      chips.push({ key: "checkOut", label: `Check-out: ${filters.checkOut}` });
    }

    if (filters.sort && filters.sort !== "newest") {
      const selectedSort = SORT_OPTIONS.find(
        (option) => option.value === filters.sort
      );

      if (selectedSort) {
        chips.push({ key: "sort", label: `Sort: ${selectedSort.label}` });
      }
    }

    filters.amenities.forEach((amenity) => {
      chips.push({
        key: `amenity-${amenity}`,
        label: amenity,
      });
    });

    return chips;
  }, [filters]);

  return (
    <section className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {banner && <div className={banner.className}>{banner.text}</div>}

        <div className="overflow-hidden rounded-4xl border border-gray-200 bg-white shadow-sm">
          <div className="grid items-center gap-8 px-6 py-10 md:px-10 lg:grid-cols-2 lg:px-12 lg:py-14">
            <div>
              <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600">
                Find your next stay
              </span>

              <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                Explore unique places to stay around you
              </h1>

              <p className="mt-4 max-w-lg text-sm leading-6 text-gray-600 sm:text-base">
                Discover hand-picked homes, apartments, villas, and cozy stays
                for your next trip. Book memorable places with comfort and style.
              </p>

              {user && (
                <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-xs text-gray-500">Signed in as</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {userName}
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-xs text-gray-500">Flexible stays</p>
                  <p className="text-sm font-medium text-gray-900">
                    Book with confidence
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-xs text-gray-500">Verified homes</p>
                  <p className="text-sm font-medium text-gray-900">
                    Curated for comfort
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="overflow-hidden rounded-3xl shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop"
                  alt="Beautiful stay"
                  className="h-64 w-full object-cover"
                />
              </div>

              <div className="mt-8 overflow-hidden rounded-3xl shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop"
                  alt="Modern home"
                  className="h-64 w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-4xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="flex-1">
                <input
                  type="text"
                  value={filters.city}
                  onChange={handleSearchChange}
                  placeholder="Search by city..."
                  className={inputClass(Boolean(errors?.city))}
                />
                {errors?.city && (
                  <p className="mt-1 text-xs text-red-600">{errors.city}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-105">
                <select
                  value={filters.sort}
                  onChange={handleSortChange}
                  className={inputClass(false)}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.limit}
                  onChange={handleLimitChange}
                  className={inputClass(Boolean(errors?.limit))}
                >
                  <option value={8}>8 / page</option>
                  <option value={12}>12 / page</option>
                  <option value={16}>16 / page</option>
                </select>

                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="rounded-2xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Reset Filters
                  </button>
                ) : (
                  <div className="hidden sm:block" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <input
                  type="number"
                  min="0"
                  value={filters.minPrice}
                  onChange={handleMinPriceChange}
                  placeholder="Min price"
                  className={inputClass(Boolean(errors?.minPrice))}
                />
                {errors?.minPrice && (
                  <p className="mt-1 text-xs text-red-600">{errors.minPrice}</p>
                )}
              </div>

              <div>
                <input
                  type="number"
                  min="0"
                  value={filters.maxPrice}
                  onChange={handleMaxPriceChange}
                  placeholder="Max price"
                  className={inputClass(Boolean(errors?.maxPrice))}
                />
                {errors?.maxPrice && (
                  <p className="mt-1 text-xs text-red-600">{errors.maxPrice}</p>
                )}
              </div>

              <div>
                <input
                  type="date"
                  value={filters.checkIn}
                  onChange={handleCheckInChange}
                  className={inputClass(Boolean(errors?.checkIn))}
                />
                {errors?.checkIn && (
                  <p className="mt-1 text-xs text-red-600">{errors.checkIn}</p>
                )}
              </div>

              <div>
                <input
                  type="date"
                  value={filters.checkOut}
                  onChange={handleCheckOutChange}
                  className={inputClass(Boolean(errors?.checkOut))}
                />
                {errors?.checkOut && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.checkOut}
                  </p>
                )}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-gray-700">
                Property type
              </p>

              <div className="flex flex-wrap gap-3">
                {QUICK_FILTERS.map((item) => {
                  const isActive = filters.propertyType === item;

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleQuickFilterClick(item)}
                      className={chipClass(isActive)}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-gray-700">
                Amenities
              </p>

              <div className="flex flex-wrap gap-3">
                {AMENITIES.map((amenity) => {
                  const isActive = filters.amenities.includes(amenity);

                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={chipClass(isActive)}
                    >
                      {amenity}
                    </button>
                  );
                })}
              </div>
            </div>

            {activeFilterChips.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Active filters:
                  </span>

                  {activeFilterChips.map((chip) => (
                    <span
                      key={chip.key}
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                    >
                      {chip.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6 mt-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
              Available stays
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Browse properties that match your travel style.
            </p>
          </div>

          {!loading && !error && Object.keys(errors || {}).length === 0 && (
            <p className="text-sm text-gray-500">
              {totalResults} place{totalResults > 1 ? "s" : ""} found
            </p>
          )}
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: Number(filters.limit) || 8 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="h-64 animate-pulse bg-gray-200" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-red-700">
              Unable to load listings
            </h3>
            <p className="mt-2 text-sm text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && Object.keys(errors || {}).length > 0 && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-amber-700">
              Please fix the filters
            </h3>
            <p className="mt-2 text-sm text-amber-600">
              Some filter values are invalid. Update them to see listing
              results.
            </p>
          </div>
        )}

        {!loading && !error && Object.keys(errors || {}).length === 0 && (
          <>
            {listings.length > 0 ? (
              <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                <ListingGrid listings={listings} />
              </div>
            ) : (
              <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto max-w-md">
                  <h3 className="text-xl font-semibold text-gray-900">
                    No stays found
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Try changing the city, price range, dates, or amenities to
                    explore more options.
                  </p>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-5 rounded-2xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>
            )}

            {pagination && pagination.totalPages > 1 && listings.length > 0 && (
              <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={handlePreviousPage}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <span className="text-center text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={handleNextPage}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}