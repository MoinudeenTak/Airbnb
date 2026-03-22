import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DEFAULT_LISTING_FILTERS } from "../utils/filters/defaultListingFilters";
import { parseListingSearchParams } from "../utils/filters/parseListingSearchParams";
import { buildListingSearchParams } from "../utils/filters/buildListingSearchParams";
import { validateListingFilters } from "../utils/filters/validateListingFilters";

const areArraysEqual = (a = [], b = []) => {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
};

const areFiltersEqual = (prev, next) => {
  return (
    prev.city === next.city &&
    prev.propertyType === next.propertyType &&
    prev.minPrice === next.minPrice &&
    prev.maxPrice === next.maxPrice &&
    areArraysEqual(prev.amenities, next.amenities) &&
    prev.checkIn === next.checkIn &&
    prev.checkOut === next.checkOut &&
    prev.sort === next.sort &&
    prev.page === next.page &&
    prev.limit === next.limit
  );
};

export const useListingFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilters = useMemo(() => {
    return parseListingSearchParams(searchParams);
  }, [searchParams]);

  const [filters, setFilters] = useState(initialFilters);
  const [errors, setErrors] = useState(() => {
    return validateListingFilters(initialFilters).errors || {};
  });

  const runValidation = useCallback((nextFilters) => {
    const result = validateListingFilters(nextFilters);
    setErrors(result.errors || {});
    return result;
  }, []);

  useEffect(() => {
    const nextFilters = parseListingSearchParams(searchParams);

    setFilters((prev) => {
      if (areFiltersEqual(prev, nextFilters)) return prev;
      return nextFilters;
    });

    runValidation(nextFilters);
  }, [searchParams, runValidation]);

  useEffect(() => {
    const nextParams = buildListingSearchParams(filters);
    const currentParams = Object.fromEntries(searchParams.entries());

    const isSame =
      JSON.stringify(nextParams) === JSON.stringify(currentParams);

    if (!isSame) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [filters, searchParams, setSearchParams]);

  const updateFilter = useCallback(
    (name, value) => {
      setFilters((prev) => {
        const nextFilters = {
          ...prev,
          [name]: value,
          page: 1,
        };

        runValidation(nextFilters);
        return nextFilters;
      });
    },
    [runValidation]
  );

  const updateFilters = useCallback(
    (nextValues = {}) => {
      setFilters((prev) => {
        const shouldResetPage =
          nextValues.page === undefined &&
          (nextValues.city !== undefined ||
            nextValues.propertyType !== undefined ||
            nextValues.minPrice !== undefined ||
            nextValues.maxPrice !== undefined ||
            nextValues.amenities !== undefined ||
            nextValues.checkIn !== undefined ||
            nextValues.checkOut !== undefined ||
            nextValues.sort !== undefined ||
            nextValues.limit !== undefined);

        const nextFilters = {
          ...prev,
          ...nextValues,
          page: shouldResetPage ? 1 : (nextValues.page ?? prev.page),
        };

        runValidation(nextFilters);
        return nextFilters;
      });
    },
    [runValidation]
  );

  const togglePropertyType = useCallback(
    (propertyType) => {
      setFilters((prev) => {
        const nextFilters = {
          ...prev,
          propertyType: prev.propertyType === propertyType ? "" : propertyType,
          page: 1,
        };

        runValidation(nextFilters);
        return nextFilters;
      });
    },
    [runValidation]
  );

  const toggleAmenity = useCallback(
    (amenity) => {
      setFilters((prev) => {
        const exists = prev.amenities.includes(amenity);

        const nextFilters = {
          ...prev,
          amenities: exists
            ? prev.amenities.filter((item) => item !== amenity)
            : [...prev.amenities, amenity],
          page: 1,
        };

        runValidation(nextFilters);
        return nextFilters;
      });
    },
    [runValidation]
  );

  const setPage = useCallback(
    (page) => {
      setFilters((prev) => {
        const nextFilters = {
          ...prev,
          page: Math.max(Number(page) || 1, 1),
        };

        runValidation(nextFilters);
        return nextFilters;
      });
    },
    [runValidation]
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_LISTING_FILTERS);
    setErrors({});
  }, []);

  const validateFilters = useCallback(
    (nextFilters = filters) => {
      return runValidation(nextFilters);
    },
    [filters, runValidation]
  );

  const hasActiveFilters = useMemo(() => {
    return (
      filters.city !== DEFAULT_LISTING_FILTERS.city ||
      filters.propertyType !== DEFAULT_LISTING_FILTERS.propertyType ||
      filters.minPrice !== DEFAULT_LISTING_FILTERS.minPrice ||
      filters.maxPrice !== DEFAULT_LISTING_FILTERS.maxPrice ||
      !areArraysEqual(filters.amenities, DEFAULT_LISTING_FILTERS.amenities) ||
      filters.checkIn !== DEFAULT_LISTING_FILTERS.checkIn ||
      filters.checkOut !== DEFAULT_LISTING_FILTERS.checkOut ||
      filters.sort !== DEFAULT_LISTING_FILTERS.sort ||
      filters.page !== DEFAULT_LISTING_FILTERS.page ||
      filters.limit !== DEFAULT_LISTING_FILTERS.limit
    );
  }, [filters]);

  return {
    filters,
    errors,
    setFilters,
    updateFilter,
    updateFilters,
    togglePropertyType,
    toggleAmenity,
    setPage,
    resetFilters,
    hasActiveFilters,
    validateFilters,
  };
};