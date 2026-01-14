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
import axios from "@/utils/axiosInstance";

const MAX_ATTEMPTS = 3;

export default function ReAuthDialog({ open, onSuccess }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!open) {
      setPassword("");
      setError("");
      setAttempts(0);
      setShake(false);
    }
  }, [open]);

  const confirm = async () => {
    if (!password.trim() || loading || attempts >= MAX_ATTEMPTS) return;

    try {
      setLoading(true);
      setError("");

      await axios.post("/user/verify-password", { password });

      onSuccess();
    } catch {
      setAttempts((a) => a + 1);
      setError("Incorrect password");
      setShake(true);
      setTimeout(() => setShake(false), 400);
    } finally {
      setLoading(false);
    }
  };

  const lockedOut = attempts >= MAX_ATTEMPTS;

  return (
    <Dialog open={open}>
      <DialogContent
        className="glass"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Unlock your vault</DialogTitle>
          <p className="text-xs text-zinc-400">
            Confirm your password to continue.
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
            placeholder="Account password"
            disabled={lockedOut}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white/5 border-white/20 placeholder:text-zinc-500"
          />

          {error && (
            <p className="text-sm text-red-400">
              {lockedOut
                ? "Too many failed attempts. Please wait or re-login."
                : error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || lockedOut}
            className="w-full bg-violet-600"
          >
            {loading ? "Verifying…" : "Unlock"}
          </Button>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}