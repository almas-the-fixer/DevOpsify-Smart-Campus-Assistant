import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { 
  FiUsers, FiUserCheck, FiUserX, FiBookOpen, 
  FiTrendingUp, FiUpload, FiCalendar, FiActivity, FiArrowRight, FiShield 
} from "react-icons/fi";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/dashboard-stats");
        setStats(res.data);
      } catch (err) {
        console.error("Dashboard stats error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="w-10 h-10 border-4 border-[#203871] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const todayDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long"
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* --- PREMIUM WELCOME BANNER --- */}
        <div className="relative overflow-hidden bg-[#203871] rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-blue-900/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-52 h-52 bg-blue-400/10 rounded-full -ml-20 -mb-20 blur-2xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-tr from-lightblue-400 to-blue-500 rounded-3xl flex items-center justify-center text-3xl shadow-inner border border-white/20">
                <FiShield />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-amber-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-amber-400/30 text-amber-200">
                    System Control Panel
                  </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight mt-1">
                   Admin <span className="text-blue-300">Analytics</span>
                </h2>
                <p className="text-blue-100/70 mt-2 font-medium flex items-center gap-2">
                  <FiCalendar /> {todayDate}
                </p>
              </div>
              <button
  onClick={() => navigate("/admin/announcementdashboard")}
  className="mt-4 bg-white text-[#203871] font-bold px-5 py-2 rounded-xl shadow hover:scale-105 transition"
>
  Create Announcement
</button>
            </div>

            <div className="hidden lg:block bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10">
               <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-2">Server Status</p>
               <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                     <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-[#203871] flex items-center justify-center text-[10px] font-bold">API</div>
                     <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-[#203871] flex items-center justify-center text-[10px] font-bold">DB</div>
                  </div>
                  <span className="text-sm font-bold flex items-center gap-2">
                     <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> Systems Online
                  </span>
               </div>
            </div>
          </div>
        </div>

        {/* --- MAIN STATS SECTION --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Users" value={stats?.totalUsers} icon={<FiUsers />} color="blue" />
          <StatCard title="Active Students" value={stats?.students} icon={<FiUserCheck />} color="emerald" />
          <StatCard title="Faculty" value={stats?.teachers} icon={<FiBookOpen />} color="indigo" />
          <StatCard title="Restricted" value={stats?.blocked} icon={<FiUserX />} color="rose" />
        </div>

        {/* --- PERFORMANCE INSIGHTS --- */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Live Performance</h3>
            <div className="h-[1px] flex-1 bg-slate-200"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div 
              className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col md:flex-row items-center justify-around gap-8"
              onClick={() => navigate("/admin/today-attendance")}
            >
               <div className="text-center">
                  <p className="text-slate-400 text-[10px] font-black uppercase mb-2">Today's Attendance</p>
                  <h4 className="text-4xl font-black text-[#203871]">{stats?.analytics?.today?.taken || 0} <span className="text-lg text-slate-300">/ {stats?.analytics?.today?.total || 0}</span></h4>
                  <p className="text-xs font-medium text-slate-500 mt-2">Lectures Conducted</p>
               </div>
               <div className="h-16 w-[1px] bg-slate-100 hidden md:block"></div>
               <div className="text-center">
                  <p className="text-slate-400 text-[10px] font-black uppercase mb-2">Completion Rate</p>
                  <div className="flex items-center justify-center gap-3">
                    <h4 className="text-4xl font-black text-emerald-500">{stats?.analytics?.today?.completionRate || 0}%</h4>
                    <FiTrendingUp className="text-emerald-500 text-xl" />
                  </div>
                  <p className="text-xs font-medium text-emerald-600 mt-2">Above Target</p>
               </div>
            </div>

            <div className="bg-[#203871] p-8 rounded-[2.5rem] text-white flex flex-col justify-center relative overflow-hidden">
               <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                      <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Active Staff</span>
                      <FiActivity className="text-blue-400 animate-pulse" />
                  </div>
                  <div className="flex gap-4">
                      <div className="flex-1 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 text-center">
                        <p className="text-blue-200 text-[10px] uppercase font-bold">Active</p>
                        <p className="text-2xl font-black">{stats?.analytics?.activeTeachers || 0}</p>
                      </div>
                      <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                        <p className="text-blue-200 text-[10px] uppercase font-bold">Inactive</p>
                        <p className="text-2xl font-black text-blue-400/50">{stats?.analytics?.inactiveTeachers || 0}</p>
                      </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* --- MANAGEMENT TOOLS --- */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Management Tools</h3>
            <div className="h-[1px] flex-1 bg-slate-200"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ActionCard 
              title="Bulk User Upload" 
              desc="Import multiple students/staff via CSV" 
              icon={<FiUpload />} 
              onClick={() => navigate("/admin/bulk-upload")}
              color="blue"
            />
            <ActionCard 
              title="Schedule Timetable" 
              desc="Configure class timings & subjects" 
              icon={<FiCalendar />} 
              onClick={() => navigate("/admin/upload-timetable")}
              color="indigo"
            />
            <ActionCard 
              title="System Audit Logs" 
              desc="Monitor security & user activities" 
              icon={<FiActivity />} 
              onClick={() => navigate("/admin/logs")}
              color="amber"
            />
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

/* --- REUSABLE COMPONENTS --- */

function StatCard({ title, value, icon, color }) {
  const themes = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
    rose: "text-rose-600 bg-rose-50 border-rose-100",
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-lg transition-all duration-300">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border transition-transform duration-500 hover:rotate-12 ${themes[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{title}</p>
        <h4 className="text-2xl font-black text-slate-800">{value || 0}</h4>
      </div>
    </div>
  );
}

function ActionCard({ title, desc, icon, onClick, color }) {
  const themes = {
    blue: "group-hover:bg-blue-600",
    indigo: "group-hover:bg-indigo-600",
    amber: "group-hover:bg-amber-600",
  };

  return (
    <div 
      onClick={onClick}
      className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 cursor-pointer relative overflow-hidden flex flex-col h-full"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border border-slate-100 bg-slate-50 text-slate-500 transition-all duration-500 mb-6 ${themes[color]} group-hover:text-white group-hover:border-transparent group-hover:rotate-[15deg]`}>
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="text-xl font-black text-slate-800 mb-2 group-hover:text-[#203871] transition-colors">{title}</h4>
        <p className="text-slate-500 text-sm font-medium leading-relaxed">{desc}</p>
      </div>
      <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-all">
        Launch System <FiArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
      </div>
    </div>
  );
}