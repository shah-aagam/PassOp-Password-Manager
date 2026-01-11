import { useEffect, useRef, useState } from "react";

const IDLE_TIME = 5 * 60 * 1000; // 5 minutes

export default function useVaultLock() {
  const [locked, setLocked] = useState(false);
  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setLocked(true);
    }, IDLE_TIME);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll"];

    const handleActivity = () => {
      if (!locked) resetTimer();
    };

    events.forEach((e) => window.addEventListener(e, handleActivity));

    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity));
      clearTimeout(timerRef.current);
    };
  }, [locked]);

  const unlockVault = () => {
    setLocked(false);
    resetTimer();
  };

  const lockVault = () => {
    setLocked(true);
  };

  return { locked, unlockVault, lockVault };
}
