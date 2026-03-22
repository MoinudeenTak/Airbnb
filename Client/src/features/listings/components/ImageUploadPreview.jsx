import { useEffect, useState } from "react";

export default function ImageUploadPreview({ files, onRemove }) {
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    if (!files || files.length === 0) {
      setPreviews([]);
      return;
    }

    const objectUrls = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setPreviews(objectUrls);

    return () => {
      objectUrls.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [files]);

  if (!previews.length) return null;

  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-gray-700">Image Preview</h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {previews.map((item, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-xl border border-gray-200"
          >
            <img
              src={item.url}
              alt={`Preview ${index + 1}`}
              className="h-32 w-full object-cover"
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}