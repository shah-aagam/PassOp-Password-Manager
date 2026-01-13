import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import useVaultLock from "@/hooks/useVaultLock";
import ReAuthDialog from "@/components/auth/ReAuthDialog";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

export default function Settings() {
  const navigate = useNavigate();
  const { lockVault } = useVaultLock();

    const { isAuthenticated, logout } = useAuth();

  const [showReauth, setShowReauth] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [autoLock, setAutoLock] = useState(
    localStorage.getItem("autoLock") || "5"
  );

  const onAuthSuccess = () => {
    if (pendingAction === "lock") {
      lockVault();
    }

    if (pendingAction === "logout") {
      localStorage.removeItem("token");
      navigate("/login");
    }

    setPendingAction(null);
  };

  if (!isAuthenticated) {
  return <Navigate to="/login" replace />;
}

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-4xl mx-auto">

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-10"
        >
          Settings
        </motion.h1>

        <Section title="Security" desc="Control how your vault is protected">

          <SettingRow
            title="Auto-lock vault"
            desc="Automatically lock vault after inactivity"
          >
            <select
              value={autoLock}
              onChange={(e) => {
                setAutoLock(e.target.value);
                localStorage.setItem("autoLock", e.target.value);
              }}
              className="bg-white/5 border border-white/20 rounded-lg px-3 py-2"
            >
              <option className="bg-[#272727] text-white" value="1">1 minute</option>
              <option className="bg-[#272727] text-white" value="5">5 minutes</option>
              <option className="bg-[#272727] text-white" value="10">10 minutes</option>
              <option className="bg-[#272727] text-white" value="30">30 minutes</option>
            </select>
          </SettingRow>

          <SettingRow
            title="Lock vault"
            desc="Immediately lock your vault and clear sensitive data"
          >
            <Button
                variant="outline"
                onClick={() => {
                    lockVault(); 
                }}
                >
                Lock now
            </Button>

          </SettingRow>

          {/* Change password (UI only for now) */}
          <SettingRow
            title="Change master password"
            desc="Update the password used to unlock your vault"
          >
            <Button variant="outline" disabled>
              Coming soon
            </Button>
          </SettingRow>
        </Section>

        {/* PRIVACY */}
        <Section title="Privacy" desc="How your data is handled">

          <SettingRow
            title="Clipboard protection"
            desc="Passwords copied to clipboard are cleared automatically"
          >
            <span className="text-zinc-400 text-sm">Enabled</span>
          </SettingRow>

          <SettingRow
            title="Security activity"
            desc="View when your passwords were accessed"
          >
            <Button variant="outline" onClick={() => navigate("/security")}>
              View logs
            </Button>
          </SettingRow>
        </Section>

        {/* 👤 ACCOUNT */}
        <Section title="Account" desc="Session and account actions">

          <SettingRow
            title="Logout"
            desc="Sign out from this device"
          >
            <Button
              variant="outline"
              onClick={logout}
            >
              Logout
            </Button>
          </SettingRow>

        </Section>

        <ReAuthDialog
          open={showReauth}
          onClose={() => setShowReauth(false)}
          onSuccess={onAuthSuccess}
        />
      </div>
    </div>
  );
}

/* ───────────────────────────── */

function Section({ title, desc, children }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm text-zinc-400 mt-1">{desc}</p>

      <div className="mt-4 space-y-4">
        {children}
      </div>
    </div>
  );
}

function SettingRow({ title, desc, children }) {
  return (
    <div className="glass rounded-xl p-5 flex justify-between items-center">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-zinc-400 mt-1">{desc}</p>
      </div>
      {children}
    </div>
  );
}
