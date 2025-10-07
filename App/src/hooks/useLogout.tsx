import { useNavigate } from "react-router-dom";

/**
 * A custom hook that provides a reusable logout function
 * Clears all authentication-related data from localStorage except darkMode
 * and redirects to login page
 */
export const useLogout = () => {
  const navigate = useNavigate();

  const logout = () => {
    // Preserve darkMode
    const darkMode = localStorage.getItem("darkMode");

    // Clear everything
    localStorage.clear();

    // Restore darkMode
    if (darkMode !== null) {
      localStorage.setItem("darkMode", darkMode);
    }

    // Navigate to login page
    navigate("/login", { replace: true });
  };

  return logout;
};
