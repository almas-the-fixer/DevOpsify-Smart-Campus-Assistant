import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../../api/axios";
import { 
  FiCheckCircle, 
  FiUserCheck, 
  FiUsers, 
  FiInfo, 
  FiXCircle, 
  FiArrowLeft,
  FiActivity
} from "react-icons/fi";

export default function TakeAttendance() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [present, setPresent] = useState([]);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  /* Load lecture + students */

const location = useLocation();
const lectureFromState = location.state?.lecture;

useEffect(() => {
  const load = async () => {
    try {
      const res = await api.get(`/timetable/lecture/${id}`);
      setInfo(res.data.lecture);
      setStudents(res.data.students);
    } catch (err) {
      console.error("API Error:", err);
    }
  };

  if (lectureFromState) {
    setInfo(lectureFromState);

    load();
  } else {
    load();
  }
}, [id]);

  /* Toggle Single */
  const toggle = (sid) => {
    setPresent(prev =>
      prev.includes(sid)
        ? prev.filter(i => i !== sid)
        : [...prev, sid]
    );
  };

  /* Select All */
  const selectAll = () => {
    setPresent(students.map(s => s._id));
  };

  const clearAll = () => {
    setPresent([]);
  };

  /* Submit */
  const submit = async () => {
    try {
      setLoading(true);
      await api.post("/teacher/attendance/take", {
        lectureId: id,
        subject: info.subject,
        semester: info.semester,
        division: info.division,
        presentStudents: present,
        totalStudents: students.length,
      });
      navigate("/teacher/attendance/today");
    } catch {
      setError("Attendance already submitted for this lecture.");
    } finally {
      setLoading(false);
    }
  };

  if (!info) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7FF]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-blue-600 font-black text-xs uppercase tracking-widest">Fetching Class List...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FF] p-4 md:p-10 animate-fade-in font-sans">
      <div className="max-w-5xl mx-auto pb-24">
        
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-[10px] uppercase tracking-widest mb-4 transition-colors"
            >
              <FiArrowLeft /> Back to Schedule
            </button>
            <h2 className="text-4xl font-black text-[#1E3A8A] tracking-tighter flex items-center gap-3">
              {info.subject}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">Sem {info.semester}</span>
              <span className="bg-white text-blue-600 border border-blue-100 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">Division {info.division}</span>
            </div>
           
          </div>

          {/* STATS CARD */}
          <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-blue-50 flex items-center gap-6 px-8">
            <div className="text-center">
              <p className="text-2xl font-black text-blue-600 leading-none">{present.length}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Present</p>
            </div>
            <div className="w-[1px] h-8 bg-slate-100"></div>
            <div className="text-center">
              <p className="text-2xl font-black text-slate-300 leading-none">{students.length}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Total</p>
            </div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="flex items-center justify-between mb-6 bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50">
          <div className="flex items-center gap-2 ml-2">
            <FiActivity className="text-blue-500 animate-pulse" />
            <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Live Attendance Marker</span>
          </div>
          <div className="flex gap-2">
            <button onClick={selectAll} className="px-5 py-2.5 bg-white text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-wider border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm">Mark All Present</button>
            <button onClick={clearAll} className="px-5 py-2.5 bg-white text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-wider border border-slate-100 hover:bg-rose-50 hover:text-rose-500 transition-all">Reset</button>
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-shake">
            <FiXCircle size={20} />
            <p className="text-xs font-black uppercase tracking-wide">{error}</p>
          </div>
        )}

        {/* STUDENT LIST TABLE */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-blue-50 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-blue-50">
                <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]"># Roll</th>
                <th className="py-5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student Name</th>
                <th className="py-5 px-8 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {students.map((s, i) => {
                const isPresent = present.includes(s._id);
                return (
                  <tr 
                    key={s._id} 
                    onClick={() => toggle(s._id)}
                    className="group cursor-pointer hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="py-5 px-8">
                      <span className="w-10 h-10 rounded-xl bg-slate-50 text-[#1E3A8A] font-black text-sm flex items-center justify-center border border-slate-100 group-hover:bg-white transition-colors">
                        {s.rollNo}
                      </span>
                    </td>
                    <td className="py-5 px-4">
                      <p className="font-bold text-[#1E3A8A] text-base group-hover:translate-x-1 transition-transform">{s.name}</p>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-0.5">ID: {s._id.slice(-6)}</p>
                    </td>
                    <td className="py-5 px-8 text-right">
                      <div className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${
                        isPresent 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-105' 
                        : 'bg-slate-100 text-slate-400 group-hover:bg-rose-100 group-hover:text-rose-400'
                      }`}>
                        {isPresent ? <FiUserCheck size={14}/> : <FiUsers size={14}/>}
                        {isPresent ? "Present" : "Absent"}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* FLOATING SUBMIT BAR */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
          <button
            disabled={loading}
            onClick={submit}
            className={`w-full py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 ${
              loading 
              ? 'bg-slate-400 cursor-not-allowed' 
              : 'bg-[#1E3A8A] text-white hover:scale-105 active:scale-95 shadow-blue-500/40'
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <><FiCheckCircle size={20} /> Finalize Attendance</>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
}