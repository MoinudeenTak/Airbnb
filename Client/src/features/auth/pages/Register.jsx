import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/authServices";
import { setFlashMessage } from "../../../utils/flashMessage";

const initialFormData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "guest",
  acceptTerms: false,
};

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (error) {
      setError("");
    }
  };

  const validateForm = () => {
    const cleanedName = formData.name.trim();
    const cleanedEmail = formData.email.trim().toLowerCase();

    if (!cleanedName) {
      return "Full name is required";
    }

    if (cleanedName.length < 2) {
      return "Full name must be at least 2 characters";
    }

    if (!cleanedEmail) {
      return "Email is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanedEmail)) {
      return "Please enter a valid email address";
    }

    if (!formData.password) {
      return "Password is required";
    }

    if (formData.password.length < 6) {
      return "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      return "Please confirm your password";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }

    if (!["guest", "host"].includes(formData.role)) {
      return "Please select a valid account type";
    }

    if (!formData.acceptTerms) {
      return "You must agree to the Terms & Conditions";
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

    try {
      setLoading(true);

      const cleanedName = formData.name.trim();
      const cleanedEmail = formData.email.trim().toLowerCase();

      const payload = {
        name: cleanedName,
        email: cleanedEmail,
        password: formData.password,
        role: formData.role,
        acceptTerms: formData.acceptTerms,
      };

      await register(payload);

      const successMessage =
        formData.role === "host"
          ? `Host account created successfully for ${cleanedName}. Please log in.`
          : `Guest account created successfully for ${cleanedName}. Please log in.`;

      setFlashMessage(successMessage);

      setFormData(initialFormData);
      navigate("/login", { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <div className="hidden w-1/2 lg:block">
          <img
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop"
            alt="Stay"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-semibold text-gray-900">
                Create Account
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Join as a guest or host to continue.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  I want to join as:
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`cursor-pointer rounded-2xl border p-3 text-center text-sm font-medium transition ${
                      formData.role === "guest"
                        ? "border-rose-500 bg-rose-50 text-rose-600"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="guest"
                      checked={formData.role === "guest"}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <div>👤 Guest</div>
                    <div className="mt-1 text-xs font-normal">
                      Book and explore stays
                    </div>
                  </label>

                  <label
                    className={`cursor-pointer rounded-2xl border p-3 text-center text-sm font-medium transition ${
                      formData.role === "host"
                        ? "border-rose-500 bg-rose-50 text-rose-600"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="host"
                      checked={formData.role === "host"}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <div>🏠 Host</div>
                    <div className="mt-1 text-xs font-normal">
                      List and manage properties
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                />
              </div>

              <div className="relative">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 pr-16 text-sm outline-none transition focus:border-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-[44px] text-sm font-medium text-gray-500"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div className="relative">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 pr-16 text-sm outline-none transition focus:border-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-4 top-[44px] text-sm font-medium text-gray-500"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="mt-1"
                />
                <span>
                  I agree to the{" "}
                  <Link to="/terms" className="text-rose-500 hover:underline">
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-rose-500 hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-rose-500 hover:text-rose-600"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}