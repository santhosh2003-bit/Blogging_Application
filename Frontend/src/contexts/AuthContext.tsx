import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  loading: boolean; // 👈 add this
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // 👈 add this
  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false); // 👈 mark done once check completes
  }, []);
  console.log("AuthProvider render, loading:", BACKEND_URL);
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setToken(data.token);
      setUser(data.data.user);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      navigate(data.data.user.role === "admin" ? "/admin" : "/blogs");
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Failed to login");
    }
  };

  // const refreshToken = async () => {
  //   try {
  //     const storedToken = localStorage.getItem("token");
  //     if (!storedToken) return;

  //     const response = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${storedToken}`,
  //       },
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       setToken(data.token);
  //       setUser(data.data.user);
  //       localStorage.setItem("token", data.token);
  //       localStorage.setItem("user", JSON.stringify(data.data.user));
  //     } else {
  //       // Token is invalid, logout
  //       logout();
  //     }
  //   } catch (error) {
  //     console.error("Token refresh failed:", error);
  //     logout();
  //   }
  // };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setToken(data.token);
      setUser(data.data.user);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      navigate(data.data.user.role === "admin" ? "/admin" : "/blogs");
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Failed to register");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        login,
        register,
        logout,
        isAdmin: user?.role === "admin",
        loading, // 👈 add this
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // If the hook is used outside of a provider, warn and return a safe fallback
    // This prevents uncaught exceptions during early renders while the app mounts.
    // Prefer fixing provider wiring; this fallback keeps the app usable.
    // eslint-disable-next-line no-console
    console.warn(
      "useAuth used outside of AuthProvider - returning fallback object"
    );
    return {
      user: null,
      setUser: () => {},
      token: null,
      login: async () => {
        throw new Error("AuthProvider not found");
      },
      register: async () => {
        throw new Error("AuthProvider not found");
      },
      logout: () => {},
      isAdmin: false,
      loading: true,
    } as AuthContextType;
  }

  return context;
};
