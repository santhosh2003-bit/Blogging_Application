import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UserDashboard from "../pages/UserDashboard";
import BlogViewPage from "../pages/BlogViewPage";
import ProtectedRoute from "../components/ProtectedRoute";

export default function UserRoutes() {
  return (
    <Routes>
      <Route
        path="blogs"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="view/:id"
        element={
          <ProtectedRoute>
            <BlogViewPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/blogs" replace />} />
    </Routes>
  );
}
