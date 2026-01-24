import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth} from "@/context/AuthContext";


export default function Home() {
  const { isAuthenticated, authReady } = useAuth();

  if (!authReady) return null;

  return (
    <div className="relative h-full flex items-center justify-center overflow-hidden">

      <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/30 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-4xl text-center px-6"
      >
        <h1 className="text-6xl font-extrabold leading-tight tracking-tight">
          {isAuthenticated ? (
            <>
              Welcome back.
              <br />
              <span className="text-violet-400">Your vault is ready.</span>
            </>
          ) : (
            <>
              Your passwords.
              <br />
              <span className="text-violet-400">
                Secure. Private. Always with you.
              </span>
            </>
          )}
        </h1>

        <p className="mt-6 text-lg text-zinc-300 max-w-2xl mx-auto">
          {isAuthenticated
            ? "Access, manage, and protect your passwords from one secure vault."
            : "A secure password manager that protects your digital life with strong encryption and privacy-first design."}
        </p>

        <div className="mt-10 flex justify-center gap-6">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button
                size="lg"
                className="bg-violet-600 hover:bg-violet-600 hover:brightness-110 glow"
              >
                Go to Vault
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/dashboard">
                <Button
                  size="lg"
                  className="bg-violet-600 hover:bg-violet-600 hover:brightness-110 glow"
                >
                  Open Vault
                </Button>
              </Link>

              <Link to="/register">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </>
          )}
        </div>

        <p className="mt-8 text-sm text-zinc-400">
          Protected with industry-standard encryption. Your data stays yours.
        </p>



      </motion.div>
    </div>
  );
}
