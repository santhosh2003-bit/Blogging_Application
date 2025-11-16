import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
export default function GoogleAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      axios
        .get("http://localhost:5000/api/auth/user", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          localStorage.setItem("user", JSON.stringify(res.data));
          navigate("/blogs"); // or /dashboard
        })
        .catch(() => {
          navigate("/login");
        });
      navigate("/blogs"); // redirect wherever you want
    } else {
      //   navigate("/login"); // if token missing
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen text-lg font-semibold">
      Signing you in with Google...
    </div>
  );
}
