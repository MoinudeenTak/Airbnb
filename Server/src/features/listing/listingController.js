import {
  createListingService,
  getListingsService,
  getListingService,
  updateListingService,
  deleteListingService,
  deleteListingImageService,
} from "./listingService.js";

/*
|--------------------------------------------------------------------------
| POST /api/listings
|--------------------------------------------------------------------------
| Create a new listing
*/
export const createListing = async (req, res) => {
  try {
    const listing = await createListingService(req);

    return res.status(201).json({
      success: true,
      message: "Listing created successfully",
      listing,
    });
  } catch (err) {
    console.error("CREATE LISTING ERROR:", err);
    console.error("CREATE LISTING MESSAGE:", err.message);
    console.error("CREATE LISTING STACK:", err.stack);

    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to create listing",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/listings
|--------------------------------------------------------------------------
| Get all listings with filters, pagination, sorting
*/
export const getListings = async (req, res) => {
  try {
    const { listings, pagination } = await getListingsService(req.query);

    return res.status(200).json({
      success: true,
      listings,
      pagination,
    });
  } catch (err) {
    console.error("GET LISTINGS ERROR:", err);
    console.error("GET LISTINGS MESSAGE:", err.message);
    console.error("GET LISTINGS STACK:", err.stack);

    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to fetch listings",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/listings/:id
|--------------------------------------------------------------------------
| Get one listing by id
*/
export const getListing = async (req, res) => {
  try {
    const listing = await getListingService(req.params.id);

    return res.status(200).json({
      success: true,
      listing,
    });
  } catch (err) {
    console.error("GET LISTING ERROR:", err);
    console.error("GET LISTING MESSAGE:", err.message);
    console.error("GET LISTING STACK:", err.stack);

    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to fetch listing",
    });
  }
};

/*
|--------------------------------------------------------------------------
| PUT /api/listings/:id
|--------------------------------------------------------------------------
| Update a listing
*/
export const updateListing = async (req, res) => {
  try {
    const listing = await updateListingService(req);

    return res.status(200).json({
      success: true,
      message: "Listing updated successfully",
      listing,
    });
  } catch (err) {
    console.error("UPDATE LISTING ERROR:", err);
    console.error("UPDATE LISTING MESSAGE:", err.message);
    console.error("UPDATE LISTING STACK:", err.stack);

    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to update listing",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE /api/listings/:id
|--------------------------------------------------------------------------
| Delete a listing
*/
export const deleteListing = async (req, res) => {
  try {
    const result = await deleteListingService(req.params.id, req.user);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    console.error("DELETE LISTING ERROR:", err);
    console.error("DELETE LISTING MESSAGE:", err.message);
    console.error("DELETE LISTING STACK:", err.stack);

    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to delete listing",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE /api/listings/:id/images/:publicId
|--------------------------------------------------------------------------
| Delete one image from listing
*/
export const deleteListingImage = async (req, res) => {
  try {
    const publicId = decodeURIComponent(req.params.publicId);

    const images = await deleteListingImageService(
      req.params.id,
      publicId,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      images,
    });
  } catch (err) {
    console.error("DELETE LISTING IMAGE ERROR:", err);
    console.error("DELETE LISTING IMAGE MESSAGE:", err.message);
    console.error("DELETE LISTING IMAGE STACK:", err.stack);

    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to delete image",
    });
  }
};