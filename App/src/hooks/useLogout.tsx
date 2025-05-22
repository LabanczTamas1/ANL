import { useNavigate } from "react-router-dom";

/**
 * A custom hook that provides a reusable logout function
 * Clears all authentication-related data from localStorage and redirects to login page
 * @returns {Function} logout function
 */
export const useLogout = () => {
  const navigate = useNavigate();
  
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("name");
    localStorage.removeItem("superRole");
    
    navigate("/login");
  };
  
  return logout;
};