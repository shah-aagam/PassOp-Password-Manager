import { useEffect, useState } from "react";
import axios from "@/utils/axiosInstance";
import useAuth from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function Security() {
  const [logs, setLogs] = useState([]);

    const { isAuthenticated } = useAuth();

  useEffect(() => {
    axios.get("/audit").then((res) => setLogs(res.data));
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Security Activity</h1>

      <div className="space-y-4">
        {logs.map((log) => (
          <div
            key={log._id}
            className="glass rounded-xl px-5 py-4"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">
                  {log.action.replace("_", " ").toLowerCase()}
                </p>
                <p className="text-sm text-zinc-400">
                  {log.passwordId?.site || "Unknown site"}
                </p>
              </div>

              <div className="text-xs text-zinc-500">
                {new Date(log.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
