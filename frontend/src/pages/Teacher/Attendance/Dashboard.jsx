import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import {
  FiCalendar,
  FiCheckSquare,
  FiClock,
  FiBarChart2,
  FiActivity,
  FiLayers,
  FiTarget,
  FiTrendingUp
} from "react-icons/fi";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLectures: 0,
    totalPresent: 0,
    totalAbsent: 0,
    percentage: 0,
    todayTotal: 0,
    todayCompleted: 0,
    todayPending: 0,
    classPerformance: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/teacher/attendance/stats");
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F4FF]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-4 md:p-8 animate-fade-in font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* TOP HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-[0.2em] mb-2">
              <FiActivity className="animate-pulse" /> System Analytics
            </div>
            <h1 className="text-4xl font-black text-[#1E3A8A] tracking-tight">Attendance Hub</h1>
            <p className="text-blue-400 font-medium mt-1">Real-time tracking & performance insights</p>
          </div>
          
          {/* Glassmorphism Score Card */}
          <div className="bg-white/60 backdrop-blur-md px-8 py-4 rounded-[2rem] border border-white shadow-xl shadow-blue-900/5 flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Efficiency</p>
              <p className="text-2xl font-black text-[#1E3A8A]">{stats.percentage}%</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <FiTarget size={28} />
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS - Soft Gradient Border */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { title: "Today's Schedule", desc: "Upcoming lectures", icon: <FiCalendar />, path: "/teacher/attendance/today", color: "from-blue-400 to-blue-600" },
            { title: "Take Attendance", desc: "Mark now", icon: <FiCheckSquare />, path: "/teacher/attendance/today", color: "from-emerald-400 to-emerald-600" },
            { title: "View History", desc: "Past logs", icon: <FiClock />, path: "/teacher/attendance/history", color: "from-violet-400 to-violet-600" },
            { title: "Reports", desc: "Detailed analysis", icon: <FiBarChart2 />, path: "/teacher/attendance/analysis", color: "from-sky-400 to-sky-600" }
          ].map((action, i) => (
            <div 
              key={i}
              onClick={() => navigate(action.path)}
              className="group cursor-pointer bg-white p-6 rounded-[2.5rem] border border-blue-50/50 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden relative"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} text-white flex items-center justify-center mb-6 shadow-lg shadow-blue-200 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                {action.icon}
              </div>
              <h4 className="text-lg font-bold text-[#1E3A8A] mb-1">{action.title}</h4>
              <p className="text-slate-400 text-xs font-medium">{action.desc}</p>
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <FiLayers size={80} />
              </div>
            </div>
          ))}
        </div>

        {/* STATS TILES - Colors matching theme */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Sessions", value: stats.totalLectures, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Present Count", value: stats.totalPresent, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Absent Count", value: stats.totalAbsent, color: "text-rose-500", bg: "bg-rose-50" },
            { label: "Overall Rate", value: stats.percentage + "%", color: "text-indigo-600", bg: "bg-indigo-50" }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-sm flex flex-col items-center text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</span>
              <span className={`text-4xl font-black ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* BOTTOM ANALYTICS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* TODAY STATUS CARD */}
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-blue-50">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-bold text-[#1E3A8A]">Today Status</h3>
               <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-tighter">Live Tracker</span>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
               <div className="p-6 rounded-[2rem] bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex flex-col items-center">
                  <span className="text-3xl font-black text-blue-600">{stats.todayCompleted}/{stats.todayTotal}</span>
                  <span className="text-[10px] font-bold text-blue-400 uppercase mt-1">Lectures Done</span>
               </div>
               <div className="p-6 rounded-[2rem] bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100 flex flex-col items-center">
                  <span className="text-3xl font-black text-rose-500">{stats.todayPending}</span>
                  <span className="text-[10px] font-bold text-rose-400 uppercase mt-1">Pending</span>
               </div>
            </div>
          </div>

          {/* PERFORMANCE CARD */}
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-blue-50">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-bold text-[#1E3A8A]">Class Comparison</h3>
               <FiTrendingUp className="text-blue-400" size={24} />
            </div>
            
            <div className="space-y-6">
               {stats.classPerformance.map((c, i) => (
                 <div key={i} className="group">
                    <div className="flex justify-between text-sm font-bold text-slate-600 mb-2">
                       <span>{c.class}</span>
                       <span className="text-blue-600">{c.percent}%</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000 group-hover:brightness-110" 
                         style={{ width: `${c.percent}%` }}
                       ></div>
                    </div>
                 </div>
               ))}
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>
    </div>
  );
}