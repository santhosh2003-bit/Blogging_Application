import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "../pages/AdminDashboard";
import EditorPage from "../pages/EditorPage";
import BlogViewPage from "../pages/BlogViewPage";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="editor"
        element={
          <ProtectedRoute requiredRole="admin">
            <EditorPage />
          </ProtectedRoute>
        }
      />

      {/* Admin can also view blogs */}
      <Route
        path="view/:id"
        element={
          <ProtectedRoute requiredRole="admin">
            <BlogViewPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
