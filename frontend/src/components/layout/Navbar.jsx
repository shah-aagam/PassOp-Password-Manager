import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        <Link to="/" className="text-2xl font-bold">
          <span className="text-violet-400">&lt;</span>
          Pass
          <span className="text-violet-400">OP/&gt;</span>
        </Link>

        <div className="flex gap-4">
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>

          <Link to="/register">
            <Button className="bg-violet-600 glow">
              Get Started
            </Button>
          </Link>
        </div>

      </div>
    </nav>
  );
}
