import { toOptionalNumber } from "./listingHelpers.js";

/* -------------------------------------------------------------------------- */
/* Private Helpers                                                            */
/* -------------------------------------------------------------------------- */
const parseDate = (value, fieldName) => {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    const error = new Error(`${fieldName} is invalid`);
    error.statusCode = 400;
    throw error;
  }

  return parsedDate;
};

/* -------------------------------------------------------------------------- */
/* Validate Listing Query                                                     */
/* -------------------------------------------------------------------------- */
export const validateListingQuery = (query = {}) => {
  const {
    minPrice,
    maxPrice,
    guests,
    checkIn,
    checkOut,
    page,
    limit,
  } = query;

  const parsedMinPrice = toOptionalNumber(minPrice, "Minimum price");
  const parsedMaxPrice = toOptionalNumber(maxPrice, "Maximum price");
  const parsedGuests = toOptionalNumber(guests, "Guests");
  const parsedPage = toOptionalNumber(page, "Page");
  const parsedLimit = toOptionalNumber(limit, "Limit");

  if (parsedMinPrice !== undefined && parsedMinPrice < 0) {
    const error = new Error("Minimum price cannot be negative");
    error.statusCode = 400;
    throw error;
  }

  if (parsedMaxPrice !== undefined && parsedMaxPrice < 0) {
    const error = new Error("Maximum price cannot be negative");
    error.statusCode = 400;
    throw error;
  }

  if (
    parsedMinPrice !== undefined &&
    parsedMaxPrice !== undefined &&
    parsedMaxPrice < parsedMinPrice
  ) {
    const error = new Error("Maximum price cannot be less than minimum price");
    error.statusCode = 400;
    throw error;
  }

  if (parsedGuests !== undefined && parsedGuests < 1) {
    const error = new Error("Guests must be at least 1");
    error.statusCode = 400;
    throw error;
  }

  if (parsedPage !== undefined && parsedPage < 1) {
    const error = new Error("Page must be at least 1");
    error.statusCode = 400;
    throw error;
  }

  if (parsedLimit !== undefined && parsedLimit < 1) {
    const error = new Error("Limit must be at least 1");
    error.statusCode = 400;
    throw error;
  }

  let parsedCheckIn;
  let parsedCheckOut;

  if (checkIn || checkOut) {
    if (!checkIn || !checkOut) {
      const error = new Error("Both check-in and check-out dates are required");
      error.statusCode = 400;
      throw error;
    }

    parsedCheckIn = parseDate(checkIn, "Check-in date");
    parsedCheckOut = parseDate(checkOut, "Check-out date");

    if (parsedCheckOut <= parsedCheckIn) {
      const error = new Error("Check-out date must be after check-in date");
      error.statusCode = 400;
      throw error;
    }
  }

  return {
    parsedMinPrice,
    parsedMaxPrice,
    parsedGuests,
    parsedPage,
    parsedLimit,
    parsedCheckIn,
    parsedCheckOut,
  };
};