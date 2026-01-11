import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PasswordCard from "@/components/passwords/PasswordCard";
import AddPasswordDialog from "@/components/passwords/AddPasswordDialog";
import axios from "@/utils/axiosInstance";
import useVaultLock from "@/hooks/useVaultLock";
import ReAuthDialog from "@/components/auth/ReAuthDialog";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List , Search } from "lucide-react";

export default function Dashboard() {
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid"); // grid | list

  const { locked, unlockVault } = useVaultLock();
  const [showUnlock, setShowUnlock] = useState(false);


  const fetchPasswords = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/password/all");
      setPasswords(res.data);
    } catch (err) {
      console.error("Failed to fetch passwords", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPasswords();
  }, [fetchPasswords]);

  /* 🔍 Search */
  const filteredPasswords = useMemo(() => {
    return passwords.filter((p) =>
      `${p.site} ${p.username}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [passwords, search]);


  if (locked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="glass rounded-2xl p-10 text-center max-w-sm w-full">
          <h2 className="text-2xl font-semibold">Vault locked</h2>
          <p className="text-zinc-400 mt-2">
            Your vault was locked due to inactivity.
          </p>

          <Button
            className="mt-6 bg-violet-600 hover:bg-violet-600 glow"
            onClick={() => setShowUnlock(true)}
          >
            Unlock vault
          </Button>

          <ReAuthDialog
            open={showUnlock}
            onClose={() => setShowUnlock(false)}
            onSuccess={unlockVault}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold">Vault</h1>
          <p className="text-zinc-400 mt-1">
            All your saved passwords in one secure place
          </p>
        </motion.div>


        {!loading && passwords.length > 0 && (
          <div className="grid grid-cols-3 items-center gap-4 mb-10">

            <div>
              <AddPasswordDialog onPasswordAdded={fetchPasswords} />
            </div>

            <div className="flex justify-center w-full">
              <div className="relative w-full max-w-xl">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-5 w-5 text-zinc-400" />
                </div>

                <input
                  placeholder="Search passwords…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg pl-12 pr-5 py-2.5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                size="icon"
                variant={view === "grid" ? "default" : "ghost"}
                onClick={() => setView("grid")}
              >
                <LayoutGrid size={18} />
              </Button>

              <Button
                size="icon"
                variant={view === "list" ? "default" : "ghost"}
                onClick={() => setView("list")}
              >
                <List size={18} />
              </Button>
            </div>
          </div>
        )}

        {/* STATES */}
        {loading && (
          <p className="mt-24 text-center text-zinc-400">
            Loading your vault…
          </p>
        )}

        {!loading && passwords.length === 0 && (
          <div className="mt-24 text-center text-zinc-400 max-w-md mx-auto">
            <p className="text-xl font-medium text-white">
              Your vault is empty
            </p>
            <p className="mt-3 text-sm leading-relaxed">
              Add your first password to start securing your digital life.
            </p>
            <div className="mt-6">
              <AddPasswordDialog onPasswordAdded={fetchPasswords} />
            </div>
          </div>
        )}

        {!loading && passwords.length > 0 && filteredPasswords.length === 0 && (
          <p className="mt-24 text-center text-zinc-400">
            No passwords match your search.
          </p>
        )}

        {/* PASSWORDS */}
        <AnimatePresence>
          {!loading && filteredPasswords.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={
                view === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {filteredPasswords.map((p) => (
                <PasswordCard
                  key={p._id}
                  item={p}
                  onUpdated={fetchPasswords}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

