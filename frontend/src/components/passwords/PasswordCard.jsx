// USER FLOW (END TO END)

// 1 Dashboard loads
// 2️ User sees masked passwords
// 3️ Click 👁️ → password fetched & shown
// 4️ Click 👁️ again → hidden
// 5️ Click 📋 → password copied
// 6️ Backend decrypts only on demand

import { useState, memo } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Copy, Trash2, Edit } from "lucide-react";
import axios from "@/utils/axiosInstance";
import ReAuthDialog from "@/components/auth/ReAuthDialog";
import EditPasswordDialog from "@/components/passwords/EditPasswordDialog";

function PasswordCard({ item, onUpdated }) {
  const [password, setPassword] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  const domain = item.site.toLowerCase().replace(/^https?:\/\//, "");
  const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;


  const fetchDecryptedPassword = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/password/view/${item._id}`);
      setPassword(res.data.password);
      return res.data.password;
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    await axios.delete(`/password/delete/${item._id}`);
    onUpdated();
  };

  const copyPassword = async () => {
    let text = password;
    if (!text) text = await fetchDecryptedPassword();

    await navigator.clipboard.writeText(text);
    alert("Password copied. Clipboard history may retain this.");

    setTimeout(async () => {
      const current = await navigator.clipboard.readText();
      if (current === text) {
        await navigator.clipboard.writeText("");
      }
    }, 20000);
  };

  const requestAction = (action) => {
    setPendingAction(action);
    setShowAuth(true);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      className="glass glow rounded-2xl p-6 transition"
    >
      <div className="flex items-center gap-3">
        <img
          src={favicon}
          alt=""
          className="w-6 h-6 rounded"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
        <h3 className="text-xl font-semibold">{item.site}</h3>
      </div>

      <p className="text-sm text-zinc-300 mt-1">{item.username}</p>

      {/* Password display */}
      <div className="mt-4 text-sm text-zinc-200 font-mono">
        {password ? password : "••••••••"}
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-6">
        <button
          title="View password"
          onClick={() =>
            password ? setPassword(null) : requestAction("view")
          }
          disabled={loading}
          className="hover:text-violet-400 transition"
        >
          {password ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>

        <button
          title="Copy password"
          onClick={() => requestAction("copy")}
          className="hover:text-violet-400 transition"
        >
          <Copy size={18} />
        </button>

        <button
          title="Edit password"
          onClick={() => requestAction("edit")}
          className="hover:text-violet-400 transition"
        >
          <Edit size={18} />
        </button>

        <button
          title="Delete password"
          onClick={() => requestAction("delete")}
          className="hover:text-red-400 transition"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Edit dialog */}
      <EditPasswordDialog
        open={showEdit}
        onClose={() => setShowEdit(false)}
        item={item}
        onUpdated={onUpdated}
      />

      {/* Re-auth dialog */}
      <ReAuthDialog
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={async () => {
          if (pendingAction === "view") {
            await fetchDecryptedPassword();
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
    </motion.div>
  );
}

export default memo(PasswordCard);
