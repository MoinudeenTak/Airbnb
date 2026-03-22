import cloudinary from "../../config/cloudinary.js";

/* -------------------------------------------------------------------------- */
/* Numbers                                                                    */
/* -------------------------------------------------------------------------- */
export const toNumber = (value, fieldName) => {
  if (value === undefined || value === null || value === "") {
    const error = new Error(`${fieldName} is required`);
    error.statusCode = 400;
    throw error;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    const error = new Error(`${fieldName} must be a valid number`);
    error.statusCode = 400;
    throw error;
  }

  return parsed;
};

export const toOptionalNumber = (value, fieldName) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    const error = new Error(`${fieldName} must be a valid number`);
    error.statusCode = 400;
    throw error;
  }

  return parsed;
};

/* -------------------------------------------------------------------------- */
/* JSON Parser                                                                */
/* -------------------------------------------------------------------------- */
export const parseIfJson = (value, fallback = value) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    const error = new Error("Invalid JSON format in request");
    error.statusCode = 400;
    throw error;
  }
};

/* -------------------------------------------------------------------------- */
/* Ownership                                                                  */
/* -------------------------------------------------------------------------- */
export const isOwner = (hostId, userId) => {
  if (!hostId || !userId) return false;
  return hostId.toString() === userId.toString();
};

/* -------------------------------------------------------------------------- */
/* Normalize                                                                  */
/* -------------------------------------------------------------------------- */
export const normalizeAmenities = (amenities = []) => {
  if (!Array.isArray(amenities)) return [];

  return [
    ...new Set(
      amenities
        .map((item) => String(item).trim().toLowerCase())
        .filter(Boolean)
    ),
  ];
};

export const normalizeAmenitiesInput = (amenities) => {
  if (!amenities) return [];

  if (Array.isArray(amenities)) {
    return normalizeAmenities(amenities);
  }

  if (typeof amenities === "string") {
    return normalizeAmenities(amenities.split(","));
  }

  return [];
};

export const normalizePropertyType = (propertyType) => {
  if (
    propertyType === undefined ||
    propertyType === null ||
    propertyType === ""
  ) {
    return undefined;
  }

  return String(propertyType).trim().toLowerCase();
};

export const toBoolean = (value, fieldName = "Value") => {
  if (typeof value === "boolean") return value;

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }

  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }

  const error = new Error(`${fieldName} must be a valid boolean`);
  error.statusCode = 400;
  throw error;
};

/* -------------------------------------------------------------------------- */
/* Location                                                                   */
/* -------------------------------------------------------------------------- */
export const buildLocation = (location) => {
  const parsedLocation = parseIfJson(location, {});

  if (
    !parsedLocation ||
    typeof parsedLocation !== "object" ||
    Array.isArray(parsedLocation)
  ) {
    const error = new Error("Location is required");
    error.statusCode = 400;
    throw error;
  }

  const {
    address = "",
    city = "",
    state = "",
    country = "",
    zipCode = "",
    coordinates,
  } = parsedLocation;

  if (!String(city).trim()) {
    const error = new Error("City is required");
    error.statusCode = 400;
    throw error;
  }

  if (!String(country).trim()) {
    const error = new Error("Country is required");
    error.statusCode = 400;
    throw error;
  }

  let finalCoordinates = coordinates;

  if (typeof finalCoordinates === "string") {
    finalCoordinates = parseIfJson(finalCoordinates, []);
  }

  if (
    !Array.isArray(finalCoordinates) ||
    finalCoordinates.length !== 2 ||
    finalCoordinates.some((num) => Number.isNaN(Number(num)))
  ) {
    const error = new Error("Coordinates must be [longitude, latitude]");
    error.statusCode = 400;
    throw error;
  }

  return {
    address: String(address).trim(),
    city: String(city).trim(),
    state: String(state).trim(),
    country: String(country).trim(),
    zipCode: String(zipCode).trim(),
    coordinates: {
      type: "Point",
      coordinates: [Number(finalCoordinates[0]), Number(finalCoordinates[1])],
    },
  };
};

/* -------------------------------------------------------------------------- */
/* Cloudinary Upload Helper                                                   */
/* -------------------------------------------------------------------------- */
const uploadBufferToCloudinary = (fileBuffer, folder = "airbnb/listings") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
};

/* -------------------------------------------------------------------------- */
/* Images                                                                     */
/* -------------------------------------------------------------------------- */
export const buildImages = async (files = [], existingImages = []) => {
  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }

  const validFiles = files.filter(
    (file) => file?.buffer && file?.mimetype?.startsWith("image/")
  );

  if (!validFiles.length) {
    return [];
  }

  const uploadedImages = await Promise.all(
    validFiles.map(async (file, index) => {
      const result = await uploadBufferToCloudinary(file.buffer);

      return {
        url: result.secure_url,
        publicId: result.public_id,
        isPrimary: existingImages.length === 0 && index === 0,
      };
    })
  );

  return uploadedImages;
};

/* -------------------------------------------------------------------------- */
/* Cloudinary Cleanup                                                         */
/* -------------------------------------------------------------------------- */
export const deleteCloudinaryImages = async (images = []) => {
  if (!Array.isArray(images) || images.length === 0) return;

  const validImages = images.filter((img) => img?.publicId);

  if (!validImages.length) return;

  const results = await Promise.allSettled(
    validImages.map((img) => cloudinary.uploader.destroy(img.publicId))
  );

  const failedDeletes = results.filter(
    (result) => result.status === "rejected"
  );

  if (failedDeletes.length > 0) {
    console.error("Some Cloudinary images failed to delete:", failedDeletes);
  }

  return results;
};