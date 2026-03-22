import Listing from "../../models/Listing.js";
import { buildListingQuery } from "./listingQueryBuilder.js";
import {
  toNumber,
  toBoolean,
  parseIfJson,
  isOwner,
  buildImages,
  buildLocation,
  normalizeAmenities,
  normalizePropertyType,
  deleteCloudinaryImages,
} from "./listingHelpers.js";

/* -------------------------------------------------------------------------- */
/* Private Validators                                                         */
/* -------------------------------------------------------------------------- */
const validateNonNegativeNumber = (value, fieldName) => {
  if (value < 0) {
    const error = new Error(`${fieldName} cannot be negative`);
    error.statusCode = 400;
    throw error;
  }

  return value;
};

const validateMinimumValue = (value, minimum, fieldName) => {
  if (value < minimum) {
    const error = new Error(`${fieldName} must be at least ${minimum}`);
    error.statusCode = 400;
    throw error;
  }

  return value;
};

/*
|--------------------------------------------------------------------------|
| Create Listing Service
|--------------------------------------------------------------------------|
*/
export const createListingService = async (req) => {
  const {
    title,
    description,
    price,
    location,
    amenities,
    propertyType,
    maxGuests,
    bedrooms,
    bathrooms,
  } = req.body;

  if (!title?.trim()) {
    const error = new Error("Title is required");
    error.statusCode = 400;
    throw error;
  }

  if (!description?.trim()) {
    const error = new Error("Description is required");
    error.statusCode = 400;
    throw error;
  }

  const finalLocation = buildLocation(location);

  const parsedAmenities = parseIfJson(amenities, []);
  const normalizedAmenities = normalizeAmenities(parsedAmenities);

  const images = await buildImages(req.files || []);

  if (!images.length) {
    const error = new Error("At least one image is required");
    error.statusCode = 400;
    throw error;
  }

  const parsedPrice = validateNonNegativeNumber(
    toNumber(price, "Price"),
    "Price"
  );

  const parsedMaxGuests = validateMinimumValue(
    toNumber(maxGuests, "Max guests"),
    1,
    "Max guests"
  );

  const parsedBedrooms = validateNonNegativeNumber(
    toNumber(bedrooms, "Bedrooms"),
    "Bedrooms"
  );

  const parsedBathrooms = validateNonNegativeNumber(
    toNumber(bathrooms, "Bathrooms"),
    "Bathrooms"
  );

  const listing = await Listing.create({
    title: title.trim(),
    description: description.trim(),
    price: parsedPrice,
    location: finalLocation,
    amenities: normalizedAmenities,
    propertyType: normalizePropertyType(propertyType),
    maxGuests: parsedMaxGuests,
    bedrooms: parsedBedrooms,
    bathrooms: parsedBathrooms,
    images,
    host: req.user._id,
  });

  return await Listing.findById(listing._id).populate("host", "name avatar bio");
};

/*
|--------------------------------------------------------------------------|
| Get All Listings Service
|--------------------------------------------------------------------------|
*/
export const getListingsService = async (query) => {
  const {
    filter,
    pagination: { page, limit, skip, sort },
  } = buildListingQuery(query);

  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .populate("host", "name avatar")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Listing.countDocuments(filter),
  ]);

  return {
    listings,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/*
|--------------------------------------------------------------------------|
| Get Single Listing Service
|--------------------------------------------------------------------------|
*/
export const getListingService = async (listingId) => {
  const listing = await Listing.findById(listingId).populate(
    "host",
    "name avatar bio"
  );

  if (!listing || !listing.isActive) {
    const error = new Error("Listing not found");
    error.statusCode = 404;
    throw error;
  }

  return listing;
};

/*
|--------------------------------------------------------------------------|
| Update Listing Service
|--------------------------------------------------------------------------|
*/
export const updateListingService = async (req) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing || !listing.isActive) {
    const error = new Error("Listing not found");
    error.statusCode = 404;
    throw error;
  }

  if (!isOwner(listing.host, req.user._id)) {
    const error = new Error("Not authorized to update this listing");
    error.statusCode = 403;
    throw error;
  }

  const oldImages = listing.images || [];

  const allowedFields = [
    "title",
    "description",
    "price",
    "location",
    "amenities",
    "propertyType",
    "maxGuests",
    "bedrooms",
    "bathrooms",
    "isActive",
    "existingImages",
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (updates.title !== undefined) {
    updates.title = updates.title.trim();

    if (!updates.title) {
      const error = new Error("Title cannot be empty");
      error.statusCode = 400;
      throw error;
    }
  }

  if (updates.description !== undefined) {
    updates.description = updates.description.trim();

    if (!updates.description) {
      const error = new Error("Description cannot be empty");
      error.statusCode = 400;
      throw error;
    }
  }

  if (updates.location !== undefined) {
    updates.location = buildLocation(updates.location);
  }

  if (updates.amenities !== undefined) {
    const parsedAmenities = parseIfJson(updates.amenities, []);
    updates.amenities = normalizeAmenities(parsedAmenities);
  }

  if (updates.propertyType !== undefined) {
    updates.propertyType = normalizePropertyType(updates.propertyType);
  }

  if (updates.price !== undefined) {
    updates.price = validateNonNegativeNumber(
      toNumber(updates.price, "Price"),
      "Price"
    );
  }

  if (updates.maxGuests !== undefined) {
    updates.maxGuests = validateMinimumValue(
      toNumber(updates.maxGuests, "Max guests"),
      1,
      "Max guests"
    );
  }

  if (updates.bedrooms !== undefined) {
    updates.bedrooms = validateNonNegativeNumber(
      toNumber(updates.bedrooms, "Bedrooms"),
      "Bedrooms"
    );
  }

  if (updates.bathrooms !== undefined) {
    updates.bathrooms = validateNonNegativeNumber(
      toNumber(updates.bathrooms, "Bathrooms"),
      "Bathrooms"
    );
  }

  if (updates.isActive !== undefined) {
    updates.isActive = toBoolean(updates.isActive, "isActive");
  }

  let existingImages = oldImages;

  if (updates.existingImages !== undefined) {
    existingImages = parseIfJson(updates.existingImages, []);

    if (!Array.isArray(existingImages)) {
      const error = new Error("existingImages must be an array");
      error.statusCode = 400;
      throw error;
    }
  }

  delete updates.existingImages;

  let newImages = [];
  if (req.files?.length) {
    newImages = await buildImages(req.files);
  }

  const finalImages = [...existingImages, ...newImages].map((img, index) => ({
    ...img,
    isPrimary: index === 0,
  }));

  const removedImages = oldImages.filter(
    (oldImg) =>
      !finalImages.some((newImg) => newImg.publicId === oldImg.publicId)
  );

  if (removedImages.length > 0) {
    await deleteCloudinaryImages(removedImages);
  }

  updates.images = finalImages;

  const updatedListing = await Listing.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    {
      new: true,
      runValidators: true,
    }
  ).populate("host", "name avatar bio");

  return updatedListing;
};

/*
|--------------------------------------------------------------------------|
| Delete Listing Service
|--------------------------------------------------------------------------|
*/
export const deleteListingService = async (listingId, user) => {
  const listing = await Listing.findById(listingId);

  if (!listing || !listing.isActive) {
    const error = new Error("Listing not found");
    error.statusCode = 404;
    throw error;
  }

  if (!isOwner(listing.host, user._id)) {
    const error = new Error("Not authorized to delete this listing");
    error.statusCode = 403;
    throw error;
  }

  await deleteCloudinaryImages(listing.images || []);
  await listing.deleteOne();

  return {
    success: true,
    message: "Listing deleted successfully",
  };
};

/*
|--------------------------------------------------------------------------|
| Delete Listing Image Service
|--------------------------------------------------------------------------|
*/
export const deleteListingImageService = async (listingId, publicId, user) => {
  const listing = await Listing.findById(listingId);

  if (!listing || !listing.isActive) {
    const error = new Error("Listing not found");
    error.statusCode = 404;
    throw error;
  }

  if (!isOwner(listing.host, user._id)) {
    const error = new Error("Not authorized to delete this image");
    error.statusCode = 403;
    throw error;
  }

  const imageToDelete = listing.images.find((img) => img.publicId === publicId);

  if (!imageToDelete) {
    const error = new Error("Image not found");
    error.statusCode = 404;
    throw error;
  }

  await deleteCloudinaryImages([imageToDelete]);

  listing.images = listing.images.filter((img) => img.publicId !== publicId);

  listing.images = listing.images.map((img, index) => ({
    ...img.toObject(),
    isPrimary: index === 0,
  }));

  await listing.save();

  return listing.images;
};