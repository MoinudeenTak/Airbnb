const AMENITIES = ["wifi", "pool", "parking", "ac", "kitchen"];
const PROPERTY_TYPES = ["Apartment", "House", "Villa", "Cabin", "Studio"];

const getInputClass = (hasError) =>
  `w-full rounded-lg border px-3 py-2 outline-none transition focus:ring-2 ${
    hasError
      ? "border-red-500 focus:ring-red-200"
      : "border-gray-300 focus:ring-gray-200"
  }`;

const LABEL_CLASS = "mb-1 block text-sm font-medium text-gray-700";
const ERROR_CLASS = "mt-1 text-xs text-red-600";

export default function ListingFilters({
  filters = {},
  errors = {},
  onChange,
  onPropertyTypeChange,
  onAmenityChange,
  onReset,
}) {
  const {
    city = "",
    propertyType = "",
    minPrice = "",
    maxPrice = "",
    checkIn = "",
    checkOut = "",
    sort = "newest",
    amenities = [],
  } = filters;

  return (
    <section className="space-y-5 rounded-xl border bg-white p-4 shadow-sm">
      <div>
        <label htmlFor="city" className={LABEL_CLASS}>
          City
        </label>
        <input
          id="city"
          type="text"
          name="city"
          value={city}
          onChange={onChange}
          placeholder="Search by city"
          className={getInputClass(Boolean(errors.city))}
        />
        {errors.city && <p className={ERROR_CLASS}>{errors.city}</p>}
      </div>

      <div>
        <label htmlFor="propertyType" className={LABEL_CLASS}>
          Property Type
        </label>
        <select
          id="propertyType"
          name="propertyType"
          value={propertyType}
          onChange={(event) => onPropertyTypeChange(event.target.value)}
          className={getInputClass(Boolean(errors.propertyType))}
        >
          <option value="">All Property Types</option>
          {PROPERTY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.propertyType && (
          <p className={ERROR_CLASS}>{errors.propertyType}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="minPrice" className={LABEL_CLASS}>
            Min Price
          </label>
          <input
            id="minPrice"
            type="number"
            name="minPrice"
            value={minPrice}
            onChange={onChange}
            placeholder="1000"
            min="0"
            className={getInputClass(Boolean(errors.minPrice))}
          />
          {errors.minPrice && <p className={ERROR_CLASS}>{errors.minPrice}</p>}
        </div>

        <div>
          <label htmlFor="maxPrice" className={LABEL_CLASS}>
            Max Price
          </label>
          <input
            id="maxPrice"
            type="number"
            name="maxPrice"
            value={maxPrice}
            onChange={onChange}
            placeholder="5000"
            min="0"
            className={getInputClass(Boolean(errors.maxPrice))}
          />
          {errors.maxPrice && <p className={ERROR_CLASS}>{errors.maxPrice}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="checkIn" className={LABEL_CLASS}>
            Check In
          </label>
          <input
            id="checkIn"
            type="date"
            name="checkIn"
            value={checkIn}
            onChange={onChange}
            className={getInputClass(Boolean(errors.checkIn))}
          />
          {errors.checkIn && <p className={ERROR_CLASS}>{errors.checkIn}</p>}
        </div>

        <div>
          <label htmlFor="checkOut" className={LABEL_CLASS}>
            Check Out
          </label>
          <input
            id="checkOut"
            type="date"
            name="checkOut"
            value={checkOut}
            onChange={onChange}
            className={getInputClass(Boolean(errors.checkOut))}
          />
          {errors.checkOut && <p className={ERROR_CLASS}>{errors.checkOut}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="sort" className={LABEL_CLASS}>
          Sort By
        </label>
        <select
          id="sort"
          name="sort"
          value={sort}
          onChange={onChange}
          className={getInputClass(false)}
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">Amenities</p>

        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((amenity) => {
            const inputId = `amenity-${amenity}`;
            const isChecked = amenities.includes(amenity);

            return (
              <label
                key={amenity}
                htmlFor={inputId}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm capitalize transition ${
                  isChecked
                    ? "border-gray-900 bg-gray-100"
                    : "border-gray-300 bg-white"
                }`}
              >
                <input
                  id={inputId}
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onAmenityChange(amenity)}
                />
                <span>{amenity}</span>
              </label>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
      >
        Reset Filters
      </button>
    </section>
  );
}