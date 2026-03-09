import { Navigate } from "react-router-dom";
import { isLoggedIn, getCurrentUser } from "../api";

export function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

export function AdminRoute({ children }) {
  const user = getCurrentUser();
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}