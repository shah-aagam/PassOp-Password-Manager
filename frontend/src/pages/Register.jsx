// "Master password never goes to the server.
//  At register I derive an AES key from master password + random salt,
//  encrypt the word 'verify' with it, and store that as vaultVerifier.
//  At unlock I re-derive the key and try to decrypt vaultVerifier —
//  AES-GCM automatically throws an error on wrong key,
//  so if decryption succeeds the master password is correct."

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axiosInstance.js";
import { useState } from "react";
import { toast } from "react-toastify";
import { deriveMasterKey, createVerifier } from "@/utils/cryptoUtils";


function generateSalt() {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...salt));
}

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const signup = async () => {
    if (!name || !email || !password || !masterPassword) {
      toast.error("All fields are required", {
        position: "top-right", autoClose: 3000,
        hideProgressBar: false, closeOnClick: true,
        draggable: true, theme: "colored",
      });
      return;
    }

    setLoading(true);
    try {
      const encryptionSalt = generateSalt();
      const key = await deriveMasterKey(masterPassword, encryptionSalt);
      const vaultVerifier = await createVerifier(key);
      // key is discarded here — will be re-derived at unlock

      await axios.post("/user/signup", {
        name, email, password,
        encryptionSalt,  // random salt → server stores it
        vaultVerifier,   // encrypted "verify" → server stores it
        // master password and key never leave the browser ✅
      });

      toast.success("Account created!", { theme: "colored", autoClose: 2000 });
      navigate("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "An error occurred", {
        position: "top-right", autoClose: 3000,
        hideProgressBar: false, closeOnClick: true,
        draggable: true, theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex-grow h-full flex items-center justify-center overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 glass glow rounded-2xl p-10 w-full max-w-md"
      >
        <h1 className="text-3xl font-bold tracking-tight text-center">Create account</h1>
        <p className="text-center text-zinc-300 mt-2">Start using your secure password vault</p>

        <div className="mt-8 space-y-4">
          <Input placeholder="Full name" value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white/5 border-white/20 placeholder:text-zinc-500" />
          <Input placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/5 border-white/20 placeholder:text-zinc-500" />
          <Input type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white/5 border-white/20 placeholder:text-zinc-500" />
          <Input type="password" placeholder="Master Password (used to unlock vault)"
            value={masterPassword} onChange={(e) => setMasterPassword(e.target.value)}
            className="bg-white/5 border-white/20 placeholder:text-zinc-500" />
          <Button onClick={signup} disabled={loading}
            className="w-full mt-4 bg-violet-600 hover:bg-violet-500 glow">
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </div>

        <p className="text-sm text-center text-zinc-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-violet-400 hover:underline">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}