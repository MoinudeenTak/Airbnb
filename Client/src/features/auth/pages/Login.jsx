import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  login,
  loginWithGoogle,
  loginWithFacebook,
} from "../services/authServices";
import { useAuth } from "../hooks/useAuth";
import {
  setFlashMessage,
  getFlashMessage,
  clearFlashMessage,
} from "../../../utils/flashMessage";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);

  useEffect(() => {
    const message = getFlashMessage();

    if (message) {
      setSuccessMessage(message);
      clearFlashMessage();
    }
  }, []);

  const finishLogin = (data, rememberMeValue = formData.rememberMe) => {
    const loggedInUser = data?.user || null;
    const accessToken = data?.accessToken;
    const refreshToken = data?.refreshToken;

    if (!loggedInUser || !accessToken) {
      throw new Error("Invalid login response from server");
    }

    loginUser(accessToken, refreshToken, loggedInUser, rememberMeValue);

    const roles = Array.isArray(loggedInUser?.roles) ? loggedInUser.roles : [];
    const name = loggedInUser?.name?.trim() || "User";
    const isHost = roles.includes("host");

    if (isHost) {
      setFlashMessage(`Welcome ${name}! You are logged in as Host.`);
      navigate("/host/dashboard", { replace: true });
      return;
    }

    setFlashMessage(`Welcome ${name}! You are logged in as Guest.`);

    const redirectTo =
      location.state?.from?.pathname &&
      !location.state.from.pathname.startsWith("/host")
        ? location.state.from.pathname
        : "/";

    navigate(redirectTo, { replace: true });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.email.trim()) return "Email is required";
    if (!formData.password.trim()) return "Password is required";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const response = await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      const data = response?.data || response;
      finishLogin(data, formData.rememberMe);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError("");
      setSuccessMessage("");

      const response = await loginWithGoogle({
        credential: credentialResponse?.credential,
      });

      const data = response?.data || response;

      // social login usually keep user logged in
      finishLogin(data, true);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Google login failed. Please try again."
      );
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
  };

  const handleFacebookLogin = async () => {
    try {
      setError("");
      setSuccessMessage("");
      setFacebookLoading(true);

      if (!window.FB) {
        throw new Error("Facebook SDK is not loaded");
      }

      window.FB.login(
        async (fbResponse) => {
          try {
            if (!fbResponse?.authResponse?.accessToken) {
              setError("Facebook login was cancelled or failed.");
              setFacebookLoading(false);
              return;
            }

            const response = await loginWithFacebook({
              accessToken: fbResponse.authResponse.accessToken,
            });

            const data = response?.data || response;

            // social login usually keep user logged in
            finishLogin(data, true);
          } catch (err) {
            setError(
              err?.response?.data?.message ||
                "Facebook login failed. Please try again."
            );
          } finally {
            setFacebookLoading(false);
          }
        },
        { scope: "email,public_profile" }
      );
    } catch (err) {
      setError(err?.message || "Facebook login failed. Please try again.");
      setFacebookLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <div className="hidden w-1/2 lg:block">
          <img
            src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop"
            alt="Stay"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-semibold text-gray-900">Login</h1>
              <p className="mt-2 text-sm text-gray-600">
                Welcome back. Sign in to continue.
              </p>
            </div>

            {successMessage && (
              <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                  autoComplete="current-password"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  Remember me
                </label>

                <Link
                  to="/forgot-password"
                  className="font-medium text-rose-500 hover:text-rose-600"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                or
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                />
              </div>

              <button
                type="button"
                onClick={handleFacebookLogin}
                disabled={facebookLoading}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
              >
                {facebookLoading
                  ? "Connecting Facebook..."
                  : "Continue with Facebook"}
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-rose-500 hover:text-rose-600"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}