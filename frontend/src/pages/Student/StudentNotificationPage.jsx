import { useEffect, useState } from "react";
import api from "../../api/axios";
import Topbar from "../../ui/Topbar"; // Added Topbar for consistency
import {
  FiBell,
  FiCheckCircle,
  FiInfo,
  FiAlertCircle,
  FiClock,
  FiMapPin,
  FiCalendar
} from "react-icons/fi";

export default function StudentNotificationPage() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/student/notifications/");
      const grouped = res.data.reduce((acc, item) => {
        const date = new Date(item.createdAt).toDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
      }, {});
      setData(grouped);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async (n) => {
    try {
      if (!n.isRead) {
        await api.put(`/student/read/${n._id}`);
      }
      fetchData();
    } catch (err) {
      console.error("Read update failed", err);
    }
  };

  const formatMessage = (n) => {
    const d = n.updatedData;
    if (n.type === "CANCEL") {
      return (
        <p className="text-slate-700 leading-relaxed">
          Your <span className="font-black text-red-600">{d.subject}</span> lecture 
          <span className="mx-1 font-bold">({d.startTime} – {d.endTime})</span> has been cancelled.
        </p>
      );
    }

    return (
      <div className="space-y-3">
        <p className="text-slate-700 leading-relaxed">
          Your <span className="font-black text-blue-600">{d.subject}</span> lecture has been updated:
        </p>
        <div className="flex flex-wrap gap-2">
          {d.startTime && (
            <span className="flex items-center gap-1.5 text-[11px] font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-100">
              <FiClock size={14} /> {d.startTime} – {d.endTime}
            </span>
          )}
          {d.room && (
            <span className="flex items-center gap-1.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100">
              <FiMapPin size={14} /> Room {d.room}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF]">
      <div className="max-w-4xl mx-auto px-6 py-10 animate-fade-in font-sans">
        
        {/* HEADER THEME (Matched to Timetable) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1E1B4B] to-[#3b82f6] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-200 mb-12 group">
          <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-white/10 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-110"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full w-fit mb-4">
              <FiBell className="text-blue-200" size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-50">Notifications</span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter">Activity Center</h2>
            <p className="text-blue-100/80 text-sm font-medium mt-2 max-w-md">
              Real-time alerts for your <span className="text-white font-bold">academic schedule</span>. Never miss a change in your lectures.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-sm font-black text-blue-600 uppercase tracking-widest">Fetching Updates...</p>
          </div>
        ) : Object.keys(data).length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-16 text-center shadow-lg">
            <FiBell className="mx-auto text-4xl text-slate-200 mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">All caught up! No new alerts.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.keys(data).map((date) => (
              <div key={date} className="relative">
                {/* DATE SECTION HEADER */}
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-lg font-black text-[#1E1B4B] tracking-tight flex items-center gap-3">
                    <FiCalendar className="text-blue-500" />
                    {date === new Date().toDateString() ? "Today's Updates" : date}
                  </h3>
                  <div className="flex-1 h-px bg-slate-200"></div>
                </div>

                {/* NOTIFICATION CARDS */}
                <div className="space-y-4">
                  {data[date].map((n) => (
                    <div
                      key={n._id}
                      onClick={() => handleClick(n)}
                      className={`
                        relative group p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer
                        ${!n.isRead 
                          ? "bg-white border-blue-200 shadow-xl shadow-blue-500/5 -translate-y-1 ring-1 ring-blue-100" 
                          : "bg-white/50 border-slate-100 opacity-75 hover:opacity-100 hover:shadow-md"
                        }
                      `}
                    >
                      {/* UNREAD INDICATOR */}
                      {!n.isRead && (
                        <div className="absolute top-6 right-6 w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse shadow-lg shadow-blue-400"></div>
                      )}

                      <div className="flex flex-col gap-4">
                        {/* TAG */}
                        <div className="flex items-center gap-2">
                          {n.type === "CANCEL" ? (
                            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-600 px-3 py-1 rounded-full">
                              <FiAlertCircle size={12}/> Cancelled
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white px-3 py-1 rounded-full">
                              <FiInfo size={12}/> Schedule Update
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-auto">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* CONTENT */}
                        <div className={`text-base ${!n.isRead ? "font-semibold text-slate-900" : "font-medium text-slate-600"}`}>
                          {formatMessage(n)}
                        </div>

                        {/* FOOTER */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                          <span className="text-[10px] font-black text-blue-600/60 uppercase tracking-[0.2em]">
                            Div: {n.updatedData.division}
                          </span>
                          {!n.isRead && (
                            <span className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to mark read →
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}