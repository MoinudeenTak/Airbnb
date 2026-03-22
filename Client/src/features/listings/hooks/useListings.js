import { useCallback, useEffect, useState } from "react";
import { getListings } from "../services/listingService";

export default function useListings(queryParams = {}) {
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getListings(queryParams);

      setListings(data?.listings || []);
      setPagination(data?.pagination || null);
    } catch (err) {
      setListings([]);
      setPagination(null);
      setError(err?.response?.data?.message || "Failed to fetch listings");
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return {
    listings,
    pagination,
    loading,
    error,
    refetch: fetchListings,
  };
}