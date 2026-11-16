import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../store";
import { Role } from "../types";

export default function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const user = useAppSelector((s) => s.auth.user);
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
