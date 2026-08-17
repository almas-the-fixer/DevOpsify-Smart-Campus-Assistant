// src/pages/Notifications.jsx

import { useEffect, useState } from "react";
import axios from "../../api/axios";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("/notifications/my");
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // 🔥 Message Formatter
  const renderMessage = (n) => {
    if (n.type === "CANCELLED") {
      return (
        <>
          <h4 className="font-semibold text-red-600">
            {n.subject} Cancelled
          </h4>
          <p className="text-sm text-gray-600">
            {n.startTime} - {n.endTime}
          </p>
          <p className="text-sm text-gray-600">
            Room: {n.room}
          </p>
          {n.reason && (
            <p className="text-sm text-red-500">
              Reason: {n.reason}
            </p>
          )}
        </>
      );
    }

    if (n.type === "UPDATED") {
      return (
        <>
          <h4 className="font-semibold text-yellow-600">
            {n.subject} Updated
          </h4>
          <p className="text-sm text-gray-600">
            {n.startTime} - {n.endTime}
          </p>
          <p className="text-sm text-gray-600">
            Room: {n.room}
          </p>
        </>
      );
    }

    return <p>{n.message}</p>;
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>

      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className="bg-white shadow-md rounded-lg p-4 border"
            >
              {renderMessage(n)}

              <p className="text-xs text-gray-400 mt-2">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}