import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function ReAuthDialog({ open, onClose, onSuccess }) {
  const [password, setPassword] = useState("");

  const confirm = () => {
    if (!password) {
      alert("Enter your password");
      return;
    }

    // 🔐 For now assume correct (later verify via API)
    onSuccess();
    setPassword("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass">
        <DialogHeader>
          <DialogTitle>Unlock Your vault</DialogTitle>
          <p className="text-xs text-zinc-400">
            For your security, please confirm your password.
          </p>
        </DialogHeader>

        <Input
          type="password"
          placeholder="Account password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-white/5 border-white/20 placeholder:text-zinc-400"
        />

        <Button onClick={confirm} className="bg-violet-600">
          Confirm
        </Button>
      </DialogContent>
    </Dialog>
  );
}
