import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiX,
  FiUploadCloud,
  FiCalendar,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiClock,
  FiMapPin,
  FiBookOpen,
  FiUser
} from "react-icons/fi";
import api from "../../api/axios";

const REQUIRED_HEADERS = [
  "day", "starttime", "endtime", "subject", "subjecttype",
  "teachername", "semester", "division", "room", "batchtype"
];

const UploadTimetable = () => {
  const navigate = useNavigate();
  const fileRef = useRef();

  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFile = (file) => {
    if (!file) return;
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setError("Only CSV files are allowed");
      return;
    }
    setError("");
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => parseCSV(e.target.result);
    reader.readAsText(file);
  };

  const parseCSV = (text) => {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      setError("CSV file is empty");
      return;
    }
    const headers = lines[0].toLowerCase().split(",").map((h) => h.trim());
    const isValid = REQUIRED_HEADERS.every((h) => headers.includes(h));

    if (!isValid) {
      setError("Invalid CSV format. Check required columns.");
      setRows([]);
      return;
    }

    const data = lines.slice(1).map((line) => {
      const v = line.split(",");
      return {
        day: v[0]?.trim(),
        startTime: v[1]?.trim(),
        endTime: v[2]?.trim(),
        subject: v[3]?.trim(),
        subjectType: v[4]?.trim(),
        teacherName: v[5]?.trim(),
        semester: v[6]?.trim(),
        division: v[7]?.trim(),
        room: v[8]?.trim(),
        batchType: v[9]?.trim() || "Theory"
      };
    });
    setRows(data);
  };

  const clearFile = () => {
    setFileName("");
    setRows([]);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => setResult(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [result]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* --- PREMIUM HEADER BANNER --- */}
        <div className="relative overflow-hidden bg-[#203871] rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl shadow-blue-900/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate(-1)}
                className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center transition-all border border-white/20 group"
              >
                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-3 py-0.5 bg-amber-400/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-amber-400/30 text-amber-200">
                    Academic Scheduler
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                  Sync <span className="text-blue-300">Timetable</span>
                </h2>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center gap-4 bg-black/20 backdrop-blur-md p-4 rounded-[1.5rem] border border-white/5">
                <FiCalendar className="text-blue-300 text-2xl" />
                <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Live Status</p>
                    <p className="text-xs font-bold text-white">{rows.length} Sessions Loaded</p>
                </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT SIDE: UPLOAD & GUIDE */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              
              {/* SCHEMA GUIDE CARD */}
              <div className="mb-8 p-6 bg-slate-50 border border-slate-100 rounded-[2rem]">
                <div className="flex items-center gap-2 text-[#203871] font-black text-[10px] uppercase tracking-widest mb-4">
                  <FiInfo size={16} /> Configuration Schema
                </div>
                <div className="flex flex-wrap gap-2">
                  {REQUIRED_HEADERS.map(header => (
                    <span key={header} className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[9px] font-bold text-slate-500 uppercase">
                      {header}
                    </span>
                  ))}
                </div>
              </div>

              {/* DROPZONE */}
              {!fileName ? (
                <div
                  className={`relative border-2 border-dashed rounded-[2.5rem] p-12 transition-all cursor-pointer flex flex-col items-center text-center group
                  ${isDragging ? "border-blue-500 bg-blue-50/50" : "border-slate-200 hover:border-blue-400 bg-slate-50/30"}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFile(e.dataTransfer.files[0]);
                  }}
                  onClick={() => fileRef.current.click()}
                >
                  <div className="w-20 h-20 bg-white shadow-xl shadow-blue-900/5 rounded-3xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                    <FiUploadCloud size={40} />
                  </div>
                  <h4 className="text-slate-800 font-black text-lg mb-1 tracking-tight">Master CSV Upload</h4>
                  <p className="text-slate-400 text-xs font-medium mb-8">Click to browse or drop file here</p>
                  
                  <div className="px-8 py-3 bg-[#203871] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-900/20">
                    Select Master File
                  </div>
                  <input ref={fileRef} type="file" hidden accept=".csv" onChange={(e) => handleFile(e.target.files[0])} />
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-100 rounded-[2.5rem] p-10 flex flex-col items-center text-center animate-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-emerald-500 mb-6 shadow-sm">
                    <FiCheckCircle size={40} />
                  </div>
                  <p className="text-emerald-900 font-black text-sm break-all mb-2">{fileName}</p>
                  <p className="text-emerald-600/70 text-[10px] font-black uppercase tracking-widest mb-8">Data Validation Passed</p>
                  
                  <button onClick={clearFile} className="flex items-center gap-2 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 px-6 py-3 rounded-xl transition-all border border-rose-100">
                    <FiX /> Remove File
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-tight">
                  <FiAlertCircle size={18} /> {error}
                </div>
              )}

              {/* ACTION BUTTON */}
              <button
                disabled={!rows.length || error || loading}
                onClick={async () => {
                  try {
                    setLoading(true);
                    setResult(null);
                    const res = await api.post("/admin/timetable/bulk", { sessions: rows });
                    setResult({ success: true, message: `DATABASE SYNCED: ${res.data.createdCount} sessions added.` });
                    clearFile();
                  } catch (err) {
                    setResult({ success: false, message: err.response?.data?.message || "Internal Sync Error" });
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full mt-10 bg-[#203871] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-900/20 hover:bg-blue-800 disabled:opacity-20 transition-all transform active:scale-[0.98]"
              >
                {loading ? "Initializing Sync..." : "Execute Master Sync"}
              </button>

              {result && (
                <div className={`mt-6 p-5 rounded-2xl text-[11px] font-black uppercase tracking-widest border animate-slide-up ${
                  result.success ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                }`}>
                  {result.message}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: MODERN PREVIEW */}
          <div className="lg:col-span-7 space-y-4">
             <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col min-h-[600px] overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                    <div>
                        <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Timeline Preview</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tight">First 5 records from file</p>
                    </div>
                    {rows.length > 0 && (
                        <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase">
                           Active Upload
                        </span>
                    )}
                </div>

                <div className="flex-1 p-8">
                   {!rows.length ? (
                      <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale">
                         <FiCalendar size={100} className="text-slate-300" />
                         <p className="mt-4 font-black uppercase tracking-[0.3em] text-slate-400">No Data Detected</p>
                      </div>
                   ) : (
                      <div className="space-y-4">
                         {rows.slice(0, 5).map((r, i) => (
                            <div key={i} className="group bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 border border-slate-100 rounded-[2rem] p-6 transition-all duration-300 flex flex-col md:flex-row md:items-center gap-6">
                               <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                     <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[8px] font-black uppercase tracking-widest">
                                        {r.subjectType}
                                     </span>
                                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.day}</span>
                                  </div>
                                  <h4 className="text-lg font-black text-[#203871] group-hover:text-blue-600 transition-colors">{r.subject}</h4>
                                  <div className="flex flex-wrap items-center gap-4 mt-3 text-slate-500 font-bold text-[11px]">
                                     <div className="flex items-center gap-1.5"><FiUser className="text-blue-400" /> {r.teacherName}</div>
                                     <div className="flex items-center gap-1.5"><FiMapPin className="text-blue-400" /> Room {r.room}</div>
                                  </div>
                               </div>
                               <div className="flex flex-row md:flex-col items-center justify-between md:justify-center px-6 py-4 bg-white md:bg-transparent rounded-2xl md:rounded-none border-t md:border-t-0 md:border-l border-slate-200 gap-1">
                                  <div className="flex items-center gap-2 text-slate-400"><FiClock size={12} /> <span className="text-[10px] font-black uppercase tracking-tighter">Start</span></div>
                                  <span className="text-sm font-black text-slate-800">{r.startTime}</span>
                               </div>
                            </div>
                         ))}
                         {rows.length > 5 && (
                             <div className="p-4 text-center">
                                <p className="text-[12px] font-black  uppercase tracking-[0.2em] italic">
                                   + {rows.length - 5} More sessions in stack
                                </p>
                             </div>
                         )}
                      </div>
                   )}
                </div>
             </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
        .animate-slide-up { animation: slide-up 0.4s ease-out; }
      `}</style>
    </div>
  );
};

export default UploadTimetable;