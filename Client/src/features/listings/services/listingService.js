import api from "../../../api/axios";
import { buildListingParams } from "../utils/filters/buildListingParams";

const LISTINGS_BASE_URL = "/listings";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const normalizeListingsResponse = (data) => {
  return {
    success: data?.success ?? true,
    listings: Array.isArray(data?.listings)
      ? data.listings
      : Array.isArray(data)
      ? data
      : [],
    pagination: data?.pagination || null,
    message: data?.message || "",
  };
};

const normalizeListingResponse = (data) => {
  return {
    success: data?.success ?? true,
    listing: data?.listing || data,
    message: data?.message || "",
  };
};

/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
*/

export const getListings = async (filters = {}) => {
  const params = buildListingParams(filters);

  const response = await api.get(LISTINGS_BASE_URL, {
    params,
  });

  return normalizeListingsResponse(response.data);
};

export const getListingById = async (id) => {
  if (!id) {
    throw new Error("Listing id is required");
  }

  const response = await api.get(`${LISTINGS_BASE_URL}/${id}`);

  return normalizeListingResponse(response.data);
};

export const createListing = async (formData) => {
  if (!formData) {
    throw new Error("Listing form data is required");
  }

  const response = await api.post(LISTINGS_BASE_URL, formData);

  return normalizeListingResponse(response.data);
};

export const updateListing = async (id, formData) => {
  if (!id) {
    throw new Error("Listing id is required");
  }

  if (!formData) {
    throw new Error("Listing form data is required");
  }

  const response = await api.put(`${LISTINGS_BASE_URL}/${id}`, formData);

  return normalizeListingResponse(response.data);
};

export const deleteListing = async (id) => {
  if (!id) {
    throw new Error("Listing id is required");
  }

  const response = await api.delete(`${LISTINGS_BASE_URL}/${id}`);

  return response.data;
};