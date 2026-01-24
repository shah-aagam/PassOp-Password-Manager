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
import { getPasswordStrength, strengthLabel } from "@/utils/passwordStrength";
import { generatePassword } from "@/utils/passwordGenerator";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";


export default function AddPasswordDialog({ onPasswordAdded }) {
  const [site, setSite] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const strength = getPasswordStrength(password);

  const [length, setLength] = useState(16);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  
  const [showPassword, setShowPassword] = useState(true);

  const handleSave = async () => {
    if (!site || !username || !password) {
      toast.error("All fields are required", {
        position: "top-right",
        autoClose: 3000, // Standard 5 seconds
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
        theme: "colored", 
      });
      return;
    }

    try {
      setLoading(true);

      await axios.post("/password/create", {
        site,
        username,
        password,
      });

      setSite("");
      setUsername("");
      setPassword("");

      setOpen(false);

      if (onPasswordAdded) {
        onPasswordAdded();
      }

    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err.message || "An error occurred", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
        theme: "colored", 
      });
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
            className="bg-white/5 border-white/20 placeholder:text-zinc-500"
          />

          <Input
            placeholder="Username / Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-white/5 border-white/20 placeholder:text-zinc-500"
          />

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="placeholder:text-zinc-500 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

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

          <Button
            variant="outline"
            onClick={() =>
              setPassword(
                generatePassword({ length, numbers, symbols })
              )
            }
          >
            Generate strong password
          </Button>


          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-600 glow"
          >
            {loading ? "Saving..." : "Save to vault"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
