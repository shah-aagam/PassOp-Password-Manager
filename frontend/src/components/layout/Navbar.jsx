import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {useAuth} from "@/context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        <Link
          to="/"
          className="text-2xl font-bold"
        >
          <span className="text-violet-400">&lt;</span>
          Pass
          <span className="text-violet-400">OP/&gt;</span>
        </Link>

        {/* Right side */}
        {!isAuthenticated ? (
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>

            <Link to="/register">
              <Button className="bg-violet-600 hover:bg-violet-600 glow">
                Get Started
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex gap-4 items-center">
            <Link to="/dashboard">
              <Button variant="ghost">Vault</Button>
            </Link>

            <Link to="/activity">
              <Button variant="ghost">Activity</Button>
            </Link>

            <Link to="/settings">
              <Button variant="ghost">Settings</Button>
            </Link>

            <Button
              variant="outline"
              onClick={logout}
              className="border-white/20"
            >
              Logout
            </Button>
          </div>
        )}

      </div>
    </nav>
  );
}
