import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "../utils/axiosInstance";
import { useAuth } from "@/context/AuthContext";
import { toast } from 'react-toastify';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      setLoading(true);
      if( !email || !password ){
        toast.error("All fields are required", {
          position: "top-right",
          autoClose: 3000, 
          hideProgressBar: false,
          closeOnClick: true,
          draggable: true,
          progress: undefined,
          theme: "colored", 
        });
        return ;
      }

      const res = await axios.post("/user/login", {
        email,
        password,
      });

      login(res.data.token);
      // localStorage.setItem("token", res.data.token);
      // localStorage.removeItem("vaultLocked");
      toast.success("Login successfull");
      navigate("/dashboard", { replace: true });

    } catch (err) {
      toast.error("Invalid credentials", {
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
    <div className="relative flex-grow h-full flex items-center justify-center px-6">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl opacity-50" />
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
