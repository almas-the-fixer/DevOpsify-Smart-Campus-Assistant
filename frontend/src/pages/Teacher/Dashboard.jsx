import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "../../utils/axiosInstance";
import {
  FiBookOpen,
  FiEdit3,
  FiBarChart2,
  FiUser,
  FiArrowRight,
  FiMapPin,
  FiCalendar
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../../pages/Teacher/NotificationBell";
import TeacherAnnouncementBell from "./TeacherAnnouncementBell";
export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth(); // Auth context se user le rahe hain
  const [loading, setLoading] = useState(!user); // Agar context mein user nahi hai toh loading true

  // --- API FETCH LOGIC (Same as Profile) ---
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const res = await axios.get("/users/me");
        setUser(res.data); // Global user state update
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!user || user.role !== 'teacher') {
      fetchTeacherData();
    }
  }, [setUser, user]);

  // Loading state with a clean spinner
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="w-10 h-10 border-4 border-[#203871] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const teacherName = user?.name || "Professor";
  const initials = teacherName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* WELCOME BANNER */}
        <div className="relative overflow-hidden bg-[#203871] rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-blue-900/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>

<div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
  
  {/* LEFT SIDE */}
  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
    
    <div className="w-20 h-20 bg-gradient-to-tr from-blue-400 to-indigo-500 rounded-3xl flex items-center justify-center text-3xl font-black shadow-inner border border-white/20">
      {initials}
    </div>

    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="px-3 py-1 bg-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-blue-400/30">
          Faculty Portal
        </span>
      </div>

      <p className="text-blue-100 text-lg font-medium opacity-80">
        Welcome back,
      </p>

      <h2 className="text-3xl md:text-5xl font-black tracking-tight mt-1 truncate max-w-[300px] md:max-w-full">
        {teacherName}
      </h2>

      <div className="flex flex-wrap items-center gap-4 mt-6 text-blue-200/80 text-sm font-medium">
        <span className="flex items-center gap-1.5">
          <FiMapPin /> LJ University
        </span>

        <span className="hidden md:block w-1 h-1 bg-blue-400 rounded-full"></span>

        <span className="flex items-center gap-1.5">
          <FiCalendar /> Academic Year 2026
        </span>
      </div>
    </div>
  </div>

  {/* RIGHT SIDE (Bell + Status) */}
  <div className="flex items-center gap-6">

{/* Teacher Announcement Bell */}

<div className="bg-white/15  rounded-2xl hover:scale-110 transition">

<TeacherAnnouncementBell />

</div>
    {/* 🔔 Notification Bell */}
    <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-lg hover:scale-105 transition">
      <NotificationBell />
    </div>

    {/* Account Status */}
    <div className="hidden lg:block border-l border-white/10 pl-6">
      <div className="bg-white/5 backdrop-blur-sm p-4 rounded-3xl border border-white/10">
        <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">
          Account Status
        </p>
        <p className="text-xl font-bold flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          Verified Faculty
        </p>
      </div>
    </div>

  </div>
</div>
        </div>

        {/* SECTION TITLE */}
        <div className="flex items-center gap-4 px-2">
           <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Quick Navigation</h3>
           <div className="h-[1px] flex-1 bg-slate-200"></div>
        </div>

        {/* NAVIGATION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MenuCard 
            title="Subjects"
            desc="View assigned subjects & classes"
            icon={<FiBookOpen />}
            color="blue"
            onClick={() => navigate("/teacher/subjects")}
          />
          <MenuCard 
            title="Attendance"
            desc="Mark attendance for lectures"
            icon={<FiEdit3 />}
            color="emerald"
            onClick={() => navigate("/teacher/attendance")}
          />
          <MenuCard 
            title="Records"
            desc="Check past attendance logs"
            icon={<FiBarChart2 />}
            color="indigo"
            onClick={() => navigate("/teacher/ViewAttendance")}
          />
          <MenuCard 
            title="Profile"
            desc="Update your personal details"
            icon={<FiUser />}
            color="amber"
            onClick={() => navigate("/teacher/profile")}
          />
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

function MenuCard({ title, desc, icon, color, onClick }) {
  const themes = {
    blue: "text-blue-600 bg-blue-50 border-blue-100 group-hover:bg-blue-600",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100 group-hover:bg-emerald-600",
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100 group-hover:bg-indigo-600",
    amber: "text-amber-600 bg-amber-50 border-amber-100 group-hover:bg-amber-600",
  };

  return (
    <div 
      onClick={onClick}
      className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 cursor-pointer relative overflow-hidden flex flex-col h-full"
    >
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity ${themes[color].split(' ')[1]}`}></div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border transition-all duration-500 mb-6 
        ${themes[color].split(' ').slice(0,3).join(' ')} group-hover:text-white group-hover:border-transparent group-hover:rotate-[15deg]`}>
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="text-xl font-black text-slate-800 mb-2 group-hover:text-blue-700 transition-colors">{title}</h4>
        <p className="text-slate-500 text-sm font-medium leading-relaxed">{desc}</p>
      </div>
      <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-all">
        Launch Module <FiArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
      </div>
    </div>
  );
}