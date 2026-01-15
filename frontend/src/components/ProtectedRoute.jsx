import { Navigate } from "react-router-dom";
import {useAuth} from "@/context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading , authReady } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-400">
        Checking authentication...
      </div>
    );
  }

  if( !authReady) return null ;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
