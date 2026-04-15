import React, { useState, useEffect } from "react";
import { getCardActivity } from "../../services/api/kanbanApi";

interface Activity {
  action: string;
  userName: string;
  details: string;
  timestamp: number;
}

interface ActivityLogProps {
  cardId: string;
}

const ACTION_LABELS: Record<string, string> = {
  created: "Created",
  updated: "Updated",
  moved: "Moved",
  commented: "Commented",
  comment_deleted: "Deleted comment",
};

const ACTION_COLORS: Record<string, string> = {
  created: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  updated: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  moved: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  commented: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  comment_deleted: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const ActivityLog: React.FC<ActivityLogProps> = ({ cardId }) => {
  const [open, setOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const handleToggle = async () => {
    const next = !open;
    setOpen(next);

    if (next && !fetched) {
      setLoading(true);
      try {
        const res = await getCardActivity(cardId);
        setActivities(res.data.activities || []);
        setFetched(true);
      } catch {
        setActivities([]);
      } finally {
        setLoading(false);
      }
    }
  };

  // Reset when cardId changes
  useEffect(() => {
    setOpen(false);
    setFetched(false);
    setActivities([]);
  }, [cardId]);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-2">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
      >
        <span>Activity History</span>
        <svg
          className={`w-4 h-4 transform transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="mt-2 max-h-60 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
              Loading activity...
            </p>
          ) : activities.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
              No activity recorded yet.
            </p>
          ) : (
            <div className="space-y-2">
              {activities.map((a, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-sm py-1.5"
                >
                  <span
                    className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                      ACTION_COLORS[a.action] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {ACTION_LABELS[a.action] || a.action}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {a.userName}
                    </span>
                    {a.details && (
                      <span className="text-gray-600 dark:text-gray-400 ml-1">
                        — {a.details}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 whitespace-nowrap">
                    {formatTime(a.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
