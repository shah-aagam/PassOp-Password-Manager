import { motion } from "framer-motion";
import { Eye, Copy, Trash2 } from "lucide-react";

export default function PasswordTable({ passwords }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full bg-white/70 dark:bg-black/50 backdrop-blur-xl shadow-lg rounded-xl p-6"
    >
      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-600 dark:text-gray-300 border-b">
            <th className="py-2">Site</th>
            <th>Password</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {passwords.map((p, i) => (
            <tr key={i} className="border-b">
              <td className="py-3">{p.site}</td>
              <td>{"*".repeat(10)}</td>
              <td className="flex gap-3">
                <Eye size={18} className="cursor-pointer hover:text-primary" />
                <Copy size={18} className="cursor-pointer hover:text-primary" />
                <Trash2 size={18} className="cursor-pointer hover:text-red-500" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}
