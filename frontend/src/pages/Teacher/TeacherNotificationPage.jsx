import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  FiBell,
  FiCheckCircle,
  FiInfo,
  FiAlertCircle,
  FiClock,
  FiMapPin,
  FiBox,
  FiChevronRight
} from "react-icons/fi";

export default function TeacherNotificationPage() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const handleClick = async (n) => {
    try {
      if (!n.isRead) {
        await api.put(`/teacher/notifications/read/${n._id}`);
      }
      fetchData();
    } catch (err) {
      console.error("Read update failed", err);
    }
  };

  const fetchData = async () => {
    try {
      const res = await api.get("/teacher/notifications/");
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

  const markAllAsRead = async () => {
    try {
      const allIds = Object.values(data).flat().filter(n => !n.isRead).map(n => n._id);
      await Promise.all(allIds.map(id => api.put(`/teacher/notifications/read/${id}`)));
      fetchData();
    } catch (err) {
      console.error("Mark all failed", err);
    }
  };

  const formatMessage = (n) => {
    const d = n.updatedData;
    if (n.type === "CANCEL") {
      return (
        <p className="text-lg font-medium text-slate-700 leading-tight">
          Your <span className="font-black text-red-600">{d.subject}</span> lecture 
          ({d.startTime} – {d.endTime}) has been <span className="underline decoration-red-200">cancelled</span>.
        </p>
      );
    }

    return (
      <div className="space-y-3">
        <p className="text-lg font-medium text-slate-700 leading-tight">
          Your <span className="font-black text-indigo-600">{d.subject}</span> lecture has been updated:
        </p>
        <div className="flex flex-wrap gap-2">
          {d.startTime && (
            <span className="flex items-center gap-1.5 text-[11px] font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-100 uppercase tracking-tight">
              <FiClock size={14} /> {d.startTime} – {d.endTime}
            </span>
          )}
          {d.room && (
            <span className="flex items-center gap-1.5 text-[11px] font-bold bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-100 uppercase tracking-tight">
              <FiMapPin size={14} /> Room {d.room}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER SECTION - Same as Subjects Page */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex items-start gap-5">
            <div className="p-4 bg-gradient-to-br from-[#203871] to-[#3b5ba1] rounded-2xl text-white shadow-xl shadow-blue-900/20 transform -rotate-3 transition-transform duration-300 shrink-0">
              <FiBell size={32} strokeWidth={2.5} />
            </div>

            <div>
              <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em] mb-2">
                <FiCheckCircle className="animate-bounce" /> Real-time Alerts
              </div>
              <h1 className="text-4xl font-black text-[#203871] tracking-tight">
                Notifications
              </h1>
              <p className="text-slate-500 font-medium mt-1">
                Stay updated with your schedule changes
              </p>
            </div>
          </div>

          {/* {Object.keys(data).length > 0 && (
            <button
              onClick={markAllAsRead}
              className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 hover:bg-indigo-50 transition-colors group"
            >
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mark All As</p>
                <p className="text-sm font-black text-indigo-600">Read</p>
              </div>
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <FiCheckCircle size={20} />
              </div>
            </button>
          )} */}
        </div>

        {/* CONTENT AREA */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Checking for updates...</p>
          </div>
        ) : Object.keys(data).length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <FiBox size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-700">All caught up!</h3>
            <p className="text-slate-400 mt-2">No new notifications to show right now.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.keys(data).map((date) => (
              <div key={date} className="relative">
                {/* DATE BADGE */}
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 bg-white px-4 py-1.5 rounded-full border border-slate-100 shadow-sm">
                    {date === new Date().toDateString() ? "Today's Updates" : date}
                  </h3>
                  <div className="h-[1px] flex-grow bg-slate-200"></div>
                </div>

                {/* NOTIFICATION CARDS */}
                <div className="grid gap-4">
                  {data[date].map((n) => (
                    <div
                      key={n._id}
                      onClick={() => handleClick(n)}
                      className={`group relative bg-white rounded-[2rem] border transition-all duration-500 overflow-hidden flex flex-col cursor-pointer ${
                        !n.isRead 
                          ? "border-indigo-100 shadow-lg shadow-indigo-900/5 ring-1 ring-indigo-50" 
                          : "border-slate-100 opacity-75 grayscale-[0.5]"
                      } hover:shadow-xl hover:-translate-y-1`}
                    >
                      {/* Left Accent Strip */}
                      <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                        n.type === "CANCEL" ? "bg-red-500" : "bg-indigo-500"
                      }`}></div>

                      <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-grow">
                          <div className="flex items-center gap-3 mb-3">
                            {n.type === "CANCEL" ? (
                              <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100">
                                <FiAlertCircle size={12}/> Cancelled
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">
                                <FiInfo size={12}/> Schedule Update
                              </span>
                            )}
                            {!n.isRead && (
                              <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                            )}
                          </div>

                          <div className="transition-colors group-hover:text-indigo-600">
                            {formatMessage(n)}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="text-[11px] font-black text-slate-400 uppercase tracking-tighter bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                             By {n.updatedByRole}
                          </div>
                          <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                            <FiClock size={12} />
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </div>
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

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>
    </div>
  );
}