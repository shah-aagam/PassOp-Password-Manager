import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axiosInstance.js";
import { useState } from "react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const signup = () => {
    setLoading(true);
    try {
      setLoading(true);
      if (!name || !email || !password) {
        alert("All fields are required");
        return;
      }

      const res = axios.post("/user/signup", {
        name,
        email,
        password,
      });

      navigate("/login");
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 glass glow rounded-2xl p-10 w-full max-w-md"
      >
        <h1 className="text-3xl font-bold tracking-tight text-center">
          Create account
        </h1>

        <p className="text-center text-zinc-300 mt-2">
          Start using your secure password vault
        </p>

        <div className="mt-8 space-y-4">
          <Input
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white/5 border-white/20 placeholder:text-zinc-500"
          />

          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/5 border-white/20 placeholder:text-zinc-500"
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white/5 border-white/20 placeholder:text-zinc-500"
          />

          <Button
            onClick={signup}
            disabled={loading}
            className="w-full mt-4 bg-violet-600 hover:bg-violet-500 glow"
          >
            { loading ? "Creating account" : "Create account" }
          </Button>
        </div>

        <p className="text-sm text-center text-zinc-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-violet-400 hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
