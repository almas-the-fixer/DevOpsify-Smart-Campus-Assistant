import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiArrowLeft, FiFileText, FiX, FiUploadCloud, 
  FiCheckCircle, FiAlertCircle, FiUsers, FiShield, FiInfo 
} from "react-icons/fi";
import api from "../../api/axios";

export default function BulkUpload() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFile = (file) => {
    if (!file) return;
    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      setError("Please upload a valid CSV file");
      return;
    }
    setError("");
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => parseCSV(e.target.result);
    reader.readAsText(file);
  };

  const parseCSV = (text) => {
    const lines = text.split("\n").filter(l => l.trim());
    const data = lines.slice(1).map((l) => {
      const v = l.split(",");
      return {
        name: v[0]?.trim(),
        email: v[1]?.trim(),
        role: v[2]?.trim(),
        semester: v[3]?.trim(),
        division: v[4]?.trim(),
        rollNo: v[5]?.trim(),
        subjects: v[6]?.trim(),
        approved: v[7]?.trim().toLowerCase() === "true"
      };
    });
    setRows(data);
  };

  const clearFile = () => {
    setRows([]);
    setFileName("");
    setError("");
    setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  };

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
                  <span className="px-3 py-0.5 bg-blue-400/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-blue-400/30 text-blue-200">
                    Data Management
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                  Bulk <span className="text-blue-300">Import</span>
                </h2>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center gap-4 bg-black/20 backdrop-blur-md p-4 rounded-[1.5rem] border border-white/5">
                <FiInfo className="text-blue-300 text-xl" />
                <p className="text-xs font-medium text-blue-100/80 leading-tight">
                    Ensure your CSV follows the <br/> required schema for error-free sync.
                </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: UPLOAD CONTROLS */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 h-full">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FiFileText size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configuration</p>
                    <p className="text-sm font-bold text-slate-700">CSV Template Upload</p>
                 </div>
              </div>

              {!fileName ? (
                <div 
                  className={`relative border-2 border-dashed rounded-[2rem] p-12 transition-all cursor-pointer flex flex-col items-center text-center group
                    ${isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-blue-400 bg-slate-50/30'}`}
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
                    <FiUploadCloud size={38} />
                  </div>
                  <h4 className="text-slate-800 font-black text-lg mb-1">Select CSV File</h4>
                  <p className="text-slate-400 text-xs font-medium mb-8">Drag and drop or browse workstation</p>
                  
                  <div className="px-6 py-3 bg-[#203871] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-900/20">
                    Browse Files
                  </div>
                  <input ref={fileRef} type="file" hidden accept=".csv" onChange={(e) => handleFile(e.target.files[0])} />
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-10 flex flex-col items-center text-center animate-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-emerald-500 mb-6 shadow-sm shadow-emerald-900/10">
                    <FiCheckCircle size={40} />
                  </div>
                  <p className="text-emerald-900 font-black text-sm break-all mb-2">{fileName}</p>
                  <p className="text-emerald-600/70 text-[10px] font-black uppercase tracking-[0.2em] mb-8">System Validated</p>
                  
                  <button onClick={clearFile} className="flex items-center gap-2 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 px-6 py-3 rounded-xl transition-all border border-rose-100">
                    <FiX /> Discard File
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-6 p-4 bg-rose-50 text-rose-600 rounded-2xl flex items-center gap-3 text-xs font-black border border-rose-100 uppercase tracking-tight">
                  <FiAlertCircle className="shrink-0 text-lg" /> {error}
                </div>
              )}

              <button 
                disabled={!rows.length || loading}
                onClick={async () => {
                  try {
                    setLoading(true);
                    setResult(null);
                    const res = await api.post("/admin/users/bulk", { users: rows });
                    setResult({ success: true, created: res.data.createdCount, skipped: res.data.skipped?.length || 0 });
                    clearFile();
                  } catch (err) {
                    setResult({ success: false, message: err.response?.data?.message || "Upload failed" });
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full mt-10 bg-[#203871] text-white py-5 rounded-2xl font-black uppercase tracking-[0.15em] text-xs shadow-xl shadow-blue-900/20 hover:bg-blue-800 disabled:opacity-30 disabled:grayscale transition-all transform active:scale-[0.98]"
              >
                {loading ? "Processing Engine..." : "Execute Bulk Onboarding"}
              </button>

              {result && (
                <div className={`mt-6 p-5 rounded-2xl text-xs font-bold border animate-slide-up ${
                  result.success ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                }`}>
                  {result.success 
                    ? `MISSION SUCCESS: ${result.created} entries created. ${result.skipped} duplicates skipped.` 
                    : `ERROR: ${result.message}`}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: DATA PREVIEW TABLE */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col min-h-[500px]">
              {!rows.length ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-300">
                  <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 border border-slate-100">
                    <FiUsers size={40} className="opacity-20" />
                  </div>
                  <h3 className="font-black text-slate-400 uppercase tracking-widest text-sm">Waiting for Data</h3>
                  <p className="text-xs font-medium opacity-60 mt-2">Upload a CSV to preview record mapping</p>
                </div>
              ) : (
                <div className="flex flex-col h-full animate-in fade-in slide-in-from-right duration-500">
                  <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                    <div>
                        <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Pre-Sync Validation</h3>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Top 8 records shown</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-[10px] font-black shadow-lg shadow-blue-900/10 uppercase">{rows.length} Total</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white border-b border-slate-50">
                          <th className="px-8 py-5">User Details</th>
                          <th className="px-8 py-5">Role</th>
                          <th className="px-8 py-5 text-right">Access</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {rows.slice(0, 8).map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-8 py-5">
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-700 group-hover:text-blue-600 transition-colors">{r.name}</span>
                                    <span className="text-[11px] text-slate-400 font-medium">{r.email}</span>
                                </div>
                            </td>
                            <td className="px-8 py-5">
                              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                                r.role?.toLowerCase() === 'admin' 
                                ? 'bg-indigo-50 text-indigo-600 border-indigo-100' 
                                : 'bg-blue-50 text-blue-600 border-blue-100'
                              }`}>
                                {r.role || 'Student'}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                                <div className="inline-flex items-center gap-1.5 text-emerald-500 font-black text-[10px] uppercase">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                    Ready
                                </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {rows.length > 8 && (
                    <div className="p-6 text-center border-t border-slate-50 bg-slate-50/20">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        + {rows.length - 8} Additional records pending sync
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(0.4, 0, 0.2, 1); }
        .animate-slide-up { animation: slide-up 0.4s ease-out; }
      `}</style>
    </div>
  );
}