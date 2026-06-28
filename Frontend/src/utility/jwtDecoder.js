import { jwtDecode } from 'jwt-decode';

/**
 * Get decoded JWT token from localStorage
 * @returns {Object|null} Decoded token object or null if token doesn't exist or is invalid
 */
export const getDecodedToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }
    return jwtDecode(token);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Get a specific attribute from the JWT token
 * @param {string} attribute - The attribute name to retrieve (e.g., 'email', 'role', 'name', 'id')
 * @returns {any|null} The attribute value or null if not found
 */
export const getTokenAttribute = (attribute) => {
  try {
    const decodedToken = getDecodedToken();
    if (!decodedToken) {
      return null;
    }
    return decodedToken[attribute] || null;
  } catch (error) {
    console.error(`Error getting token attribute '${attribute}':`, error);
    return null;
  }
};

/**
 * Get user email from JWT token
 * @returns {string|null} User email or null
 */
export const getUserEmail = () => getTokenAttribute('email');

/**
 * Get user role from JWT token
 * @returns {string|null} User role (citizen, admin, ngo) or null
 */
export const getUserRole = () => getTokenAttribute('role');

/**
 * Get user name from JWT token
 * @returns {string|null} User name or null
 */
export const getUserName = () => getTokenAttribute('name');

/**
 * Get user ID from JWT token
 * @returns {string|null} User ID or null
 */
export const getUserId = () => getTokenAttribute('id');

/**
 * Get user profile picture URL from JWT token
 * @returns {string|null} Profile picture URL or null
 */
export const getUserProfilePicture = () => getTokenAttribute('profilePictureURL');

/**
 * Check if token is expired
 * @returns {boolean} True if token is expired or doesn't exist
 */
export const isTokenExpired = () => {
  try {
    const decodedToken = getDecodedToken();
    if (!decodedToken || !decodedToken.exp) {
      return true;
    }
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Get all user information from JWT token
 * @returns {Object|null} Object containing user info or null
 */
export const getUserInfo = () => {
  const decodedToken = getDecodedToken();
  if (!decodedToken) {
    return null;
  }
  return {
    id: decodedToken.id,
    email: decodedToken.email,
    name: decodedToken.name,
    role: decodedToken.role,
    profilePictureURL: decodedToken.profilePictureURL,
    exp: decodedToken.exp,
    iat: decodedToken.iat,
  };
};
