import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getListingById, updateListing } from "../services/listingService";
import ListingForm from "../components/ListingForm";

export default function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const data = await getListingById(id);
        setListing(data?.listing || null);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to load listing");
      } finally {
        setPageLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      setLoading(true);
      await updateListing(id, formData);
      alert("Listing updated successfully");
      navigate("/host/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update listing");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <div className="p-6">Loading...</div>;
  if (!listing) return <div className="p-6">Listing not found</div>;

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Edit Listing</h1>
      <ListingForm
        initialValues={listing}
        onSubmit={handleUpdate}
        loading={loading}
        submitText="Update Listing"
      />
    </section>
  );
}