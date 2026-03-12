import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function useVaultLock() {
  const token = localStorage.getItem("token");

  const { setEncryptionKey } = useAuth();

  const [locked, setLocked] = useState(() => {
    //  Vault lock only applies if user is logged in
    if (!token) return false;
    return localStorage.getItem("vaultLocked") === "true";
  });
  
  const lockVault = () => {
    if (!token) return;
    localStorage.setItem("vaultLocked", "true");
    setEncryptionKey(null); 
    setLocked(true);
  };

  const unlockVault = () => {
    localStorage.removeItem("vaultLocked");
    setLocked(false);
  };

  /* RESET vault lock on logout/login */
  useEffect(() => {
    if (!token) {
      // User logged out → clear vault lock
      localStorage.removeItem("vaultLocked");
      setLocked(false);
    }
  }, [token]);

  /* ⏱ AUTO-LOCK (ONLY WHEN LOGGED IN) */
  useEffect(() => {
    if (!token) return;

    let timer;

    const resetTimer = () => {
      clearTimeout(timer);

      const minutes = Number(localStorage.getItem("autoLock") || 5);
      timer = setTimeout(() => {
        lockVault();
      }, minutes * 60 * 1000);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, [token]);

  return { locked, lockVault, unlockVault };
}