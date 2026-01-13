import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState , useEffect } from "react";
import axios from "@/utils/axiosInstance";

export default function ReAuthDialog({ open, onSuccess }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
        setPassword("");
        setError("");
    }
  }, [open]);

  const confirm = async () => {
    if (!password.trim()) {
      setError("Enter your password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await axios.post("/user/verify-password", { password });

      onSuccess();
      setPassword("");
    } catch (err) {
      setError("Incorrect password");
    } finally {
      setLoading(false);
    }
  };



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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            confirm();
          }}
          className="space-y-4"
        >
          <Input
            autoFocus
            type="password"
            placeholder="Account password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-xs placeholder:text-zinc-500"
          />

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600"
          >
            {loading ? "Verifying…" : "Unlock"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
