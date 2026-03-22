import {
  normalizeAmenitiesInput,
  normalizePropertyType,
} from "./listingHelpers.js";
import { buildListingSort } from "./listingSortBuilder.js";
import { validateListingQuery } from "./listingValidateQuery.js";

/* -------------------------------------------------------------------------- */
/* Private Helpers                                                            */
/* -------------------------------------------------------------------------- */
const escapeRegex = (value = "") => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/* -------------------------------------------------------------------------- */
/* Build Listing Query                                                        */
/* -------------------------------------------------------------------------- */
export const buildListingQuery = (query = {}) => {
  const {
    city,
    country,
    propertyType,
    search,
    amenities,
    sort,
  } = query;

  const {
    parsedMinPrice,
    parsedMaxPrice,
    parsedGuests,
    parsedPage,
    parsedLimit,
    parsedCheckIn,
    parsedCheckOut,
  } = validateListingQuery(query);

  const currentPage = Math.max(parsedPage || 1, 1);
  const perPage = Math.max(parsedLimit || 12, 1);
  const skip = (currentPage - 1) * perPage;

  const normalizedPropertyType = normalizePropertyType(propertyType);
  const amenitiesArray = normalizeAmenitiesInput(amenities);
  const sortQuery = buildListingSort(sort);

  const filter = { isActive: true };

  if (city?.trim()) {
    filter["location.city"] = {
      $regex: escapeRegex(city.trim()),
      $options: "i",
    };
  }

  if (country?.trim()) {
    filter["location.country"] = {
      $regex: escapeRegex(country.trim()),
      $options: "i",
    };
  }

  if (normalizedPropertyType) {
    filter.propertyType = normalizedPropertyType;
  }

  if (parsedGuests !== undefined) {
    filter.maxGuests = { $gte: parsedGuests };
  }

  if (parsedMinPrice !== undefined || parsedMaxPrice !== undefined) {
    filter.price = {};

    if (parsedMinPrice !== undefined) {
      filter.price.$gte = parsedMinPrice;
    }

    if (parsedMaxPrice !== undefined) {
      filter.price.$lte = parsedMaxPrice;
    }
  }

  if (amenitiesArray.length > 0) {
    filter.amenities = { $all: amenitiesArray };
  }

  if (parsedCheckIn && parsedCheckOut) {
    filter.availability = {
      $elemMatch: {
        startDate: { $lte: parsedCheckIn },
        endDate: { $gte: parsedCheckOut },
      },
    };
  }

  if (search?.trim()) {
    filter.$text = { $search: search.trim() };
  }

  return {
    filter,
    pagination: {
      page: currentPage,
      limit: perPage,
      skip,
      sort: sortQuery,
    },
  };
};