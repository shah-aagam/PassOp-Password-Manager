import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState(null);

  // restore salt + verifier from sessionStorage on refresh
  const [encryptionSalt, setEncryptionSalt] = useState(
    () => sessionStorage.getItem("encryptionSalt") || null
  );
  const [vaultVerifier, setVaultVerifier] = useState(
    () => sessionStorage.getItem("vaultVerifier") || null
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    setAuthReady(true);
  }, []);

  const login = (token, salt, verifier) => {
    localStorage.setItem("token", token);
    localStorage.removeItem("vaultLocked");

    // salt + verifier in sessionStorage — survives refresh, cleared on tab close
    sessionStorage.setItem("encryptionSalt", salt);
    sessionStorage.setItem("vaultVerifier", verifier);

    setIsAuthenticated(true);
    setEncryptionSalt(salt);
    setVaultVerifier(verifier);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("vaultLocked");
    sessionStorage.removeItem("encryptionSalt");
    sessionStorage.removeItem("vaultVerifier");
    setIsAuthenticated(false);
    setEncryptionKey(null);
    setEncryptionSalt(null);
    setVaultVerifier(null);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      authReady,
      encryptionKey,
      setEncryptionKey,
      encryptionSalt,
      vaultVerifier,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);