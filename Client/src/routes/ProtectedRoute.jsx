import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-6">
        <div className="text-sm font-medium text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRoles = Array.isArray(user?.roles) ? user.roles : [];

  const hasRequiredRole =
    allowedRoles.length === 0 ||
    allowedRoles.some((role) => userRoles.includes(role));

  if (!hasRequiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}