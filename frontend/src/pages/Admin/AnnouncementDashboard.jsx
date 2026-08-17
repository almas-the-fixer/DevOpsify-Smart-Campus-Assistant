import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { 
  FiPlus, FiTrash2, FiSearch, FiArrowLeft, 
  FiVolume2, FiLayers, FiUsers, FiEye, 
  FiClock, FiHash, FiMapPin 
} from "react-icons/fi";

export default function AnnouncementDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [list, setList] = useState([]);
  const [search, setSearchterm] = useState("");

  useEffect(() => {
    load();
  }, [search]); // Search change hote hi reload hoga

  const load = async () => {
    try {
      const s = await api.get("/admin/announcements/stats");
      setStats(s.data);

      const res = await api.get("/admin/announcements?search=" + search);
      setList(res.data.announcements || []);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAnnouncement = async (id) => {
    if (!window.confirm("Delete this announcement permanently?")) return;
    await api.delete("/admin/announcements/" + id);
    load();
  };

  const togglePin = async (id) => {
    await api.patch("/admin/announcements/" + id + "/pin");
    load();
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-10 font-sans text-[#1E293B]">
      
      {/* --- TOP HEADER --- */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-[#203871] font-bold text-xs uppercase tracking-widest transition-all mb-2"
          >
            <FiArrowLeft /> Back to Dashboard
          </button>
          <h1 className="text-4xl font-black text-[#203871] tracking-tight">
            Announcements <span className="text-blue-500 text-sm block md:inline md:ml-2 font-medium tracking-normal">Broadcast Hub</span>
          </h1>
        </div>

        <button
          onClick={() => navigate("/admin/create-announcement")}
          className="flex items-center gap-2 bg-[#203871] text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all"
        >
          <FiPlus size={20} /> Create New
        </button>
      </div>

      {/* --- STATS SECTION --- */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Posts" value={stats.total} icon={<FiVolume2 size={24}/>} color="text-blue-600" bg="bg-blue-50" />
        <StatCard title="Live Now" value={stats.active} icon={<FiClock size={24}/>} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard title="Archived" value={stats.expired} icon={<FiLayers size={24}/>} color="text-amber-600" bg="bg-amber-50" />
        <StatCard title="Reach/Reads" value={stats.reads} icon={<FiEye size={24}/>} color="text-purple-600" bg="bg-purple-50" />
      </div>

      {/* --- SEARCH & LIST --- */}
      <div className="max-w-7xl mx-auto">
        <div className="relative mb-8 group">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#203871] transition-colors" size={20} />
          <input
            placeholder="Search by title, message or keywords..."
            className="w-full pl-14 pr-6 h-16 rounded-[1.5rem] bg-white border-none shadow-sm focus:ring-2 focus:ring-[#203871] font-medium text-lg transition-all"
            value={search}
            onChange={(e) => setSearchterm(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Recent Broadcasts</h3>
            <span className="text-[10px] font-bold bg-white px-3 py-1 rounded-full border border-slate-100 text-slate-500">
              {list.length} Records Found
            </span>
          </div>

          <div className="divide-y divide-slate-50">
            {list.length === 0 ? (
              <div className="p-20 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <FiVolume2 size={40} />
                </div>
                <p className="text-slate-400 font-bold">No announcements found in the registry.</p>
              </div>
            ) : (
              list.map((a) => (
                <div
                  key={a._id}
                  className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:bg-slate-50/50 transition-all group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        a.type === 'Urgent' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-[#203871]'
                      }`}>
                        {a.type || 'General'}
                      </span>
                      <h3 className="font-black text-xl text-[#1E2A44] group-hover:text-blue-700 transition-colors">
                        {a.title}
                      </h3>
                    </div>

                    <p className="text-slate-500 leading-relaxed max-w-2xl mb-4">
                      {a.message}
                    </p>

                    <div className="flex flex-wrap gap-4 items-center">

{/* STUDENT ANNOUNCEMENT */}
{a.role === "student" && (
<>
<Badge icon={<FiUsers size={12}/>} label={`Sem ${a.semester}`} />
<Badge icon={<FiMapPin size={12}/>} label={`Div ${a.division}`} />
</>
)}

{/* TEACHER ANNOUNCEMENT */}
{a.role === "teacher" && (
<Badge icon={<FiUsers size={12}/>} label="Teachers" />
)}

{/* EVERYONE */}
{a.role === "all" && (
<>
<Badge icon={<FiUsers size={12}/>} label="All Users" />
{a.semester && <Badge icon={<FiLayers size={12}/>} label={`Sem ${a.semester}`} />}
{a.division && <Badge icon={<FiMapPin size={12}/>} label={`Div ${a.division}`} />}
</>
)}

{a.pinned && (
<span className="flex items-center gap-1.5 text-blue-600 font-bold text-[10px] uppercase">
<FiHash /> Pinned to Top
</span>
)}

</div>
                  </div>

                  <div className="flex gap-3 w-full md:w-auto border-t md:border-none pt-4 md:pt-0">
                    <button
                      onClick={() => deleteAnnouncement(a._id)}
                      className="h-11 w-11 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-100 shadow-sm"
                      title="Delete"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- REUSABLE COMPONENTS ---

function StatCard({ title, value, icon, color, bg }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-all duration-300">
      <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center shadow-inner`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
          {title}
        </p>
        <h2 className="text-3xl font-black text-[#203871]">
          {value || 0}
        </h2>
      </div>
    </div>
  );
}

function Badge({ icon, label }) {
  return (
    <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full text-slate-600 text-[11px] font-bold">
      <span className="text-slate-400">{icon}</span>
      {label}
    </div>
  );
}