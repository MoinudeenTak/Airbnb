import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-6">
        <div className="text-sm font-medium text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return children;
  }

  const userRoles = Array.isArray(user?.roles) ? user.roles : [];
  const isHost = userRoles.includes("host");

  if (isHost) {
    return <Navigate to="/host/dashboard" replace />;
  }

  return <Navigate to="/" replace />;
}