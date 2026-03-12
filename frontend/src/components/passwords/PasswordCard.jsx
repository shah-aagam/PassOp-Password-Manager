/* eslint-disable react/prop-types */
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
import AuditDialog from "../audit/AuditDialog";
import { toast } from 'react-toastify';
import { decryptData } from "@/utils/cryptoUtils";
import { useAuth } from "@/context/AuthContext";

function PasswordCard({ item, onUpdated }) {
  const [password, setPassword] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showAudit , setShowAudit] = useState(false);

  const { encryptionKey } = useAuth();

  const isUrl = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(item.site);
  
  const domain = isUrl 
    ? item.site.toLowerCase().replace(/^https?:\/\//, "").split('/')[0] 
    : null;

  const favicon = domain 
    ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` 
    : null;


const fetchDecryptedPassword = async () => {
  if (!encryptionKey) {
    toast.error("Vault locked");
    return;
  }

  setLoading(true);

  try {
    const res = await axios.get(`/password/view/${item._id}`);

    const { ciphertext, iv } = res.data;

    const decrypted = await decryptData(
      ciphertext,
      iv,
      encryptionKey
    );

    setPassword(decrypted);
    return decrypted;
  } finally {
    setLoading(false);
  }
};

  const confirmDelete = async () => {
    await axios.delete(`/password/delete/${item._id}`);
    onUpdated();
  };

const copyPassword = async () => {
  if (!encryptionKey) {
    toast.error("Vault locked");
    return;
  }

  const res = await axios.post(`/password/copy/${item._id}`);

  const { ciphertext, iv } = res.data;

  const decrypted = await decryptData(
    ciphertext,
    iv,
    encryptionKey
  );

  await navigator.clipboard.writeText(decrypted);

  toast.success("Password copied");

  setTimeout(async () => {
    const current = await navigator.clipboard.readText();
    if (current === decrypted) {
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
      className="glass glow rounded-2xl px-10 py-6 transition"
    >
      <div className="flex items-center gap-3">

        {favicon ? (
          <img
            src={favicon}
            alt=""
            className="w-6 h-6 rounded object-contain"
          />
        ) : (
          <div className="w-6 h-6 rounded bg-violet-600 flex items-center justify-center text-sm font-bold text-white uppercase">
            {item.site.charAt(0)}
          </div>
        )}
        
        <h3 className="text-xl font-semibold truncate" title={item.site}>
          {item.site}
        </h3>
      </div>

      <p className="pl-10 text-sm text-zinc-300 mt-2">{item.username}</p>

      <div className="pl-10 mt-2 text-sm text-zinc-200 font-mono">
        {password ? password : "••••••••"}
      </div>

      <div className="flex justify-center gap-4 mt-6 ">
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

        <button
          title="View activity"
          onClick={() => setShowAudit((v) => !v)}
          className="hover:text-violet-400"
        >
          📜
        </button>

      </div>

      <AuditDialog
        open={showAudit}
        onClose={() => setShowAudit(false)}
        passwordId={item._id}
        site={item.site}
      />



      <EditPasswordDialog
        open={showEdit}
        onClose={() => setShowEdit(false)}
        item={item}
        onUpdated={onUpdated}
      />


      <ReAuthDialog
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={async () => {
          try {
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
          } finally {
            // ALWAYS close dialog
            setShowAuth(false);
            setPendingAction(null);
          }
        }}
      />
    </motion.div>
  );
}

export default memo(PasswordCard);

