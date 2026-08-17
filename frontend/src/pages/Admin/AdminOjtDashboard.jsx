import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import { 
  Users, Building2, LayoutDashboard, Search, Download, 
  CheckCircle2, History, Filter, Banknote, GraduationCap, ChevronRight, Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminOjtDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ activeCount: 0, completedCount: 0, totalCount: 0 });
  const [list, setList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  // Initial Filter State
  const initialFilters = {
    sortBy: "", division: "", semester: "", 
    startGt: "", startLt: "", endGt: "", endLt: ""
  };

  const [filters, setFilters] = useState(initialFilters);

  // RESET LOGIC: Jab filter panel band ho, filters reset ho jayein
  useEffect(() => {
    if (!showFilter) {
      setFilters(initialFilters);
    }
  }, [showFilter]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/admin/ojt/dashboard");
        setStats({
          activeCount: res.data.activeCount || 0,
          completedCount: res.data.completedCount || 0,
          totalCount: res.data.totalCount || 0
        });
        setList(res.data.list || []);
      } catch (err) { console.error("Dashboard load failed"); }
    };
    load();
  }, []);

  // Automatic unique values for filters
  const uniqueDivisions = useMemo(() => [...new Set(list.map(item => item.studentId?.division).filter(Boolean))], [list]);
  const uniqueSemesters = useMemo(() => [...new Set(list.map(item => item.studentId?.semester).filter(Boolean))], [list]);

  // Filter & Sort Logic
  const filteredList = useMemo(() => {
    let result = list.filter((item) =>
      item.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filters.division) result = result.filter(i => i.studentId?.division === filters.division);
    if (filters.semester) result = result.filter(i => String(i.studentId?.semester) === String(filters.semester));
    if (filters.startGt) result = result.filter(i => new Date(i.joiningDate) >= new Date(filters.startGt));
    if (filters.startLt) result = result.filter(i => new Date(i.joiningDate) <= new Date(filters.startLt));
    
    // Sorting logic
    const sorted = [...result];
    if (filters.sortBy === "company-asc") sorted.sort((a, b) => a.companyName.localeCompare(b.companyName));
    if (filters.sortBy === "company-desc") sorted.sort((a, b) => b.companyName.localeCompare(a.companyName));
    if (filters.sortBy === "student-asc") sorted.sort((a, b) => a.studentId.name.localeCompare(b.studentId.name));
    if (filters.sortBy === "student-desc") sorted.sort((a, b) => b.studentId.name.localeCompare(a.studentId.name));
    if (filters.sortBy === "stipend-high") sorted.sort((a, b) => (b.stipend || 0) - (a.stipend || 0));
    if (filters.sortBy === "stipend-low") sorted.sort((a, b) => (a.stipend || 0) - (b.stipend || 0));

    return sorted;
  }, [list, searchTerm, filters]);

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-8 font-sans text-[#1E293B]">
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-[#203871] rounded-lg text-white"><LayoutDashboard size={16} /></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admin Console</span>
          </div>
          <h1 className="text-4xl font-black text-[#203871] tracking-tight">OJT Analytics</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              placeholder="Search students..."
              value={searchTerm}
              className="pl-11 pr-4 h-12 w-full md:w-72 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-[#203871] font-medium text-sm transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowFilter(!showFilter)} 
            className={`p-3 rounded-2xl shadow-sm transition-all ${showFilter ? 'bg-[#203871] text-white ring-4 ring-blue-100' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            <Filter size={20} />
          </button>
          <button onClick={() => navigate("/admin/ojt/ojthistory")} className="h-12 px-5 bg-white border border-slate-200 rounded-2xl flex items-center gap-2 font-bold text-sm text-[#203871] hover:bg-slate-50 transition-all shadow-sm">
            <History size={18} />
            <span className="hidden sm:inline">History</span>
          </button>
          <button className="h-12 px-4 bg-[#203871] text-white rounded-2xl shadow-lg shadow-blue-900/20 hover:scale-105 transition-transform"><Download size={18} /></button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Advanced Filter Panel */}
        {showFilter && (
          <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-blue-50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-400 px-1">Sort Registry</label>
              <select value={filters.sortBy} className="w-full h-11 px-3 rounded-xl bg-slate-50 border-none text-sm font-bold outline-none cursor-pointer" onChange={(e) => setFilters({...filters, sortBy: e.target.value})}>
                <option value="">Default View</option>
                <option value="student-asc">Student Name(A to Z)</option>
                <option value="student-desc">Student Name(Z to A)</option>
                <option value="company-asc">Company Name(A to Z)</option>
                <option value="company-desc">Company Name(Z to A)</option>
                <option value="stipend-high">Stipend Wise(High to Low)</option>
                <option value="stipend-low">Stipend Wise(Low to High)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-400 px-1">Division</label>
              <select value={filters.division} className="w-full h-11 px-3 rounded-xl bg-slate-50 border-none text-sm font-bold outline-none cursor-pointer" onChange={(e) => setFilters({...filters, division: e.target.value})}>
                <option value="">All Divisions</option>
                {uniqueDivisions.map(div => <option key={div} value={div}>{div}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-400 px-1">Semester</label>
              <select value={filters.semester} className="w-full h-11 px-3 rounded-xl bg-slate-50 border-none text-sm font-bold outline-none cursor-pointer" onChange={(e) => setFilters({...filters, semester: e.target.value})}>
                <option value="">All Semesters</option>
                {uniqueSemesters.map(sem => <option key={sem} value={sem}>Sem {sem}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-400 px-1">Joined After</label>
              <input 
                type="date" 
                value={filters.startGt}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 text-xs font-bold border-none outline-none" 
                onChange={(e) => setFilters({...filters, startGt: e.target.value})} 
              />
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Candidates" value={stats.totalCount} icon={<GraduationCap size={28}/>} color="text-purple-600" bg="bg-purple-50" />
          <StatCard title="Active On-Site" value={stats.activeCount} icon={<Users size={28}/>} color="text-blue-600" bg="bg-blue-50" />
          <StatCard title="Successful OJT" value={stats.completedCount} icon={<CheckCircle2 size={28}/>} color="text-emerald-600" bg="bg-emerald-50" />
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-widest">Deployment Registry</h3>
            <span className="text-[10px] font-bold bg-white border border-slate-100 px-3 py-1 rounded-full text-slate-500">
              {filteredList.length} Records Found
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 bg-slate-50/50">Student Info</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 bg-slate-50/50 text-center">Academic Unit</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 bg-slate-50/50">Company</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 bg-slate-50/50">Stipend</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 bg-slate-50/50">Joining Date</th>
                  <th className="px-8 py-5 bg-slate-50/50"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredList.map((o) => (
                  <tr key={o._id} onClick={() => navigate(`/admin/ojt/${o._id}`)} className="group hover:bg-slate-50/80 transition-all cursor-pointer">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#203871] text-white flex items-center justify-center font-black text-xs shadow-sm shadow-blue-900/10">
                          {o.studentId.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-sm text-[#203871] group-hover:underline decoration-2 underline-offset-2">{o.studentId.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight italic">Verified Candidate</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="inline-block">
                        <p className="text-xs font-black text-slate-700">DIV {o.studentId.division}</p>
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">SEM {o.studentId.semester}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-100 rounded-lg text-slate-400 group-hover:text-[#203871] group-hover:bg-blue-50 transition-colors">
                          <Building2 size={14} />
                        </div>
                        <p className="font-bold text-sm text-slate-700">{o.companyName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 font-black text-[#203871]">
                        <Banknote size={14} className="text-emerald-500" />
                        <span className="text-sm">₹{o.stipend?.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar size={14} className="text-slate-300" />
                        <span className="text-xs font-bold">
                          {new Date(o.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="p-2 rounded-xl text-slate-300 group-hover:text-[#203871] group-hover:bg-white group-hover:shadow-sm transition-all inline-block">
                        <ChevronRight size={20} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredList.length === 0 && (
            <div className="p-24 text-center">
              <div className="inline-block p-4 rounded-full bg-slate-50 text-slate-300 mb-4">
                <Search size={40} />
              </div>
              <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">No matching records found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, bg }) {
  return (
    <div className="bg-white p-6 rounded-[2.2rem] shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md hover:scale-[1.02] transition-all duration-300">
      <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center shadow-inner`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{title}</p>
        <h2 className="text-3xl font-black text-[#203871]">{value}</h2>
      </div>
    </div>
  );
}