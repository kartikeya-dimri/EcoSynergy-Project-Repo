import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const UserType = {
  CITIZEN: "citizen",
  ADMIN: "admin",
  NGO: "ngo",
};

const ProtectedRoute = ({ citizenOnly = false, adminOnly = false, ngoOnly = false }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decodedToken = jwtDecode(token);

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedToken.exp < currentTime) {
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }

    // Role based redirection
    const currentRole = decodedToken.role;
    
    // Check role-based access
    if (citizenOnly && currentRole !== UserType.CITIZEN) {
      // If route is citizen-only and current user is not a citizen, redirect to their dashboard
      if (currentRole === UserType.ADMIN) {
        return <Navigate to="/admin" replace />;
      } else if (currentRole === UserType.NGO) {
        return <Navigate to="/ngo" replace />;
      }
    }
    
    if (adminOnly && currentRole !== UserType.ADMIN) {
      // If route is admin-only and current user is not an admin, redirect to their dashboard
      if (currentRole === UserType.CITIZEN) {
        return <Navigate to="/" replace />;
      } else if (currentRole === UserType.NGO) {
        return <Navigate to="/ngo" replace />;
      }
    }
    
    if (ngoOnly && currentRole !== UserType.NGO) {
      // If route is ngo-only and current user is not an ngo, redirect to their dashboard
      if (currentRole === UserType.CITIZEN) {
        return <Navigate to="/" replace />;
      } else if (currentRole === UserType.ADMIN) {
        return <Navigate to="/admin" replace />;
      }
    }

    return <Outlet />;
  } catch (error) {
    console.error("❌ Invalid token:", error);
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
