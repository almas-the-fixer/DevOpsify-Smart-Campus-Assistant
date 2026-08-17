import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  FiTrendingUp,
  FiBookOpen,
  FiClock,
  FiAlertTriangle,
  FiDatabase,
  FiArrowRight,
  FiActivity,
  FiCalendar,
  FiLayers
} from "react-icons/fi";

export default function AdminAttendance() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/attendance-stats");
      setStats(res.data);
    } catch (err) {
      console.error("Stats error", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-10 h-10 border-4 border-[#203871] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* --- PREMIUM HEADER BANNER --- */}
        <div className="relative overflow-hidden bg-[#203871] rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-blue-900/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl border border-white/20 shadow-xl">
                <FiActivity className="text-blue-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-3 py-0.5 bg-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-400/30 text-emerald-300">
                    Live Analytics
                  </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight">
                  Attendance <span className="text-blue-300">Intelligence</span>
                </h2>
                <p className="text-blue-100/60 mt-2 font-medium italic">Real-time monitoring and administrative oversight.</p>
              </div>
            </div>

            <div className="hidden lg:flex bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 items-center gap-4">
               <div className="text-right">
                  <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest">Data Refresh</p>
                  <p className="text-xs font-bold text-white uppercase tracking-tighter">System Synchronized</p>
               </div>
               <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Avg. Attendance" 
            value={`${stats?.overallAttendance}%`} 
            icon={<FiTrendingUp />} 
            color="emerald" 
          />
          <StatCard 
            title="Active Subjects" 
            value={stats?.activeSubjects} 
            icon={<FiBookOpen />} 
            color="blue" 
          />
          <StatCard 
            title="Total Lectures" 
            value={stats?.totalLectures} 
            icon={<FiClock />} 
            color="indigo" 
          />
          <StatCard 
            title="Low Attendance" 
            value={stats?.lowAttendanceSessions} 
            icon={<FiAlertTriangle />} 
            color="rose" 
          />
        </div>

        {/* --- OPERATIONS SECTION --- */}
        <div className="space-y-8">
          <div className="flex items-center gap-4 px-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Core Operations</h3>
            <div className="h-[1px] flex-1 bg-slate-200"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Detailed Records Card */}
            <div
              onClick={() => navigate("/admin/attendance/records")}
              className="group relative bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-full"
            >
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-50 rounded-full group-hover:scale-[3] transition-transform duration-700 -z-0"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-[#203871]/5 text-[#203871] rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:bg-[#203871] group-hover:text-white transition-all duration-500 group-hover:rotate-12 shadow-inner">
                  <FiDatabase />
                </div>

                <h4 className="text-2xl font-black text-slate-800 mb-3">Detailed Records</h4>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Deep dive into subject-wise data, audit student logs, and explore historical archives.
                </p>
                
                <div className="mt-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#203871]">
                  Launch Database <FiArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </div>

            {/* Placeholder for other future tools */}
            {/* <div className="bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-10 text-center text-slate-400">
               <FiLayers className="text-4xl mb-4 opacity-30" />
               <p className="text-[10px] font-black uppercase tracking-widest">More Analytics Tools Coming Soon</p>
            </div> */}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>
    </div>
  );
}

/* --- REUSABLE STAT CARD --- */
function StatCard({ title, value, icon, color }) {
  const themes = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
    rose: "text-rose-600 bg-rose-50 border-rose-100",
  };

  return (
    <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 hover:shadow-xl transition-all duration-300 group">
      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl border transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${themes[color]} shadow-inner`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1">{title}</p>
        <h4 className="text-3xl font-black text-slate-800 tracking-tight">{value || 0}</h4>
      </div>
    </div>
  );
}