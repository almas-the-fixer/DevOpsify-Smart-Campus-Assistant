import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { 
  FiEdit, 
  FiX, 
  FiCalendar, 
  FiHash, 
  FiDownload, 
  FiFileText, 
  FiUsers,
  FiBookOpen,
  FiLayers
} from "react-icons/fi";

export default function History() {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState(null);
  const [present, setPresent] = useState([]);

  const loadHistory = () => {
    api.get("/teacher/attendance/history").then(res => setData(res.data));
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const openEdit = (record) => {
    setCurrent(record);
    setPresent(record.presentStudents.map(s => s._id.toString()));
    setShowModal(true);
  };

  const toggleStudent = (id) => {
    if (present.includes(id)) {
      setPresent(present.filter(p => p !== id));
    } else {
      setPresent([...present, id]);
    }
  };

  const saveEdit = async () => {
    try {
      await api.put(`/teacher/attendance/edit/${current._id}`, { presentStudents: present });
      setShowModal(false);
      loadHistory();
    } catch (err) {
      alert(err.response?.data?.message || "Edit Failed");
    }
  };

  const downloadFile = async (type) => {
    try {
      const res = await api.get(`/teacher/attendance/export/${type}`, { responseType: "blob" });
      const blob = new Blob([res.data], { type: res.headers["content-type"] });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = type === "excel" ? "attendance.xlsx" : "attendance.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Download failed. Please login again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FF] p-4 md:p-8 animate-fade-in font-sans">
      <div className="max-w-6xl mx-auto pb-16">
        
        {/* PAGE HEADER - Sized Down */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">
              <FiLayers className="animate-spin-slow" /> Data Repository
            </div>
            <h2 className="text-3xl font-black text-[#1E3A8A] tracking-tight">Attendance History</h2>
          </div>
          
         
        </div>

        {/* CARDS GRID - Optimized Gaps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map(a => (
            <div key={a._id} className="group bg-white rounded-[2rem] border border-blue-50 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col overflow-hidden">
              
              <div className="p-6 pb-3 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <FiBookOpen size={20} />
                  </div>
                  {a.edited && (
                    <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter border border-amber-100">
                      Edited
                    </span>
                  )}
                </div>

                <h4 className="text-xl font-bold text-[#1E3A8A] mb-3 group-hover:text-blue-600 transition-colors line-clamp-1">{a.subject}</h4>

                <div className="flex flex-wrap gap-2 mb-6 text-[10px] font-bold text-slate-400">
                   <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg"><FiCalendar size={10}/> {a.date}</span>
                  <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                    <FiUsers size={10}/> Div {a.division}
                  </span>

                  <span className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg text-blue-600">
                    Batch {a.batchType}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <div className="text-center">
                    <p className="text-lg font-black text-emerald-600">{a.presentStudents.length}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Present</p>
                  </div>
                  <div className="text-center border-x border-slate-200">
                    <p className="text-lg font-black text-rose-400">{a.totalStudents - a.presentStudents.length}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Absent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-[#1E3A8A]">{a.totalStudents}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Total</p>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button 
                  onClick={() => openEdit(a)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#1E3A8A] hover:text-white transition-all shadow-sm"
                >
                  <FiEdit size={14} /> Modify Record
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* MODAL SYSTEM - Sized for readability */}
      {showModal && current && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1E3A8A]/20 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-lg max-h-[80vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-scale-up">
            
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h3 className="text-xl font-black text-[#1E3A8A]">Edit Records</h3>
                <p className="text-blue-400 text-[9px] font-bold uppercase tracking-widest mt-0.5">{current.subject} • DIV {current.division}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
                <FiX size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/30">
              <div className="space-y-2">
                {current.students.map((s) => {
                  const isPresent = present.includes(s._id.toString());
                  return (
                    <div key={s._id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-blue-200 transition-all shadow-sm group">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-[9px] font-black text-blue-500">{s.rollNo}</span>
                        <span className="font-bold text-[#1E3A8A] text-xs">{s.name}</span>
                      </div>
                      <button 
                        onClick={() => toggleStudent(s._id.toString())}
                        className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${isPresent ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100' : 'bg-rose-50 text-rose-500'}`}
                      >
                        {isPresent ? "Present" : "Absent"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between gap-4">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Selected: {present.length}</span>
               <div className="flex gap-3">
                  <button onClick={() => setShowModal(false)} className="text-[9px] font-black uppercase text-slate-400 hover:text-[#1E3A8A]">Cancel</button>
                  <button onClick={saveEdit} className="px-6 py-2.5 bg-[#1E3A8A] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all">Save</button>
               </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scale-up { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-scale-up { animation: scale-up 0.3s ease-out; }
        .animate-spin-slow { animation: spin 10s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E0; border-radius: 10px; }
      `}</style>
    </div>
  );
}