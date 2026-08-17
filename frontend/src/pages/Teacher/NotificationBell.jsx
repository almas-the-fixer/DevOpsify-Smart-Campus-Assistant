import { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import { FiBell } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function StudentNotificationBell() {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  const fetchCount = async () => {
    const res = await axios.get("/teacher/notifications/unread-count");
    setCount(res.data.count);
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative cursor-pointer"
      onClick={() => navigate("/teacher/notifications")}
    >
      <FiBell size={22} className="text-white" />

      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full animate-pulse">
          {count}
        </span>
      )}
    </div>
  );
}