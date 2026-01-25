import { useNavigate } from "react-router-dom";

const useLogout = () => {
  const navigate = useNavigate();

  const logout = () => {
    // Save darkMode before clearing
    const darkMode = localStorage.getItem("darkMode");

    // Clear everything from localStorage
    localStorage.clear();

    // Restore darkMode
    if (darkMode !== null) {
      localStorage.setItem("darkMode", darkMode);
    }

    // Redirect to home or login page
    navigate("/");
  };

  return logout;
};

export default useLogout;
