export const handleLogout = async () => {
  try {
    // Call the backend logout endpoint to invalidate refresh token
    await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include", // Include cookies for refresh token
    });
  } catch (error) {
    console.error("Error during logout API call:", error);
    // Continue with cleanup even if API call fails
  }

  // Remove the access token from localStorage
  localStorage.removeItem("token");

  // Redirect to login page
  window.location.href = "/login";
};

export default handleLogout;
