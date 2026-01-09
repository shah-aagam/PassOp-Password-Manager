import { motion } from "framer-motion";
import { Eye, Copy } from "lucide-react";

export default function PasswordCard({ item }) {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      className="glass glow rounded-2xl p-6 transition"
    >
      <h3 className="text-xl font-semibold">{item.site}</h3>
      <p className="text-sm text-zinc-300 mt-1">{item.username}</p>

      <div className="flex gap-4 mt-6">
        <button className="hover:text-violet-400 transition">
          <Eye size={18} />
        </button>
        <button className="hover:text-violet-400 transition">
          <Copy size={18} />
        </button>
      </div>
    </motion.div>
  );
}
