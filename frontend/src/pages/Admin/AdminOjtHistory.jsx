import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import { 
  History, Building2, Calendar, User, Search, 
  CheckCircle2, Clock, Filter, ArrowUpRight ,ChevronLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminOjtHistory() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  // Filter States
  const initialFilters = {
    status: "",
    division: "",
    semester: "",
  };
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    api.get("/admin/ojt/ojthistory")
      .then(res => setRecords(res.data))
      .catch(err => console.error("History fetch failed"));
  }, []);

  // Reset filters when panel is closed
  useEffect(() => {
    if (!showFilter) setFilters(initialFilters);
  }, [showFilter]);

  // Unique values for dropdowns
  const uniqueDivisions = useMemo(() => [...new Set(records.map(r => r.studentId?.division).filter(Boolean))], [records]);
  const uniqueSemesters = useMemo(() => [...new Set(records.map(r => r.studentId?.semester).filter(Boolean))], [records]);

  // Combined Search & Filter Logic
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = 
        r.studentId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.companyName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filters.status ? r.status === filters.status : true;
      const matchesDivision = filters.division ? r.studentId?.division === filters.division : true;
      const matchesSemester = filters.semester ? String(r.studentId?.semester) === String(filters.semester) : true;

      return matchesSearch && matchesStatus && matchesDivision && matchesSemester;
    });
  }, [records, searchTerm, filters]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-[#203871]">
      <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-[#203871] transition-colors"
          >
            <ChevronLeft size={18} /> Back To Dashboard
          </button>
       
        </div>
      {/* --- Header Section --- */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-[#203871]">
              <History size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Archive Logs</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-[#203871]">Placement History</h1>
        </div>

        {/* Search & Filter Trigger */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#203871] transition-colors" size={18} />
            <input 
              type="text"
              value={searchTerm}
              placeholder="Search history records..."
              className="w-full pl-12 pr-6 h-14 rounded-2xl bg-white border border-slate-200 outline-none focus:border-[#203871] focus:shadow-xl focus:shadow-blue-900/5 transition-all font-bold text-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className={`p-4 rounded-2xl border transition-all shadow-sm ${showFilter ? 'bg-[#203871] text-white border-[#203871]' : 'bg-white text-slate-400 border-slate-200 hover:text-[#203871]'}`}
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* --- Filter Panel --- */}
        {showFilter && (
          <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-blue-50 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 px-1">Status</label>
              <select 
                value={filters.status}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border-none text-xs font-bold outline-none cursor-pointer"
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="">All Status</option>
                <option value="COMPLETED">Completed</option>
                <option value="Active">Active</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 px-1">Division</label>
              <select 
                value={filters.division}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border-none text-xs font-bold outline-none cursor-pointer"
                onChange={(e) => setFilters({...filters, division: e.target.value})}
              >
                <option value="">All Divisions</option>
                {uniqueDivisions.map(div => <option key={div} value={div}>{div}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 px-1">Semester</label>
              <select 
                value={filters.semester}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border-none text-xs font-bold outline-none cursor-pointer"
                onChange={(e) => setFilters({...filters, semester: e.target.value})}
              >
                <option value="">All Semesters</option>
                {uniqueSemesters.map(sem => <option key={sem} value={sem}>Sem {sem}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* --- History Table Card --- */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-blue-900/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Student Entity</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Corporate Assignment</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Timeline</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Final Status</th>
                  <th className="px-8 py-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRecords.map((r) => (
                  <tr
                    key={r._id}
                    onClick={() => navigate(`/admin/ojt/${r._id}`)}
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                  >
                    {/* Student Info */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#203871] font-black text-xs">
                          {r.studentId?.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-sm tracking-tight group-hover:text-blue-600 transition-colors">{r.studentId?.name || "Unknown Student"}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DIV: {r.studentId?.division || "N/A"}</p>
                        </div>
                      </div>
                    </td>

                    {/* Company Info */}
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-bold text-sm text-[#203871]">
                          <Building2 size={14} className="text-blue-500" />
                          {r.companyName}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter pl-5">{r.position}</p>
                      </div>
                    </td>

                    {/* Timeline Info */}
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <Calendar size={12} className="text-slate-300" />
                          <span>{new Date(r.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          <span className="text-slate-300 mx-1">→</span>
                          <span className={r.endDate ? 'text-slate-600' : 'text-blue-500 italic'}>
                            {r.endDate ? new Date(r.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "Ongoing"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                        r.status === 'Completed' 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                        : 'bg-blue-50 border-blue-100 text-blue-600'
                      }`}>
                        {r.status === 'Completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {r.status}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-8 py-6 text-right">
                      <button className="p-3 rounded-2xl bg-slate-50 text-slate-400 group-hover:text-[#203871] group-hover:bg-white group-hover:shadow-md transition-all group-hover:translate-x-1">
                        <ArrowUpRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="p-24 text-center">
              <div className="inline-flex p-6 bg-slate-50 rounded-[2rem] mb-6 text-slate-300">
                <History size={48} />
              </div>
              <h3 className="font-black text-slate-400 uppercase tracking-[0.3em] text-sm">No Records Found</h3>
              <p className="text-xs text-slate-300 mt-2 font-bold uppercase">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}