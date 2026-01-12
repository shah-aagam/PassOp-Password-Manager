import { useEffect, useState } from "react";
import axios from "@/utils/axiosInstance";

export default function AuditTimeline({ passwordId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/audit/${passwordId}`).then((res) => {
      setLogs(res.data);
      setLoading(false);
    });
  }, [passwordId]);

  if (loading) {
    return <p className="text-sm text-center text-zinc-400">Loading activity…</p>;
  }

  if (logs.length === 0) {
    return <p className="text-sm text-center text-zinc-400">No activity yet</p>;
  }

  return (
    <div className="mt-4 space-y-2">
      {logs.map((log) => (
        <div
          key={log._id}
          className="flex justify-between text-sm text-zinc-300"
        >
          <span>{log.action.replace("_", " ")}</span>
          <span className="text-zinc-500">
            {new Date(log.createdAt).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
