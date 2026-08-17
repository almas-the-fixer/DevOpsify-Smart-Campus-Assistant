import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios"; // <--- Yeh check karein ki path sahi hai
import Topbar from "../../ui/Topbar";
import { 
  FiCalendar, FiBook, FiCheckSquare, FiUser, 
  FiArrowRight, FiStar, FiHash 
} from "react-icons/fi";
import StudentAnnouncementBanner from "./StudentAnnouncementBell";
import StudentNotificationBell from "./StudentNotificationBell";
export default function StudentDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API call to get current user data
    api.get("/users/me") 
      .then(res => {
        // Debugging ke liye: Browser console mein check karein data aa raha hai ya nahi
        console.log("Dashboard Data:", res.data);

        // Aksar backend data ko { user: {...} } mein lapet kar bhejta hai
        const userData = res.data.user || res.data;
        setProfile(userData);
      })
      .catch(err => {
        console.error("Dashboard Fetch Error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFF]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-blue-600 font-black text-[10px] uppercase tracking-widest animate-pulse">
            Syncing Student Node...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFF]">
      

      <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in font-sans">
        
        {/* WELCOME HERO CARD */}
        <div className="relative overflow-visible bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#3B82F6] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-200 mb-12 group">  <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
          
<div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">

  {/* LEFT SIDE */}
  <div className="space-y-4">
    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full w-fit">
      <FiStar className="text-yellow-300 fill-yellow-300" size={12} />
      <span className="text-[10px] font-black uppercase tracking-widest">Portal Active</span>
    </div>
    
    <div>
      <p className="text-blue-100 text-sm font-medium opacity-80 uppercase tracking-wider">Welcome Back,</p>
      <h2 className="text-5xl font-black tracking-tighter mt-1 drop-shadow-sm">
        {profile?.name || "Student"}
      </h2>
    </div>
    
    <div className="flex flex-wrap items-center gap-3 pt-2">
      <Badge label="Semester" value={profile?.semester} />
      <Badge label="Division" value={profile?.division} />
      <Badge icon={<FiHash />} label="Roll No" value={profile?.rollNo} />
    </div>
  </div>
  

  {/* RIGHT SIDE (Bell + Icon) */}
  <div className="flex items-center gap-4 relative z-[999]">

  {/* Announcement Bell */}
  <div className="bg-white/15 rounded-2xl transition  ">
  <StudentAnnouncementBanner
    semester={profile?.semester}
    division={profile?.division}
  />
  </div>
    {/* 🔔 Notification Bell */}
    <div className="bg-white/15 backdrop-blur-md p-3 rounded-2xl border border-white/30 shadow-lg hover:scale-110 transition">
      <StudentNotificationBell />
    </div>

    {/* BIG ICON */}
    <div className="hidden md:block opacity-20 group-hover:opacity-40 transition-all duration-700 scale-110 group-hover:rotate-6 group-hover:scale-125">
      <FiUser size={180} />
    </div>

  </div>
</div>
        </div>

        {/* SECTION HEADER */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="h-6 w-1 bg-blue-600 rounded-full"></div>
            <h3 className="text-xl font-black text-[#1E3A8A] tracking-tight uppercase">Quick Navigation</h3>
          </div>
          <div className="h-px flex-1 bg-slate-100 mx-6 hidden sm:block"></div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">v2.0 Stable</span>
        </div>

        {/* NAVIGATION CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <NavCard
            icon={<FiBook />}
            title="Subjects"
            desc="Academic curriculum"
            color="bg-violet-50 text-violet-600"
            onClick={() => navigate("/student/subjects")}
          />

          <NavCard
            icon={<FiCheckSquare />}
            title="Attendance"
            desc="Presence analytics"
            color="bg-emerald-50 text-emerald-600"
            onClick={() => navigate("/student/attendance")}
          />

          <NavCard
            icon={<FiCalendar />}
            title="Timetable"
            desc="Schedule & events"
            color="bg-blue-50 text-blue-600"
            onClick={() => navigate("/student/timetable")}
          />

          <NavCard
            icon={<FiUser />}
            title="My Profile"
            desc="Settings & security"
            color="bg-orange-50 text-orange-600"
            onClick={() => navigate("/student/profile")}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}

/* --- Reusable Sub-Components --- */

function Badge({ label, value, icon }) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl flex items-center gap-2 group/badge hover:bg-white/20 transition-all cursor-default">
      {icon && <span className="opacity-60 group-hover/badge:scale-110 transition-transform">{icon}</span>}
      <div className="flex flex-col">
        <span className="text-[8px] uppercase font-black opacity-60 leading-none mb-0.5">{label}</span>
        <span className="text-base font-bold leading-none">{value ?? '--'}</span>
      </div>
    </div>
  );
}

function NavCard({ icon, title, desc, onClick, color }) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-[2.5rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-slate-100 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
    >
      {/* Hover Background Blob */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 rounded-full scale-0 group-hover:scale-150 transition-transform duration-700"></div>
      
      <div className={`relative z-10 w-16 h-16 rounded-[1.5rem] ${color} flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm`}>
        {icon}
      </div>
      
      <div className="relative z-10">
        <h4 className="text-xl font-black text-[#1E3A8A] tracking-tight group-hover:text-blue-600 transition-colors">
          {title}
        </h4>
        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
          {desc}
        </p>
      </div>
      
      <div className="relative z-10 mt-10 flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500">
        Launch <FiArrowRight />
      </div>
    </div>
  );
}