import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

import LoginPage from "../features/auth/pages/Login.jsx";
import RegisterPage from "../features/auth/pages/Register.jsx";
// import DashboardPage from "../pages/Dashboard";
import HomePage from "../features/listings/pages/HomePage.jsx";
import ListingDetailsPage from "../features/listings/pages/ListingDetailsPage";
import HostDashboardPage from "../features/host/pages/HostDashboardPage.jsx";
import CreateListingPage from "../features/listings/pages/CreateListingPage";
import EditListingPage from "../features/listings/pages/EditListingPage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPassword.jsx";
import ResetPasswordPage from "../features/auth/pages/ResetPassword";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ------------------------------------------------------------------ */}
      {/* Public routes                                                      */}
      {/* ------------------------------------------------------------------ */}
      <Route path="/" element={<HomePage />} />
      <Route path="/listings/:id" element={<ListingDetailsPage />} />

      {/* ------------------------------------------------------------------ */}
      {/* Guest-only routes                                                  */}
      {/* ------------------------------------------------------------------ */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />

      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        }
      />

      {/* ------------------------------------------------------------------ */}
      {/* Logged-in user routes                                              */}
      {/* ------------------------------------------------------------------ */}
      {/* <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      /> */}

      {/* ------------------------------------------------------------------ */}
      {/* Host-only routes                                                   */}
      {/* ------------------------------------------------------------------ */}
      <Route
        path="/host/dashboard"
        element={
          <ProtectedRoute allowedRoles={["host"]}>
            <HostDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/host/listings/create"
        element={
          <ProtectedRoute allowedRoles={["host"]}>
            <CreateListingPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/host/listings/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["host"]}>
            <EditListingPage />
          </ProtectedRoute>
        }
      />

      {/* ------------------------------------------------------------------ */}
      {/* Fallback                                                           */}
      {/* ------------------------------------------------------------------ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}