import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, KeyRound, LogOut, Home } from "lucide-react";

export default function Sidebar() {
  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: <Home size={18} /> },
    { name: "My Passwords", path: "/dashboard/passwords", icon: <KeyRound size={18} /> },
  ];

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-0 top-0 h-screen w-56 bg-white/70 dark:bg-black/40 backdrop-blur-xl shadow-xl border-r border-white/20 flex flex-col p-6"
    >
      <div className="flex items-center gap-2 mb-8">
        <Shield className="text-primary" />
        <h1 className="font-bold text-xl">PassOp</h1>
      </div>

      <nav className="flex flex-col gap-2">
        {menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                isActive ? "bg-primary text-white shadow-md" : "hover:bg-black/10 dark:hover:bg-white/10"
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        <button className="flex items-center gap-3 px-3 py-2 w-full bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500/20 transition">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </motion.aside>
  );
}
