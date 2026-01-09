import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "../utils/axiosInstance";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      const res = await axios.post("/user/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);

      navigate("/dashboard", { replace: true });

    } catch (err) {
      alert("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass glow rounded-2xl p-10 w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center">Welcome back</h1>

        <div className="mt-8 space-y-4">
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
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-600 glow"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </div>

        <p className="text-sm text-center text-zinc-400 mt-6">
          Don’t have an account?{" "}
          <Link to="/register" className="text-violet-400 hover:underline">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
