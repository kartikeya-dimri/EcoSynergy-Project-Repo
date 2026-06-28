import { jwtDecode } from "jwt-decode";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function TokenExpirationWatcher() {
  const navigate = useNavigate();
  const refreshTimeoutRef = useRef(null);

  const refreshToken = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
        {
          method: "POST",
          credentials: "include", // Include cookies for refresh token
        }
      );

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        return data.token;
      } else {
        const errorData = await response.json();
        console.error("❌ Token refresh failed:", errorData.error);
        throw new Error(errorData.error);
      }
    } catch (error) {
      console.error("❌ Error refreshing token:", error);
      // Clear token and redirect to login
      localStorage.removeItem("token");
      navigate("/login");
      return null;
    }
  };

  const scheduleTokenRefresh = (token) => {
    try {
      const decoded = jwtDecode(token);
      const expiryTime = decoded.exp * 1000; // convert to ms
      const now = Date.now();
      const timeLeft = expiryTime - now;

      // Log time left in a human-readable format
      const timeLeftInMinutes = Math.floor(timeLeft / (1000 * 60));
      const timeLeftInSeconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      if (timeLeft <= 0) {
        // Token has already expired, try to refresh immediately
        refreshToken();
        return;
      }

      // Schedule refresh 5 minutes before expiry (or when 80% of token lifetime has passed)
      const refreshBuffer = Math.min(5 * 60 * 1000, timeLeft * 0.2); // 5 minutes or 20% of token lifetime
      const refreshTime = timeLeft - refreshBuffer;

      if (refreshTime > 0) {
        // Clear any existing timeout
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
        }

        refreshTimeoutRef.current = setTimeout(async () => {
          const newToken = await refreshToken();
          if (newToken) {
            // Schedule the next refresh
            scheduleTokenRefresh(newToken);
          }
        }, refreshTime);

      } else {
        // Refresh immediately if we're within the buffer time
        refreshToken();
      }
    } catch (err) {
      console.error("Invalid token:", err);
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Start the token refresh scheduling
    scheduleTokenRefresh(token);

    // Cleanup function
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [navigate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);
}
