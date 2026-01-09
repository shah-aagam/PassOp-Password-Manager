import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import axios from "@/utils/axiosInstance";

export default function AddPasswordDialog({ onPasswordAdded }) {
  const [site, setSite] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSave = async () => {
    if (!site || !username || !password) {
      alert("All fields are required");
      return;
    }

    try {
      setLoading(true);

      await axios.post("/password/create", {
        site,
        username,
        password,
      });

      // ✅ Reset form
      setSite("");
      setUsername("");
      setPassword("");

      // ✅ Close dialog
      setOpen(false);

      // ✅ Refresh dashboard list
      if (onPasswordAdded) {
        onPasswordAdded();
      }

    } catch (err) {
      console.error(err);
      alert("Failed to save password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-violet-600 hover:bg-violet-600 glow transition">
          + Add Password
        </Button>
      </DialogTrigger>

      <DialogContent className="glass border-white/20">
        <DialogHeader>
          <DialogTitle>Add new password</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Input
            placeholder="Website (e.g. github.com)"
            value={site}
            onChange={(e) => setSite(e.target.value)}
            className="bg-white/5 border-white/20"
          />

          <Input
            placeholder="Username / Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-white/5 border-white/20"
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white/5 border-white/20"
          />

          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-600 glow"
          >
            {loading ? "Saving..." : "Save securely"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
