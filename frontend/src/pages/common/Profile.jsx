import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance"; // Axios instance check kar lena
import {
  FiEdit, FiMail, FiShield, FiAward,
  FiHash, FiGrid, FiLayers, FiCheckCircle, FiActivity,
  FiBookOpen, FiClock, FiStar, FiZap
} from "react-icons/fi";

export default function Profile() {
  const { user, setUser } = useAuth(); // setUser bhi nikala context se
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // --- API FETCH LOGIC ---
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get("/users/me");
        setUser(res.data); // Context update kar rahe hain fresh data se
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [setUser]);

  const avatarChar = user?.name?.charAt(0).toUpperCase() || "?";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8faff]">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // --- ROLE BASED RENDER LOGIC ---
  const renderRoleSpecificStats = () => {
    switch (user?.role) {
      case "admin":
        return (
          <>
            <ProfileMetric label="Access Level" value="Full Root" icon={<FiShield />} />
            <ProfileMetric label="System Status" value="Online" icon={<FiZap />} />
            <ProfileMetric label="Admin ID" value={`#${user?._id?.slice(-4) || '001'}`} icon={<FiHash />} />
          </>
        );
      case "teacher":
        return (
          <>
            <ProfileMetric label="Experience" value={user?.experience || "5+ Yrs"} icon={<FiClock />} />
            <ProfileMetric label="Subjects" value={user?.subjects?.length || "0"} icon={<FiBookOpen />} />
            <ProfileMetric label="Rating" value="4.8/5" icon={<FiStar />} />
          </>
        );
      case "student":
      default:
        return (
          <>
            <ProfileMetric label="Roll No" value={user?.rollNo} icon={<FiHash />} />
            <ProfileMetric label="Semester" value={user?.semester} icon={<FiLayers />} />
            <ProfileMetric label="Division" value={user?.division} icon={<FiGrid />} />
          </>
        );
    }
  };

  const getVerificationText = () => {
    if (user?.role === "admin") return "Superuser Account: High-level system permissions granted.";
    if (user?.role === "teacher") return "Faculty Verified: Academic credentials confirmed by Registrar.";
    return "Student Verified: Profile synced with Institutional Smart Campus Node.";
  };

  return (
    <div className="min-h-screen bg-[#f8faff] selection:bg-blue-100 -mt-14">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[-2%] w-[400px] h-[400px] bg-[#3b82f6]/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[5%] left-[18%] w-[500px] h-[500px] bg-[#203871]/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative pt-24 pb-20 px-4 max-w-5xl mx-auto">
        <div className="animate-slide-up space-y-6">
          <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(32,56,113,0.06)] border border-slate-100 overflow-hidden">
            
            {/* Blue Banner Section */}
            <div className="relative h-44 bg-[#203871] flex items-end">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '24px 24px' }}></div>
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#3b82f6] rounded-full blur-[60px] opacity-40"></div>
              <div className="relative ml-10 -mb-12 z-10">
                <div className="w-32 h-32 bg-white rounded-3xl p-1.5 shadow-xl">
                  <div className="w-full h-full bg-gradient-to-br from-[#203871] to-[#3b82f6] rounded-[1.2rem] flex items-center justify-center text-4xl font-black text-white">
                    {avatarChar}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Info Header */}
            <div className="pt-16 pb-8 px-10 flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-black text-[#203871] tracking-tight">{user?.name}</h2>
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mt-2 text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#3b82f6] rounded-full text-[10px] font-black uppercase tracking-wider border border-blue-100">
                    <FiAward size={14}/> {user?.role}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm"><FiMail className="text-slate-400" /> {user?.email}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/${user?.role}/edit-profile`)}
                className="flex items-center gap-2 px-6 py-3 bg-[#203871] text-white rounded-2xl font-bold hover:bg-[#3b82f6] transition-all shadow-lg shadow-blue-900/20 active:scale-95 text-sm"
              >
                <FiEdit size={16} /> Edit Information
              </button>
            </div>

            <div className="h-px bg-slate-50 mx-10"></div>

            {/* Main Stats Area */}
            <div className="p-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {renderRoleSpecificStats()}
                   </div>
                   <div className="p-6 bg-[#f8faff] rounded-[2rem] border border-blue-50 flex items-center gap-5 group hover:bg-white hover:shadow-xl transition-all duration-300">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm group-hover:scale-110 transition-transform">
                        <FiCheckCircle size={28} />
                      </div>
                      <div>
                        <h4 className="font-black text-[#203871] text-lg">Identity Verified</h4>
                        <p className="text-sm text-slate-500 font-medium">{getVerificationText()}</p>
                      </div>
                   </div>
                </div>

                <div className="lg:col-span-4 space-y-4">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">System Analytics</h4>
                   <div className="bg-slate-50 rounded-[2rem] p-3 space-y-2 border border-slate-100">
                      <StatusRow label="Security" status="End-to-End" icon={<FiShield />} />
                      <StatusRow label="Activity" status="Online" icon={<FiActivity />} />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Components
function ProfileMetric({ label, value, icon }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:border-[#3b82f6]/40 transition-all group">
      <div className="text-[#3b82f6] mb-4 bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:bg-[#3b82f6] group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-[#203871]">{value || "--"}</p>
    </div>
  );
}

function StatusRow({ label, status, icon }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100/50">
      <div className="flex items-center gap-3 text-xs font-bold text-[#203871]/80">
        <span className="text-[#3b82f6]">{icon}</span>
        {label}
      </div>
      <span className="text-[9px] font-black text-[#3b82f6] bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
        {status}
      </span>
    </div>
  );
}