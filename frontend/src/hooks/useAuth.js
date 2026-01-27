import { useEffect, useState } from "react";

export default function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  useEffect(() => {
    const syncAuth = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };

    // Listen to token changes (logout / login)
    window.addEventListener("storage", syncAuth);

    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.postMessage(
      {
        type: "PASSOP_LOGOUT",
      },
      window.location.origin
    );
    setIsAuthenticated(false);
    window.location.href = "/login";
  };

  return { isAuthenticated, logout };
}


