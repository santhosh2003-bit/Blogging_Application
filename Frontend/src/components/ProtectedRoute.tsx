import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type Props = {
  children: React.ReactNode;
  requiredRole?: "admin" | "user";
};

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <Navigate to={user.role === "admin" ? "/admin" : "/blogs"} replace />
    );
  }

  return <>{children}</>;
}
