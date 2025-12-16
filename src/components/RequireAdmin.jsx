import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function RequireAdmin() {
  const { user, loading } = useAuth();

  if (loading) return null; // or a spinner

  const isAdmin = user?.app_metadata?.role === "admin";

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
