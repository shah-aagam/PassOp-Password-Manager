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
import { generatePassword } from "@/utils/passwordGenerator";
import { Eye, EyeOff } from "lucide-react";

export default function EditPasswordDialog({ open, onClose, item, onUpdated }) {
  const [site, setSite] = useState(item.site);
  const [username, setUsername] = useState(item.username);
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const strength = getPasswordStrength(password);
  
  const [length, setLength] = useState(16);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);

  const save = async () => {
    try {
      await axios.put(`/password/update/${item._id}`, {
        site,
        username,
        password,
      });
      onUpdated();
      onClose();
    } catch (error) {
      console.error("Failed to update:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass">
        <DialogHeader>
          <DialogTitle>Edit password</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input 
            placeholder="Site"
            value={site} 
            onChange={e => setSite(e.target.value)} 
          />
          
          <Input 
            placeholder="Username"
            value={username} 
            onChange={e => setUsername(e.target.value)} 
          />

          {/* Password Input with Toggle */}
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
              <div className="h-2 bg-zinc-700 rounded overflow-hidden">
                <div
                  className={`h-2 rounded transition-all duration-300 ${
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
            type="button"
            variant="outline"
            className="w-full"
            onClick={() =>
              setPassword(
                generatePassword({ length, numbers, symbols })
              )
            }
          >
            Generate strong password
          </Button>

          <Button onClick={save} className="w-full bg-violet-600 hover:bg-violet-700">
            Update password
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}