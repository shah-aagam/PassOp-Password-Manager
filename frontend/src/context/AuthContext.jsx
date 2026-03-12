import { createContext, useContext, useState , useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsAuthenticated(!!token);
        setAuthReady(true);
    }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    localStorage.removeItem("vaultLocked");
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("vaultLocked");
    setIsAuthenticated(false);
    setEncryptionKey(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, authReady, login, logout , encryptionKey, setEncryptionKey }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
