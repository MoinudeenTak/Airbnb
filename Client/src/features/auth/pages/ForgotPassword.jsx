import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authServices";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await forgotPassword({
        email: email.trim().toLowerCase(),
      });

      const data = response?.data || response;
      setMessage(
        data?.message ||
          "If an account with that email exists, a reset link has been sent."
      );
      setEmail("");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to send reset password email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-gray-900">
          Forgot Password
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email and we will send you a reset link.
        </p>

        {message && (
          <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          <Link to="/login" className="font-semibold text-rose-500">
            Back to Login
          </Link>
        </p>
      </div>
    </section>
  );
}