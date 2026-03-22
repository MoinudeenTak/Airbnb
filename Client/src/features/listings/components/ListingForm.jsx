import { useEffect, useState } from "react";
import ImageUploadPreview from "./ImageUploadPreview";

const AMENITIES = ["wifi", "pool", "parking", "ac", "kitchen", "tv"];

const PROPERTY_TYPES = [
  "apartment",
  "house",
  "villa",
  "studio",
  "cabin",
  "other",
];

const getInitialFormState = (initialValues = null) => ({
  title: initialValues?.title || "",
  description: initialValues?.description || "",
  price: initialValues?.price || "",
  city: initialValues?.location?.city || "",
  country: initialValues?.location?.country || "",
  address: initialValues?.location?.address || "",
  state: initialValues?.location?.state || "",
  zipCode: initialValues?.location?.zipCode || "",
  latitude: initialValues?.location?.coordinates?.coordinates?.[1] ?? "",
  longitude: initialValues?.location?.coordinates?.coordinates?.[0] ?? "",
  propertyType: initialValues?.propertyType || "apartment",
  maxGuests: initialValues?.maxGuests || 1,
  bedrooms: initialValues?.bedrooms || 1,
  bathrooms: initialValues?.bathrooms || 1,
  amenities: initialValues?.amenities || [],
});

export default function ListingForm({
  initialValues = null,
  onSubmit,
  loading = false,
  submitText = "Save Listing",
}) {
  const [form, setForm] = useState(getInitialFormState(initialValues));
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(getInitialFormState(initialValues));
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenityChange = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((item) => item !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
     console.log("SELECTED FILES:", selectedFiles);
    setImages((prev) => [...prev, ...selectedFiles]);
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const validateForm = () => {
    if (!form.title.trim()) return "Title is required";
    if (!form.description.trim()) return "Description is required";
    if (!form.price) return "Price is required";
    if (!form.address.trim()) return "Address is required";
    if (!form.city.trim()) return "City is required";
    if (!form.country.trim()) return "Country is required";
    if (form.latitude === "" || form.latitude === null)
      return "Latitude is required";
    if (form.longitude === "" || form.longitude === null)
      return "Longitude is required";

    const price = Number(form.price);
    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);
    const maxGuests = Number(form.maxGuests);
    const bedrooms = Number(form.bedrooms);
    const bathrooms = Number(form.bathrooms);

    if (Number.isNaN(price) || price < 1) {
      return "Price must be a valid number greater than 0";
    }

    if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
      return "Latitude must be a valid number between -90 and 90";
    }

    if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
      return "Longitude must be a valid number between -180 and 180";
    }

    if (Number.isNaN(maxGuests) || maxGuests < 1) {
      return "Max guests must be at least 1";
    }

    if (Number.isNaN(bedrooms) || bedrooms < 1) {
      return "Bedrooms must be at least 1";
    }

    if (Number.isNaN(bathrooms) || bathrooms < 1) {
      return "Bathrooms must be at least 1";
    }

    return "";
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  const validationError = validateForm();
  if (validationError) {
    setError(validationError);
    return;
  }

  const payload = new FormData();

  payload.append("title", form.title.trim());
  payload.append("description", form.description.trim());
  payload.append("price", String(form.price));
  payload.append(
    "location",
    JSON.stringify({
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      country: form.country.trim(),
      zipCode: form.zipCode.trim(),
      coordinates: [Number(form.longitude), Number(form.latitude)],
    })
  );
  payload.append("propertyType", form.propertyType);
  payload.append("maxGuests", String(form.maxGuests));
  payload.append("bedrooms", String(form.bedrooms));
  payload.append("bathrooms", String(form.bathrooms));
  payload.append("amenities", JSON.stringify(form.amenities));

  images.forEach((file) => {
    payload.append("images", file);
  });

  console.log("IMAGES STATE:", images);
  console.log("IMAGES COUNT:", images.length);

  for (const pair of payload.entries()) {
    console.log(pair[0], pair[1]);
  }

  await onSubmit(payload);
};
  const inputClass =
    "w-full rounded-2xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-100";

  const labelClass = "mb-2 block text-sm font-medium text-gray-800";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <div className="rounded-3xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-gray-900">Basic info</h3>
          <p className="mt-1 text-sm text-gray-600">
            Start with the name and short description of your property.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className={labelClass}>Listing title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className={inputClass}
              placeholder="Example: Modern apartment with city view"
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              name="description"
              rows="6"
              value={form.description}
              onChange={handleChange}
              className={`${inputClass} resize-none`}
              placeholder="Describe your place, nearby attractions, comfort, and what makes it special"
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Pricing & property type
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Define how your property should appear to guests.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>Price per night</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                ₹
              </span>
              <input
                name="price"
                type="number"
                min="1"
                value={form.price}
                onChange={handleChange}
                placeholder="2500"
                className="w-full rounded-2xl border border-gray-300 bg-white py-3.5 pl-8 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Property type</label>
            <select
              name="propertyType"
              value={form.propertyType}
              onChange={handleChange}
              className={inputClass}
            >
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-gray-900">Location</h3>
          <p className="mt-1 text-sm text-gray-600">
            Add address information and map coordinates for your property.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>Address</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Street address"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>City</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Jaipur"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>State</label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              placeholder="Rajasthan"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Country</label>
            <input
              name="country"
              value={form.country}
              onChange={handleChange}
              placeholder="India"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Zip code</label>
            <input
              name="zipCode"
              value={form.zipCode}
              onChange={handleChange}
              placeholder="302029"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Latitude</label>
            <input
              name="latitude"
              type="number"
              step="any"
              value={form.latitude}
              onChange={handleChange}
              placeholder="26.9124"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Longitude</label>
            <input
              name="longitude"
              type="number"
              step="any"
              value={form.longitude}
              onChange={handleChange}
              placeholder="75.7873"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-gray-900">Capacity</h3>
          <p className="mt-1 text-sm text-gray-600">
            Tell guests how many people your place can accommodate.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Max guests</label>
            <input
              name="maxGuests"
              type="number"
              min="1"
              value={form.maxGuests}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Bedrooms</label>
            <input
              name="bedrooms"
              type="number"
              min="1"
              value={form.bedrooms}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Bathrooms</label>
            <input
              name="bathrooms"
              type="number"
              min="1"
              value={form.bathrooms}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-gray-900">Amenities</h3>
          <p className="mt-1 text-sm text-gray-600">
            Highlight the features available in your place.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {AMENITIES.map((amenity) => {
            const checked = form.amenities.includes(amenity);

            return (
              <button
                key={amenity}
                type="button"
                onClick={() => handleAmenityChange(amenity)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium capitalize transition ${
                  checked
                    ? "border-rose-500 bg-rose-50 text-rose-600 ring-2 ring-rose-100"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  {amenity}
                  <span
                    className={`h-4 w-4 rounded-full border ${
                      checked
                        ? "border-rose-500 bg-rose-500"
                        : "border-gray-300 bg-white"
                    }`}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-gray-900">Photos</h3>
          <p className="mt-1 text-sm text-gray-600">
            Upload bright, high-quality images of your property.
          </p>
        </div>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center transition hover:border-rose-400 hover:bg-rose-50">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
            <span className="text-2xl">📷</span>
          </div>
          <h4 className="mt-4 text-base font-semibold text-gray-900">
            Upload listing images
          </h4>
          <p className="mt-1 text-sm text-gray-500">
            PNG, JPG, WEBP up to multiple files
          </p>
          <span className="mt-4 inline-flex rounded-full bg-rose-500 px-4 py-2 text-sm font-medium text-white">
            Choose files
          </span>

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>

        <div className="mt-5">
          <ImageUploadPreview files={images} onRemove={handleRemoveImage} />
        </div>
      </div>

      <div className="sticky bottom-4 z-10">
        <div className="rounded-3xl border border-gray-200 bg-white/90 p-4 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Ready to publish?
              </h4>
              <p className="text-sm text-gray-600">
                Review your information and save your listing.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-2xl bg-rose-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : submitText}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}