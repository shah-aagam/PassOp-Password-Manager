import { useEffect, useState } from "react";
import axios from "@/utils/axiosInstance";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Trash2, 
  Eye, 
  Edit3, 
  Copy, 
  Clock, 
  ShieldCheck 
} from "lucide-react";


const getActionDetails = (action) => {
  switch (action.toLowerCase()) {
    case 'delete_password':
      return { icon: <Trash2 size={18} />, color: 'text-red-400', bg: 'bg-red-400/10' };
    case 'edit_password':
      return { icon: <Edit3 size={18} />, color: 'text-blue-400', bg: 'bg-blue-400/10' };
    case 'view_password':
      return { icon: <Eye size={18} />, color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
    case 'copy_password':
      return { icon: <Copy size={18} />, color: 'text-violet-400', bg: 'bg-violet-400/10' };
    default:
      return { icon: <ShieldCheck size={18} />, color: 'text-zinc-400', bg: 'bg-zinc-400/10' };
  }
};

export default function Activity() {
  const [logs, setLogs] = useState([]);
  const { isAuthenticated, authReady } = useAuth();

  useEffect(() => {
    axios.get("/audit").then((res) => setLogs(res.data));
  }, []);

  if (!authReady) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="relative flex-grow h-full px-6 py-10 overflow-hidden">
      
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Activity Log</h1>
          <p className="text-zinc-400 mt-2">
            Monitor all actions performed in your secure vault.
          </p>
        </header>

        <div className="space-y-3">
          {logs.map((log, index) => {
            const { icon, color, bg } = getActionDetails(log.action);
            
            return (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={log._id}
                className="glass border border-white/5 hover:border-white/10 transition-colors rounded-xl px-6 py-4 flex items-center justify-between group"
              >
                <div className="flex items-center gap-5">
                  {/* Action Icon */}
                  <div className={`p-3 rounded-lg ${bg} ${color} group-hover:scale-110 transition-transform`}>
                    {icon}
                  </div>

                  <div>
                    <p className="font-semibold capitalize text-zinc-100">
                      {log.action.replace("_", " ").toLowerCase()}
                    </p>
                    <p className="text-sm text-zinc-500 flex items-center gap-1.5">
                      <span className="text-zinc-400">Target:</span> 
                      {log.passwordId?.site || "System"}
                    </p>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5 text-sm text-zinc-300 font-medium">
                    <Clock size={12} />
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-[12px] text-zinc-400 uppercase tracking-wider">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          {logs.length === 0 && (
            <div className="text-center py-20 glass rounded-2xl border-dashed border-2 border-white/5">
              <p className="text-zinc-500">No recent activity found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}