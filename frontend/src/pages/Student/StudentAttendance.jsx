import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import Topbar from "../../ui/Topbar";

import {
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle,
  FiActivity,
  FiArrowRight
} from "react-icons/fi";

export default function StudentAttendance() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/student/attendance")
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getStyle = (percent) => {
    if (percent >= 80) {
      return {
        bar: "bg-emerald-500",
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        icon: <FiCheckCircle className="text-emerald-500" />
      };
    }
    if (percent >= 65) {
      return {
        bar: "bg-amber-500",
        bg: "bg-amber-50",
        text: "text-amber-600",
        icon: <FiTrendingUp className="text-amber-500" />
      };
    }
    return {
      bar: "bg-rose-500",
      bg: "bg-rose-50",
      text: "text-rose-600",
      icon: <FiAlertCircle className="text-rose-500" />
    };
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF]">
      

      <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in font-sans">
        
        {/* ENHANCED HEADER CARD */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#203871] to-[#3b82f6] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-200 mb-12 group">
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full w-fit mb-4">
                <FiActivity className="text-blue-200" size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Live Tracking</span>
              </div>
              <h2 className="text-4xl font-black tracking-tighter">Attendance Overview</h2>
              <p className="text-blue-100/80 text-sm font-medium mt-2">
                Maintain at least <span className="text-white font-bold underline decoration-amber-400">75%</span> to stay in the safe zone.
              </p>
            </div>
            
            <div className="hidden md:block opacity-20 group-hover:opacity-40 transition-all duration-700 group-hover:rotate-12 scale-150">
               <FiActivity size={120} />
            </div>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-56 rounded-[2.5rem] bg-white border border-slate-100 animate-pulse p-8">
                <div className="h-6 bg-slate-100 rounded-lg w-2/3 mb-6"></div>
                <div className="h-4 bg-slate-50 rounded-lg w-1/2 mb-10"></div>
                <div className="h-3 bg-slate-100 rounded-full w-full"></div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && data.length === 0 && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-16 text-center shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
            <FiAlertCircle className="mx-auto text-5xl text-slate-200 mb-6" />
            <h3 className="text-2xl font-black text-[#203871] tracking-tight">No Records Found</h3>
            <p className="text-sm font-medium text-slate-500 mt-2">Attendance data is not available yet.</p>
          </div>
        )}

        {/* ATTENDANCE GRID */}
        {!loading && data.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.map(a => {
              const percent = Math.round((a.present / a.total) * 100);
              const style = getStyle(percent);

              return (
                <div
                  key={a.subject}
                  onClick={() => navigate(`/student/attendance/${a.subject}`)}
                  className="group bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 cursor-pointer relative overflow-hidden"
                >
                  <div className="relative z-10">
                    {/* Top Row */}
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="text-xl font-black text-[#203871] tracking-tight group-hover:text-blue-600 transition-colors leading-tight max-w-[80%]">
                        {a.subject}
                      </h4>
                      <div className={`p-2 rounded-xl ${style.bg} transition-transform duration-500 group-hover:scale-110`}>
                        {style.icon}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-3xl font-black text-[#203871]">{percent}%</span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">Attendance</span>
                    </div>

                    {/* Numbers Badge */}
                    <div className="flex items-center gap-2 mb-8">
                      <div className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Sessions: {a.present} / {a.total}
                      </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="space-y-3">
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${style.bar}`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        {percent < 75 ? (
                          <span className="flex items-center gap-1.5 text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-1 rounded-md">
                            <FiAlertCircle size={12} /> Critical Zone
                          </span>
                        ) : (
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Safe Status</span>
                        )}
                        
                        <div className="flex items-center gap-1 text-blue-600 font-black text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
                          Details <FiArrowRight />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}