/* -------------------------------------------------------------------------- */
/* Private Helpers                                                            */
/* -------------------------------------------------------------------------- */
const isEmpty = (value) => {
  return value === undefined || value === null || value === "";
};

const toOptionalNumber = (value, fieldName) => {
  if (isEmpty(value)) return undefined;

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return `${fieldName} must be a valid number`;
  }

  return parsed;
};

const parseDate = (value, fieldName) => {
  if (isEmpty(value)) return undefined;

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return `${fieldName} is invalid`;
  }

  return parsedDate;
};

/* -------------------------------------------------------------------------- */
/* Validate Listing Filters                                                   */
/* -------------------------------------------------------------------------- */
export const validateListingFilters = (filters = {}) => {
  const errors = {};

  const parsedMinPrice = toOptionalNumber(filters.minPrice, "Minimum price");
  const parsedMaxPrice = toOptionalNumber(filters.maxPrice, "Maximum price");
  const parsedPage = toOptionalNumber(filters.page, "Page");
  const parsedLimit = toOptionalNumber(filters.limit, "Limit");

  if (typeof parsedMinPrice === "string") {
    errors.minPrice = parsedMinPrice;
  }

  if (typeof parsedMaxPrice === "string") {
    errors.maxPrice = parsedMaxPrice;
  }

  if (typeof parsedPage === "string") {
    errors.page = parsedPage;
  }

  if (typeof parsedLimit === "string") {
    errors.limit = parsedLimit;
  }

  if (parsedMinPrice !== undefined && typeof parsedMinPrice !== "string") {
    if (parsedMinPrice < 0) {
      errors.minPrice = "Minimum price cannot be negative";
    }
  }

  if (parsedMaxPrice !== undefined && typeof parsedMaxPrice !== "string") {
    if (parsedMaxPrice < 0) {
      errors.maxPrice = "Maximum price cannot be negative";
    }
  }

  if (
    parsedMinPrice !== undefined &&
    parsedMaxPrice !== undefined &&
    typeof parsedMinPrice !== "string" &&
    typeof parsedMaxPrice !== "string" &&
    parsedMaxPrice < parsedMinPrice
  ) {
    errors.maxPrice = "Maximum price cannot be less than minimum price";
  }

  if (parsedPage !== undefined && typeof parsedPage !== "string") {
    if (parsedPage < 1) {
      errors.page = "Page must be at least 1";
    }
  }

  if (parsedLimit !== undefined && typeof parsedLimit !== "string") {
    if (parsedLimit < 1) {
      errors.limit = "Limit must be at least 1";
    }
  }

  const parsedCheckIn = parseDate(filters.checkIn, "Check-in date");
  const parsedCheckOut = parseDate(filters.checkOut, "Check-out date");

  if (typeof parsedCheckIn === "string") {
    errors.checkIn = parsedCheckIn;
  }

  if (typeof parsedCheckOut === "string") {
    errors.checkOut = parsedCheckOut;
  }

  if (filters.checkIn || filters.checkOut) {
    if (!filters.checkIn || !filters.checkOut) {
      if (!filters.checkIn) {
        errors.checkIn = "Check-in date is required";
      }

      if (!filters.checkOut) {
        errors.checkOut = "Check-out date is required";
      }
    }
  }

  if (
    parsedCheckIn instanceof Date &&
    parsedCheckOut instanceof Date &&
    parsedCheckOut <= parsedCheckIn
  ) {
    errors.checkOut = "Check-out date must be after check-in date";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};