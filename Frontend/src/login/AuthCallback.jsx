import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const UserType = {
  CITIZEN: "citizen",
  ADMIN: "admin",
  NGO: "ngo",
};

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (!code) {
      console.error("❌ No code found in URL query");
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/auth/exchange-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {

        if (data.token) {
          localStorage.setItem("token", data.token);
          const decodedToken = jwtDecode(data.token);
          if (decodedToken.role === UserType.ADMIN) {
            navigate("/admin");
          } else if (decodedToken.role === UserType.NGO) {
            navigate("/ngo");
          } else {
            navigate("/");
          }
        } else {
          console.error("❌ Token exchange failed:", data.error);
        }
      })
      .catch((err) => {
        console.error("❌ Network or server error during token exchange:", err);
      });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-6"></div>
      <div className="text-lg text-gray-700 dark:text-gray-200 font-bold">
        Loading...
      </div>
    </div>
  );
};

export default AuthCallback;
