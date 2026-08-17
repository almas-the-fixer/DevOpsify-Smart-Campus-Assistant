import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";
import { 
  FiArrowLeft, FiClock, FiMapPin, FiBookOpen, FiUser, 
  FiSave, FiXCircle, FiInfo, FiCheckCircle, FiAlertCircle, FiSend 
} from "react-icons/fi";

export default function TeacherLectureDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [lecture, setLecture] = useState(null);
  const [form, setForm] = useState({});
  const [slots, setSlots] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 CUSTOM POPUP STATES
  const [statusPopup, setStatusPopup] = useState({ show: false, type: '', title: '', message: '' });
  const [cancelModal, setCancelModal] = useState({ show: false, reason: '' });

  useEffect(() => {
    if (location.state) {
      setLecture(location.state);
      setForm(location.state);
      setLoading(false);
    } else {
      fetchLecture();
    }
  }, []);

  const fetchLecture = async () => {
    try {
      const res = await api.get(`/timetable/${id}`);
      setLecture(res.data);
      setForm(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { if (lecture) fetchSlots(); }, [lecture]);

  const fetchSlots = async () => {
    const res = await api.get(`/available-slots?teacherId=${lecture.teacherId}&day=${lecture.day}&semester=${lecture.semester}&division=${lecture.division}`);
    setSlots(res.data);
  };

  useEffect(() => { if (form.startTime && lecture) fetchRooms(); }, [form.startTime, lecture]);

  const fetchRooms = async () => {
    const res = await api.get(`/available-rooms?day=${lecture.day}&startTime=${form.startTime}`);
    setRooms(res.data);
  };

  const showStatus = (type, title, message) => {
    setStatusPopup({ show: true, type, title, message });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "startTime") {
      const selected = slots.find(s => s.start === value);
      setForm({ ...form, startTime: selected?.start, endTime: selected?.end });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

// ✅ UPDATE WITH POPUP
  const handleUpdate = async () => {
    if (form.startTime === lecture.startTime && form.room === lecture.room) {
      showStatus('error', 'No Changes Detected', 'You haven’t modified any details.');
      return;
    }

    try {
      const res = await api.post("/check-conflict", {
        teacherId: lecture.teacherId, 
        day: lecture.day,
        startTime: form.startTime, 
        room: form.room,
        semester: lecture.semester, 
        division: lecture.division
      });

      if (res.data.conflict) {
        showStatus('error', 'Conflict Alert', res.data.conflict);
        return;
      }

      await api.put(`/override/teacher/update/${id}`, {
        startTime: form.startTime, 
        endTime: form.endTime, 
        room: form.room
      });

      showStatus('success', 'Updated!', 'The lecture schedule has been updated successfully.');
      setTimeout(() => navigate("/teacher/classes"), 2000);
    } catch (err) {
      showStatus('error', 'Update Failed', 'An error occurred while updating the schedule.');
    }
  };

  // ✅ CANCEL WITH CUSTOM INPUT POPUP
  const confirmCancel = async () => {
    if (!cancelModal.reason.trim()) {
      showStatus('error', 'Reason Required', 'Please provide a reason for the cancellation.');
      return;
    }

    try {
      await api.post(`/override/teacher/cancel/${id}`, { reason: cancelModal.reason });
      setCancelModal({ show: false, reason: '' });
      showStatus('success', 'Cancelled!', 'The lecture has been cancelled successfully.');
      setTimeout(() => navigate("/teacher/classes"), 2000);
    } catch (err) {
      showStatus('error', 'Cancellation Failed', 'The cancellation process could not be completed.');
    }
  };
  if (loading || !lecture) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 animate-fade-in font-sans relative">
      
      {/* ✅ STATUS POPUP MODAL (Success/Error) */}
      {statusPopup.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl text-center animate-scale-up">
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${statusPopup.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
              {statusPopup.type === 'success' ? <FiCheckCircle size={40} /> : <FiAlertCircle size={40} />}
            </div>
            <h3 className="text-2xl font-black text-[#203871] mb-2">{statusPopup.title}</h3>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">{statusPopup.message}</p>
            <button onClick={() => setStatusPopup({ ...statusPopup, show: false })} className="w-full py-4 bg-[#203871] text-white font-black rounded-2xl hover:bg-blue-800 transition-colors">Close</button>
          </div>
        </div>
      )}

      {/* ✅ CANCELLATION REASON MODAL */}
      {cancelModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-scale-up">
            <div className="flex items-center gap-4 mb-6">
               <div className="p-3 bg-red-50 text-red-500 rounded-xl"><FiXCircle size={24}/></div>
               <h3 className="text-2xl font-black text-[#203871]">Cancel Lecture</h3>
            </div>
            <p className="text-slate-500 font-medium mb-4 italic text-sm">A notification will be sent to the students.</p>
            
            <textarea 
              placeholder="E.g., Medical Emergency, Seminar, etc."
              value={cancelModal.reason}
              onChange={(e) => setCancelModal({...cancelModal, reason: e.target.value})}
              className="w-full h-32 bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-[#203871] font-medium outline-none focus:border-red-200 transition-all resize-none"
            />

            <div className="flex gap-3 mt-6">
              <button onClick={() => setCancelModal({show: false, reason: ''})} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors">Go Back</button>
              <button onClick={confirmCancel} className="flex-2 px-8 py-4 bg-red-600 text-white font-black rounded-2xl shadow-lg shadow-red-200 flex items-center justify-center gap-2 hover:bg-red-700 transition-all">
                <FiSend /> Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-[#203871] font-bold text-sm mb-6 transition-colors group">
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Schedule
        </button>

        <div className="flex items-center gap-5 mb-10">
          <div className="p-4 bg-gradient-to-br from-[#203871] to-[#3b5ba1] rounded-2xl text-white shadow-xl">
            <FiInfo size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#203871] tracking-tight">Edit Lecture</h1>
            <p className="text-slate-500 font-medium">Update session details or cancel</p>
          </div>
        </div>

        {/* INFO CARD */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8 relative overflow-hidden mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-slate-100">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><FiBookOpen className="text-blue-500" /> Subject</label>
              <div className="text-lg font-bold text-[#203871] bg-slate-50 p-3 rounded-xl">{lecture.subject}</div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><FiUser className="text-blue-500" /> Instructor</label>
              <div className="text-lg font-bold text-[#203871] bg-slate-50 p-3 rounded-xl">{lecture.teacherName}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 px-1"><FiClock className="text-blue-500" /> Select New Time</label>
              <select name="startTime" value={form.startTime || ""} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 text-[#203871] font-bold py-4 px-5 rounded-2xl focus:border-blue-500 outline-none transition-all cursor-pointer">
                <option value="">Choose Slot</option>
                {slots.map(s => <option key={s.start} value={s.start}>{s.start} - {s.end}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 px-1"><FiMapPin className="text-blue-500" /> Change Room</label>
              <select name="room" value={form.room || ""} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 text-[#203871] font-bold py-4 px-5 rounded-2xl focus:border-blue-500 outline-none transition-all cursor-pointer">
                <option value="">Choose Room</option>
                {rooms.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button onClick={handleUpdate} className="w-full sm:w-auto flex-1 flex items-center justify-center gap-3 bg-[#203871] text-white font-black px-8 py-5 rounded-[2rem] shadow-xl hover:scale-[1.02] transition-all">
            <FiSave size={20} /> Update Schedule
          </button>
          <button onClick={() => setCancelModal({show: true, reason: ''})} className="w-full sm:w-auto flex items-center justify-center gap-3 bg-red-50 text-red-600 border-2 border-red-100 font-black px-10 py-5 rounded-[2rem] hover:bg-red-600 hover:text-white transition-all">
            <FiXCircle size={20} /> Cancel Lecture
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-up { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-scale-up { animation: scale-up 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      `}</style>
    </div>
  );
}