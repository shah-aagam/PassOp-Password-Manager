import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "@/utils/axiosInstance";
import { useState } from "react";
import { getPasswordStrength, strengthLabel } from "@/utils/passwordStrength";

export default function EditPasswordDialog({ open, onClose, item, onUpdated }) {
  const [site, setSite] = useState(item.site);
  const [username, setUsername] = useState(item.username);
  const [password, setPassword] = useState("");

  const strength = getPasswordStrength(password);

  const save = async () => {
    await axios.put(`/password/update/${item._id}`, {
      site,
      username,
      password,
    });
    onUpdated();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass">
        <DialogHeader>
          <DialogTitle>Edit password</DialogTitle>
        </DialogHeader>

        <Input value={site} onChange={e => setSite(e.target.value)} />
        <Input value={username} onChange={e => setUsername(e.target.value)} />
        <Input
            type="password"
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="placeholder:text-zinc-500"
        />

        {password && (
            <div className="space-y-1">
                <div className="h-2 bg-zinc-700 rounded">
                <div
                    className={`h-2 rounded transition-all ${
                    strength <= 1
                        ? "bg-red-500 w-1/4"
                        : strength === 2
                        ? "bg-yellow-500 w-1/2"
                        : strength === 3
                        ? "bg-green-400 w-3/4"
                        : "bg-green-500 w-full"
                    }`}
                />
                </div>
                <p className="text-xs text-zinc-400">
                Strength: <span className="text-white">{strengthLabel(strength)}</span>
                </p>
            </div>
        )}

        <Button onClick={save} className="bg-violet-600">
          Update password
        </Button>
      </DialogContent>
    </Dialog>
  );
}
