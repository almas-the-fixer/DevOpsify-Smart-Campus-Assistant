import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { 
  Building2, Calendar, IndianRupee, Clock, 
  ChevronLeft, Save, X, Briefcase, ShieldCheck, AlertCircle 
} from "lucide-react";

export default function AdminOjtEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    companyName: "",
    position: "",
    stipend: "",
    duration: "",
    joiningDate: "",
    status: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/admin/ojt/${id}`)
      .then(res => {
        const d = res.data;
        setFormData({
          companyName: d.companyName,
          position: d.position,
          stipend: d.stipend,
          duration: d.duration,
          joiningDate: d.joiningDate.split('T')[0], // Date format for input
          status: d.status
        });
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch record");
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/admin/ojt/${id}`, formData);
      navigate(-1); // Go back after success
    } catch (err) {
      setError("Failed to update deployment details");
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="w-10 h-10 border-4 border-blue-100 border-t-[#203871] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10 font-sans text-[#203871]">
      
      <div className="max-w-4xl mx-auto">
        {/* Top Actions */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-[#203871] transition-colors"
          >
            <ChevronLeft size={18} /> Discard Changes
          </button>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border bg-amber-50 border-amber-100 text-amber-700">
            <AlertCircle size={14} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Editing Mode</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-blue-900/5 overflow-hidden animate-fade-in">
          
          {/* Header Info */}
          <div className="bg-[#203871] p-10 text-white">
            <div className="flex items-center gap-4 mb-2">
               <ShieldCheck size={18} className="text-blue-400" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200">System Override</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Modify Deployment</h1>
            <p className="text-xs font-bold opacity-60 uppercase tracking-widest mt-2 px-1">Record ID: {id}</p>
          </div>

          <div className="p-10 md:p-14 space-y-10">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-black uppercase tracking-widest flex items-center gap-3">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              
              {/* Company Name */}
              <div className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Company Entity</label>
                <div className="relative">
                  <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#203871] transition-colors" size={18} />
                  <input
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full rounded-2xl h-14 pl-12 pr-6 bg-slate-50 border border-slate-100 outline-none transition-all font-bold text-sm focus:bg-white focus:border-[#203871] focus:shadow-lg focus:shadow-blue-900/5"
                  />
                </div>
              </div>

              {/* Position */}
              <div className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Assigned Role</label>
                <div className="relative">
                  <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#203871] transition-colors" size={18} />
                  <input
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full rounded-2xl h-14 pl-12 pr-6 bg-slate-50 border border-slate-100 outline-none transition-all font-bold text-sm focus:bg-white focus:border-[#203871] focus:shadow-lg focus:shadow-blue-900/5"
                  />
                </div>
              </div>

              {/* Stipend */}
              <div className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Monthly Stipend (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#203871] transition-colors" size={18} />
                  <input
                    name="stipend"
                    type="number"
                    value={formData.stipend}
                    onChange={handleChange}
                    className="w-full rounded-2xl h-14 pl-12 pr-6 bg-slate-50 border border-slate-100 outline-none transition-all font-bold text-sm focus:bg-white focus:border-[#203871] focus:shadow-lg focus:shadow-blue-900/5"
                  />
                </div>
              </div>

              {/* Status Select */}
              <div className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Deployment Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-2xl h-14 px-6 bg-slate-50 border border-slate-100 outline-none transition-all font-black text-[10px] uppercase tracking-[0.2em] focus:bg-white focus:border-[#203871]"
                >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>

              {/* Joining Date */}
              <div className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Joining Date</label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#203871] transition-colors" size={18} />
                  <input
                    name="joiningDate"
                    type="date"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    className="w-full rounded-2xl h-14 pl-12 pr-6 bg-slate-50 border border-slate-100 outline-none transition-all font-bold text-sm focus:bg-white focus:border-[#203871]"
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Contract Duration</label>
                <div className="relative">
                  <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#203871] transition-colors" size={18} />
                  <input
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full rounded-2xl h-14 pl-12 pr-6 bg-slate-50 border border-slate-100 outline-none transition-all font-bold text-sm focus:bg-white focus:border-[#203871]"
                  />
                </div>
              </div>
            </div>

            {/* Form Footer */}
            <div className="pt-10 border-t border-slate-50 flex flex-col sm:flex-row gap-4">
              <button 
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 h-16 rounded-2xl border border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <X size={18} /> Cancel mission
              </button>
              <button 
                type="submit"
                disabled={saving}
                className="flex-[1.5] bg-[#203871] hover:bg-blue-800 text-white h-16 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={18} /> Commit changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fade-in { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}