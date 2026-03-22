const toTrimmedString = (value) => {
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

export const buildListingParams = (filters = {}) => {
  const params = {};

  const city = toTrimmedString(filters.city);
  const propertyType = toTrimmedString(filters.propertyType);
  const minPrice = toTrimmedString(filters.minPrice);
  const maxPrice = toTrimmedString(filters.maxPrice);
  const checkIn = toTrimmedString(filters.checkIn);
  const checkOut = toTrimmedString(filters.checkOut);
  const sort = toTrimmedString(filters.sort);

  if (city !== "") {
    params.city = city;
  }

  if (propertyType !== "") {
    params.propertyType = propertyType.toLowerCase();
  }

  if (minPrice !== "") {
    params.minPrice = minPrice;
  }

  if (maxPrice !== "") {
    params.maxPrice = maxPrice;
  }

  if (Array.isArray(filters.amenities) && filters.amenities.length > 0) {
    params.amenities = filters.amenities
      .map((item) => String(item).trim().toLowerCase())
      .filter(Boolean)
      .join(",");
  }

  if (checkIn !== "") {
    params.checkIn = checkIn;
  }

  if (checkOut !== "") {
    params.checkOut = checkOut;
  }

  if (sort !== "") {
    params.sort = sort;
  }

  const page = Number(filters.page);
  const limit = Number(filters.limit);

  if (Number.isFinite(page) && page > 0) {
    params.page = page;
  }

  if (Number.isFinite(limit) && limit > 0) {
    params.limit = limit;
  }

  return params;
};