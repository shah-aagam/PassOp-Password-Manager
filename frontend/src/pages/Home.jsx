import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* Background glow blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/30 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-4xl text-center px-6"
      >
        <h1 className="text-6xl font-extrabold leading-tight tracking-tight">
          Your passwords.
          <br />
          <span className="text-violet-400">Beautifully secured.</span>
        </h1>

        <p className="mt-6 text-lg text-zinc-300">
          A premium password manager with AES-256 encryption,
          stunning UI, and zero compromises on security.
        </p>

        <div className="mt-10 flex justify-center gap-6">
          <Link to="/dashboard">
            <Button
              size="lg"
              variant="default"
              className="bg-violet-600 hover:bg-violet-600 hover:brightness-110 transition glow"
            >
              Open Vault
            </Button>
          </Link>


          <Link to="/register">
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </Link>
        </div>

      </motion.div>
    </div>
  );
}
