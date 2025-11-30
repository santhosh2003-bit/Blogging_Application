import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import GoogleAuthSuccess from "./pages/GoogleAuthSuccess";
import HomePage from "./pages/HomePage";
import { useAuth } from "./contexts/AuthContext";
import Navigation from "./components/Navigation";

// Route groups
import AdminRoutes from "./routes/AdminRoutes";
import UserRoutes from "./routes/UserRoutes";

// Protected Route Component
const ProtectedRoute = ({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: "admin" | "user";
}) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  if (!user || !token) {
    console.log("No user/token found — redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/"} replace />;
  }

  return <>{children}</>;
};

function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation is handled inside HomePage for the landing page, or globally for logged-in users */}
      {user && <Navigation />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/google-auth-success" element={<GoogleAuthSuccess />} />

        {/* Admin routes grouped under /admin/* */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* User routes (blogs) grouped) */}
        <Route path="/*" element={<UserRoutes />} />
      </Routes>
    </div>
  );
}

export default App;
