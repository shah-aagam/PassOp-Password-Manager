import { useEffect, useState, useCallback } from "react";

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export default function useVaultLock() {
  const [locked, setLocked] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const lockVault = useCallback(() => {
    setLocked(true);
  }, []);

  const unlockVault = useCallback(() => {
    setLocked(false);
    setLastActivity(Date.now());
  }, []);

  // Track activity
  useEffect(() => {
    const activity = () => setLastActivity(Date.now());

    window.addEventListener("mousemove", activity);
    window.addEventListener("keydown", activity);
    window.addEventListener("click", activity);

    return () => {
      window.removeEventListener("mousemove", activity);
      window.removeEventListener("keydown", activity);
      window.removeEventListener("click", activity);
    };
  }, []);

  // Auto-lock
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastActivity > IDLE_TIMEOUT) {
        setLocked(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastActivity]);

  return {
    locked,
    lockVault,
    unlockVault,
  };
}

