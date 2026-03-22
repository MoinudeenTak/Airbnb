import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { createListing } from "../services/listingService";
import ListingForm from "../components/ListingForm";

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCreate = async (formData) => {
    try {
      setLoading(true);
      await createListing(formData);
      navigate("/host/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1.9fr]">
          {/* Left Info Panel */}
          <div className="h-fit rounded-3xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-8">
            <Link
              to="/host/dashboard"
              className="inline-flex items-center text-sm font-medium text-gray-500 transition hover:text-gray-900"
            >
              ← Back to dashboard
            </Link>

            <div className="mt-6">
              <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600">
                Host Setup
              </span>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900">
                Create a new listing
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Add the most important details about your property so guests can
                discover, understand, and book it easily.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="rounded-2xl bg-gray-50 p-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  What to prepare
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  <li>• Clear listing title</li>
                  <li>• Detailed property description</li>
                  <li>• Price per night</li>
                  <li>• Exact location details</li>
                  <li>• High-quality images</li>
                  <li>• Guest-friendly amenities</li>
                </ul>
              </div>

              <div className="rounded-2xl bg-rose-50 p-4">
                <h3 className="text-sm font-semibold text-rose-700">
                  Pro tip
                </h3>
                <p className="mt-2 text-sm leading-6 text-rose-600">
                  Listings with strong titles, complete amenities, and good
                  images usually perform much better.
                </p>
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
            <div className="mb-6 border-b border-gray-200 pb-5">
              <h2 className="text-2xl font-semibold text-gray-900">
                Listing details
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Fill in your property information below.
              </p>
            </div>

            <ListingForm
              onSubmit={handleCreate}
              loading={loading}
              submitText="Create Listing"
            />
          </div>
        </div>
      </div>
    </section>
  );
}