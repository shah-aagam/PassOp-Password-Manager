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
import { deriveKey } from "@/utils/cryptoUtils";
import { useAuth } from "@/context/AuthContext";

const MAX_ATTEMPTS = 3;

export default function ReAuthDialog({ open, onSuccess }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [shake, setShake] = useState(false);

  const { setEncryptionKey } = useAuth();

  useEffect(() => {
    if (!open) {
      setPassword("");
      setError("");
      setAttempts(0);
      setShake(false);
    }
  }, [open]);

  const forceLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("vaultLocked");
    localStorage.removeItem("encryptionSalt");
    window.location.href = "/login";
  };

  const confirm = async () => {
    if (!password.trim() || loading) {
      toast.error("Master password required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const salt = localStorage.getItem("encryptionSalt");
      if (!salt) {
        toast.error("Encryption salt missing. Please re-login.");
        return forceLogout();
      }

      const key = await deriveKey(password, salt);

      // store key in memory
      setEncryptionKey(key);

      onSuccess(); // unlock vault
    } catch (err) {
      setAttempts((prev) => {
        const next = prev + 1;

        if (next >= MAX_ATTEMPTS) {
          toast.error("Too many incorrect attempts. Logging out...", {
            onClose: () => forceLogout(),
          });
        } else {
          setError("Incorrect master password");
          setShake(true);
          setTimeout(() => setShake(false), 400);
        }

        return next;
      });
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
            Enter your master password to decrypt vault.
          </p>
        </DialogHeader>

        <motion.form
          onSubmit={(e) => {
            e.preventDefault();
            confirm();
          }}
          animate={shake ? { x: [-8, 8, -6, 6, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <Input
            autoFocus
            type="password"
            placeholder="Master password"
            disabled={lockedOut}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white/5 border-white/20 placeholder:text-zinc-500"
          />

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

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