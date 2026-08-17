import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import {
  FiRefreshCcw,
  FiCalendar,
  FiMapPin,
  FiClock,
  FiChevronRight,
  FiChevronLeft,
  FiInbox,
  FiLayers,
  FiHash,
  FiUsers,
  FiCompass
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function TeacherClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [day, setDay] = useState(new Date().toLocaleDateString("en-US", { weekday: "long" }));
  const [room, setRoom] = useState("");
  const [semester, setSemester] = useState("");
  const [division, setDivision] = useState("");
  const [batchType, setBatchType] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 9; // 3x3 Grid ke liye perfect

  useEffect(() => { fetchClasses(); }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get("/teacher/timetable/me");
      setClasses(res.data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

const canEditLecture = (cls) => {

  const now = new Date();

  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  const todayIndex = now.getDay();
  const lectureIndex = days.indexOf(cls.day);

  const diff = lectureIndex - todayIndex;

  if (diff > 1) {
    return false;
  }

  if (diff < 0) {
    return false;
  }

  if (diff === 1) {
    return true;
  }

  if (diff === 0) {

    const [hours, minutes] = cls.startTime.split(":").map(Number);

    const lectureStart = new Date();
    lectureStart.setHours(hours);
    lectureStart.setMinutes(minutes);
    lectureStart.setSeconds(0);

    const editLimit = new Date(lectureStart.getTime() + 10 * 60000);

    if (now < lectureStart) {
      return true;
    }

    if (now >= lectureStart && now <= editLimit) {
      return true;
    }

    return false;
  }

  return false;
};


  const rooms = useMemo(() => [...new Set(classes.map(c => c.room))], [classes]);

  const filtered = useMemo(() => {
    return classes.filter(c => {
      return (
        (!day || c.day === day) &&
        (!room || c.room === room) &&
        (!semester || String(c.semester) === semester) &&
        (!division || c.division === division) &&
        (!batchType || c.batchType === batchType)
      );
    });
  }, [classes, day, room, semester, division, batchType]);

  // Filter badalne par automatic Page 1 par reset
  useEffect(() => { setCurrentPage(1); }, [day, room, semester, division, batchType]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage]);

  const resetFilters = () => {
    setDay(new Date().toLocaleDateString("en-US", { weekday: "long" }));
    setRoom("");
    setSemester("");
    setDivision("");
    setBatchType("");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="w-12 h-12 border-4 border-[#203871] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Schedule...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 animate-fade-in font-sans selection:bg-blue-100">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-[#203871] to-[#3b5ba1] rounded-2xl text-white shadow-xl shadow-blue-900/20 transform -rotate-3 group hover:rotate-0 transition-transform duration-300">
              <FiCalendar size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-[#203871] tracking-tight">Lectures</h2>
              <p className="text-slate-500 font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {day === "" ? "Global View" : `${day}'s Timeline`}
              </p>
            </div>
          </div>

          <button
            onClick={resetFilters}
            className="hidden md:flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-[#203871] font-bold text-sm rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 group"
          >
            <FiRefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" /> 
            Sync Today
          </button>
        </div>

        {/* FILTERS */}
        <div className="bg-white p-3 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 mb-10 grid grid-cols-2 lg:grid-cols-5 gap-3">
          <FilterSelect value={day} onChange={setDay} icon={<FiCalendar />} label="Day">
            <option value="">All Days</option>
            {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d => <option key={d}>{d}</option>)}
          </FilterSelect>
          <FilterSelect value={room} onChange={setRoom} icon={<FiCompass />} label="Venue">
            <option value="">All Rooms</option>
            {rooms.map(r => <option key={r}>{r}</option>)}
          </FilterSelect>
          <FilterSelect value={semester} onChange={setSemester} icon={<FiHash />} label="Sem">
            <option value="">All</option>
            <option value="6">Sem 6</option>
            <option value="8">Sem 8</option>
          </FilterSelect>
          <FilterSelect value={division} onChange={setDivision} icon={<FiUsers />} label="Div">
            <option value="">All</option>
            <option value="A">Division A</option>
            <option value="B">Division B</option>
            <option value="C">Division C</option>
          </FilterSelect>
          <FilterSelect value={batchType} onChange={setBatchType} icon={<FiLayers />} label="Type">
            <option value="">All</option>
            <option value="NORMAL">NORMAL</option>
            <option value="OJT">OJT</option>
          </FilterSelect>
        </div>

        {/* LECTURE CARDS */}
        {paginated.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {paginated.map((cls) => (
                <div
                  key={cls._id}
                 onClick={() => {

  if (!canEditLecture(cls)) {
    alert("Lecture edit window closed");
    return;
  }

  navigate(`/teacher/lecture/${cls._id}`, { state: cls });

}}
                  className={`group bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 hover:border-blue-200 transition-all duration-500 cursor-pointer relative overflow-hidden flex flex-col justify-between"
                
  ${!canEditLecture(cls) ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
`}>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-gradient-to-br from-[#203871] to-[#3b5ba1] text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                          {cls.day}
                        </span>
                        <span className="px-3 py-1 bg-blue-50 text-[#203871] rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
                          Sem {cls.semester} • {cls.division}
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-[#203871] group-hover:text-white transition-all duration-300">
                          <FiChevronRight size={20} />
                      </div>
                    </div>

                    <h3 className="text-xl font-black text-[#203871] mb-8 group-hover:text-blue-600 transition-colors leading-tight min-h-[3.5rem] line-clamp-2">
                      {cls.subject}
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                           <FiClock size={14} />
                        </div>
                        {cls.startTime} — {cls.endTime}
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                           <FiMapPin size={14} />
                        </div>
                        Room {cls.room}
                      </div>
                    </div>
                  </div>

                  <div className={`absolute top-0 right-12 px-4 py-1.5 rounded-b-2xl font-black text-[9px] tracking-[0.2em] shadow-sm transition-transform duration-500 group-hover:translate-y-1 ${
                    cls.batchType === 'OJT' ? 'bg-amber-400 text-white' : 'bg-emerald-400 text-white'
                  }`}>
                    {cls.batchType || 'NORMAL'}
                  </div>
                </div>
              ))}
            </div>

            {/* ✅ UPDATED PAGINATION */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-6 mt-8 mb-20">
                <div className="flex items-center gap-4">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-[#203871] shadow-sm disabled:opacity-20 hover:border-blue-400 transition-all active:scale-90"
                  >
                    <FiChevronLeft size={20} />
                  </button>

                  {/* Dot Indicators */}
                  <div className="flex items-center gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          currentPage === i + 1 
                            ? 'w-10 bg-[#203871]' 
                            : 'w-2.5 bg-slate-200 hover:bg-slate-300'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-[#203871] shadow-sm disabled:opacity-20 hover:border-blue-400 transition-all active:scale-90"
                  >
                    <FiChevronRight size={20} />
                  </button>
                </div>
                
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Page {currentPage} of {totalPages} • Total {filtered.length} Lectures
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 shadow-inner">
            <FiInbox size={40} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-2xl font-black text-slate-700">No classes found</h3>
            <p className="text-slate-400 mt-2 font-medium">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSelect({ label, icon, value, onChange, children }) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/80 rounded-[2rem] transition-all group relative">
      <div className="text-blue-500 text-xl group-hover:scale-125 transition-transform shrink-0">{icon}</div>
      <div className="flex flex-col w-full min-w-0">
        <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.15em] mb-1.5 truncate">{label}</span>
        <select 
          value={value} 
          onChange={e => onChange(e.target.value)}
          className="bg-transparent text-[13px] font-extrabold text-[#203871] focus:outline-none cursor-pointer w-full"
        >
          {children}
        </select>
      </div>
    </div>
  );
}