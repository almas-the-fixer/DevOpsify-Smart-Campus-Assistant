import { useState } from "react";
import api from "../../api/axios";
import { 
  X, Briefcase, IndianRupee, Calendar, Clock, Building2, Rocket, ShieldCheck 
} from "lucide-react";

export default function OjtFormModal({ userId, onClose, onSuccess }) {

  const [form, setForm] = useState({
    companyName: "",
    position: "",
    stipend: "",
    joiningDate: "",
    duration: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    setErrors(prev => ({
      ...prev,
      [e.target.name]: ""
    }));
  };

  const validateForm = () => {

    let newErrors = {};

    if (!form.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!form.position.trim()) {
      newErrors.position = "Position is required";
    }

    if (!form.stipend) {
      newErrors.stipend = "Stipend is required";
    }

    if (!form.duration.trim()) {
      newErrors.duration = "Duration is required";
    }

    if (!form.joiningDate) {
      newErrors.joiningDate = "Joining date is required";
    } else {

      const today = new Date().setHours(0,0,0,0);
      const selected = new Date(form.joiningDate).setHours(0,0,0,0);

      if (selected < today) {
        newErrors.joiningDate = "Past date is not allowed";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async () => {

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {

      await api.post("/admin/ojt/start", {
        studentId: userId,
        companyName: form.companyName,
        position: form.position,
        stipend: form.stipend,
        joiningDate: form.joiningDate,
        duration: form.duration
      });

      onSuccess();
      onClose();

    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-[#203871]/10">

      <div className="relative w-full max-w-[550px] bg-white rounded-[3rem] shadow-2xl shadow-blue-900/10 border border-slate-100 overflow-hidden animate-fade-in">

        {/* Header */}
        <div className="px-8 pt-10 pb-6 text-center border-b border-slate-50">

          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-[#203871] transition-all"
          >
            <X size={20} />
          </button>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 border bg-blue-50 border-blue-100 text-[#203871]">
            <Rocket size={14} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              OJT Initialization
            </span>
          </div>

          <h2 className="text-3xl font-black tracking-tight text-[#203871]">
            On-Job Training
          </h2>

          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">
            Deploy student to corporate system
          </p>

        </div>


        {/* Body */}
        <div className="p-8 space-y-5">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Company Name */}
            <div className="space-y-2 group">

              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Company Name
              </label>

              <div className="relative">
                <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                <input
                  name="companyName"
                  placeholder="e.g. Google India"
                  className="w-full rounded-[1.5rem] h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 outline-none font-bold text-sm"
                  value={form.companyName}
                  onChange={handleChange}
                />
              </div>

              {errors.companyName && (
                <p className="text-red-500 text-[11px] ml-2">{errors.companyName}</p>
              )}

            </div>


            {/* Position */}
            <div className="space-y-2 group">

              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Position / Role
              </label>

              <div className="relative">
                <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                <input
                  name="position"
                  placeholder="e.g. SDE Intern"
                  className="w-full rounded-[1.5rem] h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 outline-none font-bold text-sm"
                  value={form.position}
                  onChange={handleChange}
                />
              </div>

              {errors.position && (
                <p className="text-red-500 text-[11px] ml-2">{errors.position}</p>
              )}

            </div>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Stipend */}
            <div className="space-y-2 group">

              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Stipend (Monthly)
              </label>

              <div className="relative">
                <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                <input
                  name="stipend"
                  type="number"
                  placeholder="0.00"
                  className="w-full rounded-[1.5rem] h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 outline-none font-bold text-sm"
                  value={form.stipend}
                  onChange={handleChange}
                />
              </div>

              {errors.stipend && (
                <p className="text-red-500 text-[11px] ml-2">{errors.stipend}</p>
              )}

            </div>


            {/* Duration */}
            <div className="space-y-2 group">

              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Duration
              </label>

              <div className="relative">
                <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                <input
                  name="duration"
                  placeholder="e.g. 6 Months"
                  className="w-full rounded-[1.5rem] h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 outline-none font-bold text-sm"
                  value={form.duration}
                  onChange={handleChange}
                />
              </div>

              {errors.duration && (
                <p className="text-red-500 text-[11px] ml-2">{errors.duration}</p>
              )}

            </div>

          </div>


          {/* Joining Date */}
          <div className="space-y-2 group">

            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
              Joining Date
            </label>

            <div className="relative">
              <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
              <input
                name="joiningDate"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-[1.5rem] h-14 pl-12 pr-6 bg-slate-50 border border-slate-100 outline-none font-bold text-sm appearance-none"
                value={form.joiningDate}
                onChange={handleChange}
              />
            </div>

            {errors.joiningDate && (
              <p className="text-red-500 text-[11px] ml-2">{errors.joiningDate}</p>
            )}

          </div>

        </div>


        {/* Footer */}
        <div className="px-8 pb-12 pt-4 flex flex-col-reverse sm:flex-row gap-3">

          <button 
            onClick={onClose}
            className="flex-1 h-14 rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-[#203871] hover:bg-slate-50 transition-all"
          >
            Cancel Mission
          </button>

          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-[1.5] h-14 bg-[#203871] hover:bg-blue-800 text-white rounded-[1.2rem] shadow-xl shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-3 group disabled:opacity-50"
          >

            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
            ) : (
              <>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  Deploy to OJT
                </span>
                <ShieldCheck size={18}/>
              </>
            )}

          </button>

        </div>

      </div>
    </div>
  );
}