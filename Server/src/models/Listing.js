import mongoose from "mongoose";

/* -------------------------------------------------------------------------- */
/* Image Schema                                                               */
/* -------------------------------------------------------------------------- */
const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    publicId: {
      type: String,
      required: [true, "Image publicId is required"],
      trim: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

/* -------------------------------------------------------------------------- */
/* Availability Schema                                                        */
/* -------------------------------------------------------------------------- */
const availabilitySchema = new mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: [true, "Availability start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "Availability end date is required"],
    },
  },
  { _id: false }
);

/* -------------------------------------------------------------------------- */
/* GeoJSON Point Schema                                                       */
/* -------------------------------------------------------------------------- */
const pointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: function (value) {
          return (
            Array.isArray(value) &&
            value.length === 2 &&
            value.every((num) => typeof num === "number" && !Number.isNaN(num))
          );
        },
        message: "Coordinates must be an array of [longitude, latitude]",
      },
    },
  },
  { _id: false }
);

/* -------------------------------------------------------------------------- */
/* Listing Schema                                                             */
/* -------------------------------------------------------------------------- */
const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [1, "Price must be at least 1"],
    },

    location: {
      address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      state: {
        type: String,
        trim: true,
        default: "",
      },
      country: {
        type: String,
        required: [true, "Country is required"],
        trim: true,
      },
      zipCode: {
        type: String,
        trim: true,
        default: "",
      },
      coordinates: {
        type: pointSchema,
        required: [true, "Location coordinates are required"],
      },
    },

    images: {
      type: [imageSchema],
      required: true,
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "At least one image is required",
      },
    },

    amenities: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    propertyType: {
      type: String,
      enum: ["apartment", "house", "villa", "studio", "cabin", "other"],
      default: "apartment",
      lowercase: true,
      trim: true,
    },

    maxGuests: {
      type: Number,
      required: [true, "Max guests is required"],
      min: [1, "Max guests must be at least 1"],
    },

    bedrooms: {
      type: Number,
      default: 1,
      min: [0, "Bedrooms cannot be negative"],
    },

    bathrooms: {
      type: Number,
      default: 1,
      min: [0, "Bathrooms cannot be negative"],
    },

    availability: {
      type: [availabilitySchema],
      default: [],
    },

    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Host is required"],
    },

    ratingAverage: {
      type: Number,
      default: 0,
      min: [0, "Rating average cannot be below 0"],
      max: [5, "Rating average cannot exceed 5"],
    },

    ratingCount: {
      type: Number,
      default: 0,
      min: [0, "Rating count cannot be negative"],
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/* -------------------------------------------------------------------------- */
/* Indexes                                                                    */
/* -------------------------------------------------------------------------- */
listingSchema.index({ "location.coordinates": "2dsphere" });
listingSchema.index({ "location.city": 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ amenities: 1 });
listingSchema.index({ createdAt: -1 });

listingSchema.index({
  title: "text",
  description: "text",
  "location.city": "text",
  "location.country": "text",
});

/* -------------------------------------------------------------------------- */
/* Ensure only one primary image                                              */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* Ensure only one primary image                                              */
/* -------------------------------------------------------------------------- */
listingSchema.pre("validate", function () {
  if (!this.images || this.images.length === 0) {
    return;
  }

  const primaryImages = this.images.filter((img) => img.isPrimary);

  if (primaryImages.length === 0) {
    this.images[0].isPrimary = true;
    return;
  }

  if (primaryImages.length > 1) {
    throw new Error("Only one image can be marked as primary");
  }
});

export default mongoose.model("Listing", listingSchema);