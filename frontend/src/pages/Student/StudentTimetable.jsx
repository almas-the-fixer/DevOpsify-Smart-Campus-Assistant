import { useEffect, useState } from "react";
import api from "../../api/axios";
import Topbar from "../../ui/Topbar";

import {
  FiClock,
  FiMapPin,
  FiUser,
  FiPlayCircle,
  FiArrowRightCircle,
  FiCalendar
} from "react-icons/fi";

export default function StudentTimetable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   api.get(`/student/timetable?ts=${Date.now()}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
        console.log(res.data)
      })
      .catch(() => setLoading(false));
  }, []);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = days[new Date().getDay()];

  const toMinutes = (time) => {
    if (!time) return 0;
    let [h, m] = time.split(":").map(Number);
    if (h >= 1 && h <= 6) h += 12;
    return h * 60 + m;
  };

  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  const grouped = data.reduce((acc, cur) => {
    acc[cur.day] = acc[cur.day] || [];
    acc[cur.day].push(cur);
    return acc;
  }, {});

  const sortedDays = Object.keys(grouped).sort((a, b) => {
    const todayIndex = days.indexOf(today);
    const aIndex = days.indexOf(a);
    const bIndex = days.indexOf(b);
    return ((aIndex - todayIndex + 7) % 7) - ((bIndex - todayIndex + 7) % 7);
  });

  const getStatus = (cls) => {
    if (cls.day !== today) return "future";
    const start = toMinutes(cls.startTime);
    const end = toMinutes(cls.endTime);
    if (nowMinutes >= start && nowMinutes <= end) return "ongoing";
    if (nowMinutes < start) return "next";
    return "past";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF]">


      <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in font-sans">
        
        {/* UPDATED THEME HEADER (Matching Attendance/Materials) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#203871] to-[#3b82f6] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-200 mb-12 group">
          <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-white/10 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-110"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full w-fit mb-4">
              <FiCalendar className="text-blue-200" size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-50">Academic Pulse</span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter">Weekly Schedule</h2>
            <p className="text-blue-100/80 text-sm font-medium mt-2 max-w-md">
              Your intelligent class tracker. <span className="text-white font-bold">Live status</span> updates based on current lecture timings.
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-sm font-black text-blue-600 uppercase tracking-widest">Syncing Schedule...</p>
          </div>
        )}

        {!loading && data.length === 0 && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-16 text-center shadow-lg">
            <p className="text-slate-500 font-bold uppercase tracking-widest">No classes scheduled yet.</p>
          </div>
        )}

        {!loading && data.length > 0 && (
          <div className="space-y-16">
            {sortedDays.map(day => (
              <div key={day} className="relative">
                {/* DAY SECTION HEADER */}
                <div className="flex items-center gap-4 mb-8">
                  <h3 className="text-2xl font-black text-[#1E1B4B] tracking-tight flex items-center gap-3">
                    {day}
                    {day === today && (
                      <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white px-3 py-1 rounded-full animate-pulse">
                        Today
                      </span>
                    )}
                  </h3>
                  <div className="flex-1 h-px bg-slate-200"></div>
                </div>

                {/* CLASSES GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {grouped[day]
                    .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))
                    .map(t => {
  const status = getStatus(t);
  
if (t.isCancelled) {
  return (
    <div
      key={t._id}
      className="bg-red-50 border border-red-200 rounded-[2rem] p-8 opacity-80 relative"
    >
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">
                            {t.subjectType}
                          </p>
      <div className="absolute  top-9  -translate-x-1/2 right-28 text-[10px] font-bold text-white bg-red-500 px-3 py-1 rounded-full">
        Cancelled
      </div>


      <h4 className="text-xl font-black text-[#1E1B4B] tracking-tight group-hover:text-blue-600 transition-colors mb-6 leading-tight">
                            {t.subject}
                          </h4>

                          <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm font-bold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <FiClock className="text-blue-500 shrink-0" />
                              {t.startTime} - {t.endTime}
                            </div>

                            <div className="flex items-center gap-3 text-sm font-bold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <FiMapPin className="text-emerald-500 shrink-0" />
                              Room: <span className="text-[#1E1B4B]">{t.room}</span>
                            </div>

                            <div className="flex items-center gap-3 text-sm font-bold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <FiUser className="text-amber-500 shrink-0" />
                              Prof: <span className="text-[#1E1B4B]">{t.teacherName}</span>
                            </div>
                          </div>


      <p className="text-lg font-bold text-red-500 ml-5 mt-5">
        Reason: {t.reason || "Not specified"}
      </p>
    </div>
  );
}
                      
                      return (
                        <div
                          key={t._id}
                          className={`
                            group relative bg-white rounded-[2rem] p-8 border transition-all duration-500
                            ${status === "ongoing" 
                               ? "border-emerald-400 shadow-xl shadow-emerald-500/10 -translate-y-2 ring-1 ring-emerald-500" 
                               : "border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1"}
                            ${status === "past" && "opacity-60 grayscale-[0.5]"}
                          `}
                        >
                          {/* LIVE INDICATOR */}
                          {status === "ongoing" && (
                            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest animate-bounce">
                              <FiPlayCircle size={12} /> Live Now
                            </div>
                          )}
                          {status === "next" && (
                            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                              <FiArrowRightCircle size={12} /> Next Up
                            </div>
                          )}

                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">
                            {t.subjectType}
                          </p>
{t.isUpdated && (
  <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 text-white text-[10px] font-bold rounded-full shadow-md">
    Updated
  </div>
)}
                          <h4 className="text-xl font-black text-[#1E1B4B] tracking-tight group-hover:text-blue-600 transition-colors mb-6 leading-tight">
                            {t.subject}
                          </h4>

                          <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm font-bold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <FiClock className="text-blue-500 shrink-0" />
                              {t.startTime} - {t.endTime}
                            </div>

                            <div className="flex items-center gap-3 text-sm font-bold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <FiMapPin className="text-emerald-500 shrink-0" />
                              Room: <span className="text-[#1E1B4B]">{t.room}</span>
                            </div>

                            <div className="flex items-center gap-3 text-sm font-bold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <FiUser className="text-amber-500 shrink-0" />
                              Prof: <span className="text-[#1E1B4B]">{t.teacherName}</span>
                            </div>
                          </div>

                          <div className={`mt-6 h-1 w-1/4 rounded-full transition-all duration-500 group-hover:w-full ${status === 'ongoing' ? 'bg-emerald-500' : 'bg-blue-600/20'}`}></div>
                        </div>
                      );
                    })}
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