import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useLogout = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("expiresAt");

    navigate("/");
  };

  return logout;
};

const useSessionTimeout = () => {
  const logout = useLogout();

  useEffect(() => {
    const expiresAt = localStorage.getItem("expiresAt");
    console.log(expiresAt);

    if (expiresAt) {
      const sessionTimeout = new Date(expiresAt).getTime() - Date.now();
        console.log(sessionTimeout);
      if (sessionTimeout > 0) {
        const timeoutId = setTimeout(() => {
          logout();
        }, sessionTimeout);

        return () => clearTimeout(timeoutId);
      } else {
        logout();
      }
    }
  }, [logout]);
};

export default useSessionTimeout;
