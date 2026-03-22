import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../features/auth/hooks/useAuth";

export default function Navbar() {
  const { user, logout, upgradeToHost } = useAuth();
  const navigate = useNavigate();
  const [becomingHost, setBecomingHost] = useState(false);

  const isLoggedIn = Boolean(user);
  const isHost = user?.roles?.includes("host");

  const handleBecomeHost = async () => {
    try {
      setBecomingHost(true);
      await upgradeToHost();
      navigate("/host/listings/create");
    } catch (error) {
      console.error("Become host failed:", error);
      alert(
        error?.response?.data?.message || "Failed to upgrade user to host"
      );
    } finally {
      setBecomingHost(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🏠</span>
          <span className="text-xl font-bold text-rose-500">airbnb</span>
        </Link>

        <div className="flex items-center gap-3">

          {isLoggedIn ? (
            <>
              {/* ✅ USER NAME */}
              <span className="hidden sm:inline text-sm font-semibold text-gray-700">
                Hello, {user?.name}
              </span>

              {isHost ? (
                <>
                  <Link
                    to="/host/dashboard"
                    className="hidden rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:inline-flex"
                  >
                    Host Dashboard
                  </Link>

                  <Link
                    to="/host/listings/create"
                    className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
                  >
                    Add Listing
                  </Link>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleBecomeHost}
                  disabled={becomingHost}
                  className="hidden rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:inline-flex"
                >
                  {becomingHost ? "Please wait..." : "Become a Host"}
                </button>
              )}

              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
              >
                Sign up
              </Link>
            </>
          )}

        </div>
      </div>
    </header>
  );
}