import { DEFAULT_LISTING_FILTERS } from "./defaultListingFilters";

const parseArrayParam = (value) => {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const parsePositiveNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const parseListingSearchParams = (searchParams) => {
  return {
    ...DEFAULT_LISTING_FILTERS,
    city: searchParams.get("city")?.trim() || DEFAULT_LISTING_FILTERS.city,
    propertyType:
      searchParams.get("propertyType")?.trim() ||
      DEFAULT_LISTING_FILTERS.propertyType,
    minPrice:
      searchParams.get("minPrice")?.trim() || DEFAULT_LISTING_FILTERS.minPrice,
    maxPrice:
      searchParams.get("maxPrice")?.trim() || DEFAULT_LISTING_FILTERS.maxPrice,
    amenities: parseArrayParam(searchParams.get("amenities")),
    checkIn:
      searchParams.get("checkIn")?.trim() || DEFAULT_LISTING_FILTERS.checkIn,
    checkOut:
      searchParams.get("checkOut")?.trim() || DEFAULT_LISTING_FILTERS.checkOut,
    sort: searchParams.get("sort")?.trim() || DEFAULT_LISTING_FILTERS.sort,
    page: parsePositiveNumber(
      searchParams.get("page"),
      DEFAULT_LISTING_FILTERS.page
    ),
    limit: parsePositiveNumber(
      searchParams.get("limit"),
      DEFAULT_LISTING_FILTERS.limit
    ),
  };
};