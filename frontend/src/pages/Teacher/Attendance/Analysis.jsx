import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { 
  FiPieChart, 
  FiFileText, 
  FiDownload, 
  FiCalendar, 
  FiBook, 
  FiFilter,
  FiChevronRight
} from "react-icons/fi";

export default function Analysis() {
  const [options, setOptions] = useState({});
  const [form, setForm] = useState({
    semester: "",
    subject: "",
    division: "",
    batchType: "",
    from: "",
    to: "",
  });

  /* Load Options */
  useEffect(() => {
    api.get("/teacher/attendance/analysis/options")
      .then(res => setOptions(res.data));
  }, []);

  /* Change */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  /* Download */
  const download = async (type) => {
    try {
      const res = await api.get(
        `/teacher/attendance/analysis/export/${type}`,
        {
          params: form,
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance_${form.division || "ALL"}.${type === "pdf" ? "pdf" : "xlsx"}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("No data / Export failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FF] p-4 md:p-10 animate-fade-in font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-[2rem] shadow-sm mb-6 text-blue-600">
            <FiPieChart size={32} />
          </div>
          <h2 className="text-4xl font-black text-[#1E3A8A] tracking-tight mb-2">Attendance Analytics</h2>
          <p className="text-slate-400 font-medium text-sm">
            Configure filters below to generate detailed division-wise reports
          </p>
        </div>

        {/* MAIN ANALYSIS CARD */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-blue-50 overflow-hidden">
          
          {/* Card Sub-header */}
          <div className="px-8 py-6 bg-slate-50/50 border-b border-blue-50 flex items-center gap-3 text-[#1E3A8A]">
            <FiFilter className="text-blue-500" />
            <span className="text-xs font-black uppercase tracking-widest">Report Configuration</span>
          </div>

          <div className="p-8 md:p-10">
            {/* FILTER GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              
              {/* Semester */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                  <FiChevronRight className="text-blue-500" /> Semester
                </label>
                <select
                  name="semester"
                  value={form.semester}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 text-[#1E3A8A] text-sm font-bold rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select Semester</option>
                  {options.semesters?.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                  <FiBook className="text-blue-500" /> Subject
                </label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 text-[#1E3A8A] text-sm font-bold rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="">All Subjects</option>
                  {options.subjects?.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Division */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                  <FiChevronRight className="text-blue-500" /> Division
                </label>
                <select
                  name="division"
                  value={form.division}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 text-[#1E3A8A] text-sm font-bold rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="">All Divisions</option>
                  {options.divisions?.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

<div className="space-y-2">
  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
    Batch
  </label>
  <select
    name="batchType"
    value={form.batchType}
    onChange={handleChange}
    className="w-full bg-slate-50 border border-slate-100 text-[#1E3A8A] text-sm font-bold rounded-2xl px-4 py-3"
  >
    <option value="">All Batches</option>
    <option value="NORMAL">Normal</option>
    <option value="OJT">OJT</option>
  </select>
</div>
              {/* Date From */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                  <FiCalendar className="text-blue-500" /> Date From
                </label>
                <input
                  type="date"
                  name="from"
                  value={form.from}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 text-[#1E3A8A] text-sm font-bold rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all cursor-pointer"
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                  <FiCalendar className="text-blue-500" /> Date To
                </label>
                <input
                  type="date"
                  name="to"
                  value={form.to}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 text-[#1E3A8A] text-sm font-bold rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all cursor-pointer"
                />
              </div>

            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-slate-100">
              <button
                onClick={() => download("pdf")}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-rose-50 text-rose-600 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white hover:shadow-lg hover:shadow-rose-200 transition-all duration-300"
              >
                <FiFileText size={18} /> Export PDF Report
              </button>

              <button
                onClick={() => download("excel")}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-[#1E3A8A] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all duration-300"
              >
                <FiDownload size={18} /> Export Excel Data
              </button>
            </div>
          </div>
        </div>

        {/* INFO FOOTER */}
        <p className="mt-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          The generated report will include student-wise percentage & total lectures.
        </p>
      </div>

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}