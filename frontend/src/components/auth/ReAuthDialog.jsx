import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { deriveMasterKey, checkVerifier } from "@/utils/cryptoUtils";
import { useAuth } from "@/context/AuthContext";

const MAX_ATTEMPTS = 3;

export default function ReAuthDialog({ open, onSuccess }) {
  const [masterPassword, setMasterPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [shake, setShake] = useState(false);

  const { encryptionSalt, vaultVerifier, setEncryptionKey } = useAuth(); // ← from context

  useEffect(() => {
    if (!open) {
      setMasterPassword("");
      setError("");
      setAttempts(0);
      setShake(false);
    }
  }, [open]);

  const forceLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("vaultLocked");
    window.location.href = "/login";
  };

  const confirm = async () => {
    if (!masterPassword.trim() || loading) {
      toast.error("Master password required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (!encryptionSalt || !vaultVerifier) {
        toast.error("Session expired. Please re-login.");
        return forceLogout();
      }

      // derive key from master password + salt
      const key = await deriveMasterKey(masterPassword, encryptionSalt);

      // verify it's correct using vaultVerifier
      const isCorrect = await checkVerifier(key, vaultVerifier);

      if (!isCorrect) {
        // wrong master password
        const next = attempts + 1;
        setAttempts(next);

        if (next >= MAX_ATTEMPTS) {
          toast.error("Too many incorrect attempts. Logging out...", {
            onClose: () => forceLogout(),
          });
        } else {
          setError(`Incorrect master password. ${MAX_ATTEMPTS - next} attempts left.`);
          setShake(true);
          setTimeout(() => setShake(false), 400);
        }
        return;
      }

      // correct — store key in context and unlock
      setEncryptionKey(key);
      onSuccess();

    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const lockedOut = attempts >= MAX_ATTEMPTS;

  return (
    <Dialog open={open}>
      <DialogContent
        className="glass [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Unlock your vault</DialogTitle>
          <p className="text-xs text-zinc-400">
            Enter your master password to decrypt your vault.
          </p>
        </DialogHeader>

        <motion.form
          onSubmit={(e) => { e.preventDefault(); confirm(); }}
          animate={shake ? { x: [-8, 8, -6, 6, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <Input
            autoFocus
            type="password"
            placeholder="Master password"
            disabled={lockedOut}
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            className="bg-white/5 border-white/20 placeholder:text-zinc-500"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button
            type="submit"
            disabled={loading || lockedOut}
            className="w-full bg-violet-600 hover:bg-violet-700"
          >
            {loading ? "Decrypting…" : "Unlock"}
          </Button>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}