import { useEffect, useState } from "react";

export default function useVaultLock() {
  const [locked, setLocked] = useState(
    () => localStorage.getItem("vaultLocked") === "true"
  );

  const lockVault = () => {
    localStorage.setItem("vaultLocked", "true");
    setLocked(true);
  };

  const unlockVault = () => {
    localStorage.removeItem("vaultLocked");
    setLocked(false);
  };

  /* Auto-lock */
  useEffect(() => {
    let timer;

    const resetTimer = () => {
      clearTimeout(timer);

      const minutes = Number(localStorage.getItem("autoLock") || 5);
      timer = setTimeout(lockVault, minutes * 60 * 1000);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, []);

  return { locked, lockVault, unlockVault };
}
