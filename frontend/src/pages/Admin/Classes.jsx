import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import { 
  FiFilter, FiRefreshCcw, FiCalendar, 
  FiUser, FiMapPin, FiBookOpen, FiClock, FiActivity, FiArrowRight, FiLayers
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function Classes() {
  const [allClasses, setAllClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Filters
  const [teacher, setTeacher] = useState("");
  const [day, setDay] = useState(new Date().toLocaleDateString("en-US", { weekday: "long" }));
  const [room, setRoom] = useState("");
  const [semester, setSemester] = useState("");
  const [division, setDivision] = useState("");
  const [batchType, setBatchType] = useState("");
  const [popup, setPopup] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const classesPerPage = 8;

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = days[new Date().getDay()];
  const tomorrow = days[(new Date().getDay() + 1) % 7];

  const toMinutes = (time) => {
    if (!time) return 0;
    let [h, m] = time.split(":").map(Number);
    if (h >= 1 && h <= 6) h += 12; 
    return h * 60 + m;
  };

  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  const getStatus = (cls) => {
    if (cls.day !== today) return "future";
    const start = toMinutes(cls.startTime);
    const end = toMinutes(cls.endTime);

    if (nowMinutes >= start && nowMinutes <= end) return "ongoing";
    if (nowMinutes < start) return "next";
    return "past";
  };

  useEffect(() => {
    document.body.style.overflow = popup ? "hidden" : "auto";
  }, [popup]);

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = async () => {
    try {
      setLoading(true);
      const res = await api.get("/timetable");
      setAllClasses(res.data);
    } catch (err) {
      console.error("Error loading timetable:", err);
    } finally {
      setLoading(false);
    }
  };

  const teachers = useMemo(() => [...new Set(allClasses.map(c => c.teacherName))], [allClasses]);
  const rooms = useMemo(() => [...new Set(allClasses.map(c => c.room))], [allClasses]);
  const batchTypes = useMemo(() => [...new Set(allClasses.map(c => c.batchType))], [allClasses]);

  const filtered = useMemo(() => {
    return allClasses.filter(c => {
      return (!teacher || c.teacherName === teacher) &&
        (!day || c.day === day) &&
        (!room || c.room === room) &&
        (!semester || String(c.semester) === semester) &&
        (!division || c.division === division) &&
        (!batchType || c.batchType === batchType);
    });
  }, [allClasses, teacher, day, room, semester, division, batchType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [teacher, day, room, semester, division, batchType]);

  const totalPages = Math.ceil(filtered.length / classesPerPage);

  const sortedClasses = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const statusOrder = { ongoing: 0, next: 1, future: 2, past: 3 };
      const diff = statusOrder[getStatus(a)] - statusOrder[getStatus(b)];
      if (diff !== 0) return diff;
      return toMinutes(a.startTime) - toMinutes(b.startTime);
    });
  }, [filtered]);

  const paginatedClasses = useMemo(() => {
    const start = (currentPage - 1) * classesPerPage;
    return sortedClasses.slice(start, start + classesPerPage);
  }, [sortedClasses, currentPage]);

  const resetFilters = () => {
    setTeacher("");
    setDay(new Date().toLocaleDateString("en-US", { weekday: "long" }));
    setRoom("");
    setSemester("");
    setDivision("");
    setBatchType("");
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC]">
      <div className="relative flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-[#203871] rounded-full animate-spin"></div>
        <div className="mt-6 text-[#203871] font-black tracking-[0.3em] animate-pulse uppercase text-xs">Synchronizing Orbit...</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- PREMIUM HEADER BANNER --- */}
        <div className="relative overflow-hidden bg-[#203871] rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl shadow-blue-900/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-6 text-center lg:text-left flex-col lg:flex-row">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 flex items-center justify-center shadow-inner">
                 <FiCalendar size={32} className="text-blue-300" />
              </div>
              <div>
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                   <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                     Live System
                   </span>
<span className="text-blue-200 text-xs font-bold uppercase tracking-tighter opacity-60">
  {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                  Academic <span className="text-blue-300">Timetable</span>
                </h1>
                <p className="text-blue-100/60 font-medium mt-1 italic">Precision monitoring of institutional schedules</p>
              </div>
            </div>
            
            <button
              onClick={resetFilters}
              className="group flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md px-8 py-4 rounded-2xl text-white transition-all border border-white/20 font-black text-[11px] uppercase tracking-[0.2em]"
            >
              <FiRefreshCcw className="group-hover:rotate-180 transition-transform duration-700" />
              Reset Workspace
            </button>
          </div>
        </div>

        {/* --- SMART FILTERS BAR --- */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(32,56,113,0.05)] border border-slate-100">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <FiFilter size={16} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Control Parameters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <FilterWrapper label="Instructor" icon={<FiUser />}><select value={teacher} onChange={e => setTeacher(e.target.value)} className="mu-select-v3"><option value="">All Prof</option>{teachers.map(t => <option key={t}>{t}</option>)}</select></FilterWrapper>
            <FilterWrapper label="Timeline" icon={<FiCalendar />}><select value={day} onChange={e => setDay(e.target.value)} className="mu-select-v3"><option value="">Full Week</option>{["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => <option key={d}>{d}</option>)}</select></FilterWrapper>
            <FilterWrapper label="Resource" icon={<FiMapPin />}><select value={room} onChange={e => setRoom(e.target.value)} className="mu-select-v3"><option value="">All Rooms</option>{rooms.map(r => <option key={r}>{r}</option>)}</select></FilterWrapper>
            <FilterWrapper label="Academic" icon={<FiBookOpen />}><select value={semester} onChange={e => setSemester(e.target.value)} className="mu-select-v3"><option value="">Semester</option><option value="6">Sem 6</option><option value="8">Sem 8</option></select></FilterWrapper>
            <FilterWrapper label="Division" icon={<FiLayers />}><select value={division} onChange={e => setDivision(e.target.value)} className="mu-select-v3"><option value="">All Divs</option><option value="A">Div A</option><option value="B">Div B</option><option value="C">Div C</option></select></FilterWrapper>
            <FilterWrapper label="Stream" icon={<FiActivity />}><select value={batchType} onChange={e => setBatchType(e.target.value)} className="mu-select-v3"><option value="">Batch Type</option>{batchTypes.map(bt => <option key={bt}>{bt}</option>)}</select></FilterWrapper>
          </div>
        </div>

        {/* --- DATA TABLE --- */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(32,56,113,0.05)] border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
                  <th className="px-10 py-7">Phase & Time</th>
                  <th className="px-8 py-7">Course Module</th>
                  <th className="px-8 py-7">Lead Instructor</th>
                  <th className="px-8 py-7 text-center">Deployment Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedClasses.length > 0 ? paginatedClasses.map((cls) => {
                  const status = getStatus(cls);
                  return (
                    <tr
                      key={cls._id}
                      onClick={() => {
                        const start = toMinutes(cls.startTime);
                        const end = toMinutes(cls.endTime);
                        if (cls.day !== today && cls.day !== tomorrow) return setPopup("Action Restricted: Only Today/Tomorrow schedules are accessible.");
                        if (cls.day === tomorrow) return navigate(`/admin/lecture/${cls._id}`, { state: cls });
                        if (cls.day === today) {
                          if (nowMinutes > end) return setPopup("Session Terminal: Lecture has already concluded.");
                          if (nowMinutes > start + 10) return setPopup("Window Closed: Adjustments only possible within first 10m.");
                          return navigate(`/admin/lecture/${cls._id}`, { state: cls });
                        }
                      }}
                      className={`group cursor-pointer transition-all duration-300 border-l-8 
                        ${status === 'ongoing' ? 'bg-emerald-50/30 border-emerald-500' : 
                          status === 'next' ? 'bg-blue-50/30 border-blue-400' : 
                          status === 'past' ? 'opacity-40 border-slate-200 grayscale' : 'border-transparent hover:bg-slate-50'}`}
                    >
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm ${status === 'ongoing' ? 'bg-emerald-500 text-white shadow-emerald-100 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                            <FiClock size={20} />
                          </div>
                          <div>
                            <span className="font-black block text-sm text-slate-700 tracking-tight">
                              {cls.startTime} — {cls.endTime}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                               <div className={`w-2 h-2 rounded-full ${status === 'ongoing' ? 'bg-emerald-500' : status === 'next' ? 'bg-blue-400' : 'bg-slate-300'}`}></div>
                               <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{status}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-7">
                        <div className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-500">
                          <div className="w-1 h-8 bg-slate-100 group-hover:bg-blue-500 transition-colors rounded-full"></div>
                          <span className="font-black text-lg tracking-tight text-[#203871]">
                            {cls.subject}
                          </span>
                        </div>
                      </td>

                      <td className="px-8 py-7">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#203871] text-white flex items-center justify-center text-xs font-black shadow-lg shadow-blue-900/10 uppercase">
                            {cls.teacherName.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-600 tracking-tight">{cls.teacherName}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Authorized Faculty</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-7">
                        <div className="flex flex-col items-center gap-3">
                          <span className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-xl tracking-widest">
                            ROOM {cls.room}
                          </span>
                          <div className="flex gap-2">
                             <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100 uppercase">Sem {cls.semester} {cls.division}</span>
                             <span className={`text-[9px] font-black px-2 py-1 rounded-md border uppercase ${cls.batchType === "NORMAL" ? "text-slate-500 bg-slate-50 border-slate-100" : "text-amber-600 bg-amber-50 border-amber-100"}`}>{cls.batchType}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="4" className="py-32 text-center opacity-10">
                      <FiLayers size={80} className="mx-auto mb-4" />
                      <p className="text-2xl font-black uppercase tracking-[0.5em]">No Data Stream</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex flex-col md:flex-row justify-between items-center px-10 py-8 bg-slate-50/50 border-t border-slate-100 gap-6">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Showing Phase {currentPage} of {totalPages}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-[#203871] hover:border-[#203871] transition-all"><FiArrowRight className="rotate-180" /></button>
                <div className="flex gap-2 mx-4">
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-12 h-12 rounded-2xl text-xs font-black transition-all ${currentPage === i + 1 ? "bg-[#203871] text-white shadow-xl shadow-blue-900/20" : "bg-white border border-slate-100 text-slate-400 hover:bg-slate-50"}`}>{i + 1}</button>
                  ))}
                </div>
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-[#203871] hover:border-[#203871] transition-all"><FiArrowRight /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* POPUP MODAL */}
      {popup && (
        <div className="fixed inset-0 bg-[#203871]/40 backdrop-blur-xl flex items-center justify-center z-[9999] p-4 animate-fade-in" onClick={() => setPopup("")}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-[3rem] p-10 shadow-2xl max-w-sm w-full text-center border border-white animate-scale-up">
            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-8 transform rotate-3 shadow-inner">
              <FiActivity size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">System Notice</h3>
            <p className="text-slate-500 mb-10 leading-relaxed font-bold text-sm px-4">{popup}</p>
            <button onClick={() => setPopup("")} className="w-full bg-[#203871] text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-blue-900/30 active:scale-95 transition-all">Acknowledge</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .mu-select-v3 {
          width: 100%;
          background: #F8FAFC;
          border: 2px solid transparent;
          padding: 1rem 1.25rem;
          border-radius: 1.25rem;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #1e293b;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1.25rem center;
          background-size: 1rem;
        }
        .mu-select-v3:focus {
          background: white;
          border-color: #203871;
          box-shadow: 0 10px 25px -5px rgba(32,56,113,0.1);
        }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-up { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-scale-up { animation: scale-up 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      `}</style>
    </div>
  );
}

function FilterWrapper({ label, icon, children }) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
        <span className="text-blue-500">{icon}</span>{label}
      </label>
      {children}
    </div>
  );
}