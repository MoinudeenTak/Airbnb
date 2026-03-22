export default function ListingGallery({ images = [] }) {
  if (!images.length) {
    return (
      <div className="rounded-2xl bg-gray-100 p-10 text-center text-gray-500">
        No images available
      </div>
    );
  }

  const primary = images.find((img) => img.isPrimary) || images[0];
  const secondary = images.filter((img) => img.url !== primary.url).slice(0, 4);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="overflow-hidden rounded-2xl">
        <img
          src={primary.url}
          alt="Primary listing"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {secondary.map((img, index) => (
          <div key={index} className="overflow-hidden rounded-2xl">
            <img
              src={img.url}
              alt={`Listing ${index + 2}`}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}