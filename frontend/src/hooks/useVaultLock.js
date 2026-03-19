// Now the full refresh flow is:

// User refreshes page
//   → encryptionKey = null (memory wiped)
//   → useEffect detects key is missing
//   → sets vaultLocked = true
//   → user sees unlock screen
//   → enters master password
//   → key re-derived from sessionStorage salt + verifier
//   → vault opens 


import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function useVaultLock() {
  const token = localStorage.getItem("token");
  const { setEncryptionKey, encryptionKey } = useAuth();

  const [locked, setLocked] = useState(() => {
    if (!token) return false;
    return localStorage.getItem("vaultLocked") === "true";
  });

  // if key is gone after refresh → force lock
  useEffect(() => {
    if (token && !encryptionKey) {
      localStorage.setItem("vaultLocked", "true");
      setLocked(true);
    }
  }, [encryptionKey, token]);

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

  useEffect(() => {
    if (!token) {
      localStorage.removeItem("vaultLocked");
      setLocked(false);
    }
  }, [token]);

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