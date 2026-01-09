// USER FLOW (END TO END)

// 1 Dashboard loads
// 2️ User sees masked passwords
// 3️ Click 👁️ → password fetched & shown
// 4️ Click 👁️ again → hidden
// 5️ Click 📋 → password copied
// 6️ Backend decrypts only on demand

import { motion } from "framer-motion";
import { Eye, EyeOff, Copy } from "lucide-react";
import { useState } from "react";
import axios from "@/utils/axiosInstance";
import ReAuthDialog from "@/components/auth/ReAuthDialog";
import { Trash2, Edit } from "lucide-react";
import EditPasswordDialog from "@/components/passwords/EditPasswordDialog";

export default function PasswordCard({ item }) {
  const [password, setPassword] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  const confirmDelete = async () => {
    await axios.delete(`/password/delete/${item._id}`);
    window.location.reload(); // simple for now
  };

  const togglePassword = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/password/view/${item._id}`);
      setPassword(res.data.password);
    } catch (err) {
      alert("Failed to fetch password");
    } finally {
      setLoading(false);
    }
  };

  // 📋 Copy password
  const copyPassword = async () => {
    try {
      let textToCopy = password;

      // If password not revealed yet → fetch first
      if (!textToCopy) {
        const res = await axios.get(`/password/view/${item._id}`);
        textToCopy = res.data.password;
      }

      await navigator.clipboard.writeText(textToCopy);
      alert("Password copied to clipboard");
    } catch (err) {
      alert("Failed to copy password");
    }
  };

  const requestViewPassword = () => {
    if (password) {
      setPassword(null);
      return;
    }
    setPendingAction("view");
    setShowAuth(true);
  };

  const requestCopyPassword = () => {
  setPendingAction("copy");
  setShowAuth(true);
};

const requestEditPassword = () => {
  setPendingAction("edit");
  setShowAuth(true);
};

const requestDeletePassword = () => {
  setPendingAction("delete");
  setShowAuth(true);
};


  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      className="glass glow rounded-2xl p-6 transition"
    >
      <h3 className="text-xl font-semibold">{item.site}</h3>
      <p className="text-sm text-zinc-300 mt-1">{item.username}</p>

      {/* Password Display */}
      <div className="mt-4 text-sm text-zinc-200">
        {password ? (
          <span className="font-mono">{password}</span>
        ) : (
          <span className="tracking-widest">••••••••</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-6">
        <button
          title="View Password"
          onClick={requestViewPassword}
          disabled={loading}
          className="hover:text-violet-400 transition"
        >
          {password ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>

        <button
          title="Copy Password"
          onClick={requestCopyPassword}
          className="hover:text-violet-400 transition"
        >
          <Copy size={18} />
        </button>

        <button
          title="Edit Password"
          onClick={requestEditPassword}
          className="hover:text-violet-400 transition"
        >
          <Edit size={18} />
        </button>

        <button
          title="Delete Password"
          onClick={requestDeletePassword}
        >
          <Trash2 size={18} />
        </button>

        <EditPasswordDialog
          open={showEdit}
          onClose={() => setShowEdit(false)}
          item={item}
          onUpdated={() => window.location.reload()}
        />

        <ReAuthDialog
          open={showAuth}
          onClose={() => setShowAuth(false)}
          onSuccess={async () => {
            if (pendingAction === "view") {
              await togglePassword();
            }

            if (pendingAction === "copy") {
              await copyPassword();
            }

            if (pendingAction === "edit") {
              setShowEdit(true);
            }

            if (pendingAction === "delete") {
              await confirmDelete();
            }

            setPendingAction(null);
          }}
        />
      </div>
    </motion.div>
  );
}
