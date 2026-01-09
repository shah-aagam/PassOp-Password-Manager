import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import PasswordCard from "@/components/passwords/PasswordCard";
import AddPasswordDialog from "@/components/passwords/AddPasswordDialog";
import axios from "@/utils/axiosInstance";

export default function Dashboard() {
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPasswords = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/password/all");
      setPasswords(res.data);
    } catch (err) {
      console.error("Failed to fetch passwords", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasswords();
  }, []);

  return (
    <div className="min-h-screen px-10 py-10">

      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8"
      >
        Vault
      </motion.h1>

      <AddPasswordDialog onPasswordAdded={fetchPasswords} />

      {loading && (
        <p className="mt-10 text-zinc-400">Loading your vault...</p>
      )}

      {!loading && passwords.length === 0 && (
        <div className="mt-20 text-center text-zinc-400 max-w-md mx-auto">
          <p className="text-xl font-medium text-white">
            Your vault is empty
          </p>

          <p className="mt-3 text-sm leading-relaxed">
            Start by adding your first password.
            Everything you save here is encrypted and visible only to you.
          </p>

          <div className="mt-6">
            <AddPasswordDialog onPasswordAdded={fetchPasswords} />
          </div>
        </div>
      )}

      {!loading && passwords.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {passwords.map((p) => (
            <PasswordCard key={p._id} item={p} />
          ))}
        </div>
      )}
    </div>
  );
}
