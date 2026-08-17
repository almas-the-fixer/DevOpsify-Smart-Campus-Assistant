import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";
import { 
  FiBookOpen, FiUser, FiClock, FiMapPin, 
  FiArrowLeft, FiRotateCcw, FiSlash, FiSave, FiInfo, FiLayers 
} from "react-icons/fi";

export default function LectureDetail() {
  const location = useLocation();
  const passedLecture = location.state;
  const { id } = useParams();
  const navigate = useNavigate();
  const [lecture, setLecture] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);

  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [slots, setSlots] = useState([]);
  const [rooms, setRooms] = useState([]);

  const resetForm = () => {
    if (!lecture) return;
    setForm({
      ...lecture,
      subjectId: String(lecture.subjectId),
      teacherId: String(lecture.teacherId)
    });
  };

  const uniqueSubjects = [
    ...new Map(
      subjects.map(s => [
        `${s.name.trim().toLowerCase()}_${s.semester}_${s.division}`,
        s
      ])
    ).values()
  ];

  useEffect(() => {
    if (passedLecture) {
      setLecture(passedLecture);
      setForm({
        ...passedLecture,
        subjectId: String(passedLecture.subjectId),
        teacherId: String(passedLecture.teacherId)
      });
      setLoading(false);
    } else {
      fetchLecture();
    }
  }, []);

  const fetchLecture = async () => {
    try {
      const res = await api.get(`/timetable/${id}`);
      setLecture(res.data);
      setForm({
        ...res.data,
        subjectId: String(res.data.subjectId),
        teacherId: String(res.data.teacherId)
      });
    } catch (err) {
      console.error("Lecture load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const toMinutes = (time) => {
    if (!time) return 0;
    let [h, m] = time.split(":").map(Number);
    if (h >= 1 && h <= 6) h += 12;
    return h * 60 + m;
  };

  const isValidSlot = (slot) => {
    const start = toMinutes(slot.start);
    const end = toMinutes(slot.end);
    if (start >= nowMinutes) return true;
    if (nowMinutes >= start && nowMinutes <= end) return true;
    if (nowMinutes > start && nowMinutes - start <= 30) return true;
    return false;
  };

  useEffect(() => {
    if (lecture?.semester) fetchSubjects();
  }, [lecture]);

  const fetchSubjects = async () => {
    try {
      const res = await api.get(`/admin/subjects?semester=${lecture.semester}&division=${lecture.division}`);
      setSubjects(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (form.subjectId) fetchTeachers();
  }, [form.subjectId]);

  useEffect(() => {
    if (form.startTime && lecture?.day) fetchRooms();
  }, [form.startTime, lecture]);

  useEffect(() => {
    if (form.teacherId && lecture?.day) fetchSlots();
  }, [form.teacherId, lecture]);

  const fetchTeachers = async () => {
    const res = await api.get(`/available-teachers?subjectId=${form.subjectId}`);
    setTeachers(res.data);
  };

  const fetchSlots = async () => {
    const res = await api.get(`/available-slots?teacherId=${form.teacherId}&day=${lecture.day}&semester=${lecture.semester}&division=${lecture.division}&lectureId=${id}`);
    setSlots(res.data);
  };

  const fetchRooms = async () => {
    const res = await api.get(`/available-rooms?day=${lecture.day}&startTime=${form.startTime}`);
    setRooms(res.data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "subjectId") {
      const selected = subjects.find(s => String(s._id) === value);
      setForm({ ...form, subjectId: value, subject: selected?.name || "", teacherId: "", teacherName: "" });
      setTeachers([]);
    } else if (name === "teacherId") {
      const selected = teachers.find(t => t._id === value);
      setForm({ ...form, teacherId: value, teacherName: selected?.name || "" });
    } else if (name === "startTime") {
      const selected = slots.find(s => s.start === value);
      setForm({ ...form, startTime: selected?.start || "", endTime: selected?.end || "" });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleUpdate = async () => {
    if (form.startTime === lecture.startTime && form.room === lecture.room && String(form.teacherId) === String(lecture.teacherId) && String(form.subjectId) === String(lecture.subjectId)) {
      alert("No changes detected.");
      return;
    }
    const res = await api.post("/check-conflict", { teacherId: form.teacherId, day: lecture.day, startTime: form.startTime, room: form.room, semester: lecture.semester, division: lecture.division });
    if (res.data.conflict) return alert(res.data.conflict);
    
    await api.put(`/override/update/${id}`, form);
    navigate("/admin/classes");
  };

  const handleCancel = async () => {
    const reason = prompt("Reason for cancellation:");
    if (!reason) return;
    try {
      await api.post(`/override/cancel/${id}`, { reason });
      navigate("/admin/classes");
    } catch (err) { console.error(err); }
  };

  if (loading || !lecture) return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
      <div className="w-16 h-16 border-4 border-slate-200 border-t-[#203871] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-[#203871] font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-70 transition-all"
            >
              <FiArrowLeft strokeWidth={3} /> Return to Schedules
            </button>
            <h1 className="text-4xl md:text-5xl font-black text-[#203871] tracking-tight">
              Session <span className="text-blue-500">Override</span>
            </h1>
            <p className="text-slate-500 font-medium">Modify deployment parameters for this specific module.</p>
          </div>

          <div className="flex gap-3">
             <button onClick={resetForm} className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
               <FiRotateCcw /> Reset
             </button>
             <button onClick={handleCancel} className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 border-2 border-red-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all shadow-sm">
               <FiSlash /> Abort Session
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- SIDEBAR: STATUS CARD --- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#203871] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              
              <h3 className="text-blue-300 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Original Deployment</h3>
              
              <div className="space-y-6">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-blue-200/50 text-[10px] font-bold uppercase mb-1">Timeline</p>
                  <p className="text-xl font-black">{lecture.day}</p>
                  <p className="text-sm font-medium text-blue-200/80">{lecture.startTime} - {lecture.endTime}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-blue-200/50 text-[10px] font-bold uppercase mb-1">Sector</p>
                    <p className="text-lg font-black">Div {lecture.division}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-blue-200/50 text-[10px] font-bold uppercase mb-1">Level</p>
                    <p className="text-lg font-black">Sem {lecture.semester}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">{lecture.batchType} STREAM</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <FiInfo className="text-blue-500" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Checks</h4>
              </div>
              <ul className="space-y-3">
                {[
                  { label: "Subject Modules", val: subjects.length },
                  { label: "Available Assets", val: teachers.length },
                  { label: "Resource Rooms", val: rooms.length },
                ].map((item, i) => (
                  <li key={i} className="flex justify-between items-center text-xs font-bold text-slate-600">
                    <span>{item.label}</span>
                    <span className="px-2 py-1 bg-slate-50 rounded-md border border-slate-100">{item.val}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* --- MAIN FORM --- */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-50 overflow-hidden">
              <div className="p-8 md:p-12 space-y-10">
                
                {/* Subject Selection */}
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <FiBookOpen className="text-blue-500" /> Identification Module
                  </label>
                  <select
                    name="subjectId"
                    value={form.subjectId || ""}
                    onChange={handleChange}
                    className="mu-select-v4"
                  >
                    <option value="">Select Subject</option>
                    {uniqueSubjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>

                {/* Teacher Selection */}
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <FiUser className="text-blue-500" /> Assigned Lead
                  </label>
                  <select
                    name="teacherId"
                    value={form.teacherId || ""}
                    onChange={handleChange}
                    className="mu-select-v4"
                  >
                    <option value="">Select Personnel</option>
                    {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Time Slot */}
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <FiClock className="text-blue-500" /> Time Window
                    </label>
                    <select
                      name="startTime"
                      value={form.startTime || ""}
                      onChange={handleChange}
                      className="mu-select-v4"
                    >
                      <option value="">Select Slot</option>
                      {form.startTime && <option value={form.startTime}>{form.startTime} - {form.endTime} (Current)</option>}
                      {slots.filter(s => s.start !== form.startTime && isValidSlot(s)).map(s => (
                        <option key={s.start} value={s.start}>
                          {s.start} - {s.end} {nowMinutes >= toMinutes(s.start) && nowMinutes <= toMinutes(s.end) && " [LIVE]"}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Room */}
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <FiMapPin className="text-blue-500" /> Physical Asset
                    </label>
                    <select
                      name="room"
                      value={form.room || ""}
                      onChange={handleChange}
                      className="mu-select-v4"
                    >
                      <option value="">Select Room</option>
                      {form.room && !rooms.includes(form.room) && <option value={form.room}>{form.room} (Current)</option>}
                      {rooms.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="px-8 py-8 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleUpdate}
                  className="w-full md:w-auto flex items-center justify-center gap-3 bg-[#203871] text-white px-12 py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/30 active:scale-95 transition-all"
                >
                  <FiSave size={18} /> Execute Override
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .mu-select-v4 {
          width: 100%;
          background: #FFFFFF;
          border: 2px solid #F1F5F9;
          padding: 1.25rem;
          border-radius: 1.5rem;
          font-size: 0.875rem;
          font-weight: 800;
          color: #1e293b;
          outline: none;
          transition: all 0.3s;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23203871'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1.5rem center;
          background-size: 1rem;
        }
        .mu-select-v4:focus {
          border-color: #203871;
          background-color: #f8fafc;
          box-shadow: 0 10px 30px -10px rgba(32,56,113,0.15);
        }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.23, 1, 0.32, 1); }
      `}</style>
    </div>
  );
}