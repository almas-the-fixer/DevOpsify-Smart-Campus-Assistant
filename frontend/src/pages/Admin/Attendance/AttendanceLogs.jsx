import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { 
  FiSearch, 
  FiRefreshCw, 
  FiActivity, 
  FiUser, 
  FiShield, 
  FiClock,
  FiTerminal,
  FiArrowLeft,
  FiFilter
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function AttendanceLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/systemlogs");
      setLogs(res.data);
    } catch (err) {
      console.error("Logs error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(
    (log) =>
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.performedBy?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- PREMIUM SYSTEM HEADER BANNER --- */}
        <div className="relative overflow-hidden bg-[#203871] rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl shadow-blue-900/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
          
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
                  <span className="px-3 py-0.5 bg-indigo-400/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-400/30 text-indigo-200">
                    Security & Audit
                  </span>
                  {loading && <span className="animate-pulse w-2 h-2 bg-emerald-400 rounded-full"></span>}
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                  System <span className="text-blue-300">Activity Logs</span>
                </h2>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               <div className="hidden lg:flex flex-col items-end mr-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 opacity-60">Engine Status</p>
                  <p className="text-xs font-bold text-white uppercase">Operational</p>
               </div>
               <button
                  onClick={fetchLogs}
                  disabled={loading}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl flex items-center gap-3 transition-all font-black text-[10px] uppercase tracking-widest"
                >
                  <FiRefreshCw className={loading ? "animate-spin" : ""} />
                  {loading ? "Syncing..." : "Refresh Stream"}
                </button>
            </div>
          </div>
        </div>

        {/* --- SEARCH & FILTERS BAR --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 relative group">
            <input
              type="text"
              placeholder="Filter by action, user or event type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold text-slate-600 placeholder:text-slate-300"
            />
            <FiSearch className="absolute right-4 -mt-10 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors text-xl" />
          </div>
          <div className="lg:col-span-4 flex gap-4">
             <div className="flex-1 bg-white border border-slate-100 rounded-[2rem] px-6 py-4 flex items-center justify-between shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Entries</span>
                <span className="text-lg font-black text-[#203871]">{filteredLogs.length}</span>
             </div>
          </div>
        </div>

        {/* --- AUDIT TABLE --- */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(32,56,113,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Activity Event</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Initiator</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Privilege</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Time Dimension</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-32 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-[#203871] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em]">Decrypting Logs...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-32 text-center">
                      <div className="flex flex-col items-center opacity-10">
                        <FiTerminal size={64} className="mb-4" />
                        <p className="font-black text-2xl uppercase tracking-widest">No Records Found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-blue-50/30 transition-all group">
                      {/* Action */}
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-[#203871] group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm">
                            <FiActivity size={20} />
                          </div>
                          <div>
                            <span className="text-sm font-black text-slate-700 block leading-tight tracking-tight">
                              {log.action}
                            </span>
                            <span className="text-[10px] text-blue-500 font-black uppercase tracking-tighter mt-1 block opacity-60 group-hover:opacity-100 transition-opacity">
                              {log._id.slice(-10).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* User */}
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 overflow-hidden border border-slate-200">
                             {log.performedBy?.avatar ? (
                               <img src={log.performedBy.avatar} alt="" className="w-full h-full object-cover" />
                             ) : (
                               <FiUser size={16} />
                             )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-600 tracking-tight">
                              {log.performedBy?.name || "Automated System"}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Performed By</span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-6">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border transition-all
                          ${log.role?.toLowerCase() === 'admin' 
                            ? 'bg-amber-50 text-amber-600 border-amber-100' 
                            : 'bg-blue-50 text-blue-600 border-blue-100'}
                        `}>
                          <FiShield size={12} className={log.role?.toLowerCase() === 'admin' ? "text-amber-500" : "text-blue-500"} />
                          {log.role || "Standard"}
                        </div>
                      </td>

                      {/* Time */}
                      <td className="px-6 py-6">
                        <div className="flex flex-col items-start bg-slate-50/80 rounded-2xl p-3 border border-slate-100 group-hover:bg-white group-hover:border-blue-100 transition-all">
                          <span className="flex items-center gap-2 text-slate-700 text-[13px] font-black tracking-tighter">
                            <FiClock className="text-blue-500" size={14} />
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                          <span className="text-[9px] text-slate-400 font-black uppercase mt-1 tracking-widest">
                            {new Date(log.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER */}
          {!loading && filteredLogs.length > 0 && (
            <div className="bg-slate-50/30 px-10 py-6 border-t border-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                   Live Integrity Verified
                 </span>
              </div>
              <span className="text-[10px] font-black text-[#203871] bg-blue-50 px-4 py-2 rounded-xl uppercase tracking-widest border border-blue-100">
                End of Audit Trail
              </span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>
    </div>
  );
}