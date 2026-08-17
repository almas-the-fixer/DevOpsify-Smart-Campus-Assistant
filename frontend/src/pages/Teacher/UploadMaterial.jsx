import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";
import { 
  FiUploadCloud, 
  FiFile, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiBookOpen, 
  FiInfo 
} from "react-icons/fi";

export default function UploadMaterial() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const subject = state?.subject || "";
  const semester = state?.semester || "";

  const [form, setForm] = useState({
    title: subject ? `${subject} Notes` : "",
    description: "",
  });

  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const validate = () => {
    const err = {};
    if (!form.title.trim()) err.title = "Please provide a catchy title";
    if (!file) err.file = "Document file is required";
    return err;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length) {
      setErrors(err);
      return;
    }

    setErrors({});
    const data = new FormData();
    data.append("title", form.title);
    data.append("description", form.description);
    data.append("subject", subject);
    data.append("semester", semester);
    data.append("file", file);

    try {
      setLoading(true);
      await api.post("/materials/upload", data);
      setSuccess("Material uploaded successfully!");
      setTimeout(() => navigate("/teacher/materials"), 1200);
    } catch {
      setErrors({ api: "System error. Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4FF] flex items-center justify-center p-4 md:p-8 font-sans -mt-10">
      <div className="w-full max-w-2xl animate-fade-in">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl shadow-blue-200/50 mb-4 text-blue-600">
            <FiUploadCloud size={32} />
          </div>
          <h2 className="text-3xl font-black text-[#1E3A8A] tracking-tight">Post Study Material</h2>
          <p className="text-blue-400 font-medium">Share resources with your students</p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-blue-50 overflow-hidden"
        >
          {/* Top Context Bar */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-white">
              <FiBookOpen className="opacity-70" />
              <span className="text-sm font-bold uppercase tracking-wider">{subject}</span>
            </div>
            <div className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-white text-xs font-black uppercase tracking-widest">
              Sem {semester}
            </div>
          </div>

          <div className="p-8 md:p-10 space-y-6">
            
            {/* Title Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 ml-1">Document Title</label>
              <div className="relative">
                <input
                  name="title"
                  placeholder="e.g., Unit 1 Introduction"
                  value={form.title}
                  onChange={handleChange}
                  className={`w-full pl-4 pr-4 py-4 bg-blue-50/50 border rounded-2xl outline-none transition-all font-bold text-[#1E3A8A] placeholder:text-blue-200 ${errors.title ? 'border-rose-300 ring-4 ring-rose-50' : 'border-blue-100 focus:border-blue-500 focus:bg-white'}`}
                />
                {errors.title && <FiAlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500" />}
              </div>
              {errors.title && <p className="text-rose-500 text-[10px] font-bold ml-1 uppercase">{errors.title}</p>}
            </div>

            {/* Description Area */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 ml-1">Context (Optional)</label>
              <textarea
                name="description"
                placeholder="Briefly describe what this file contains..."
                value={form.description}
                onChange={handleChange}
                className="w-full px-4 py-4 bg-blue-50/50 border border-blue-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm h-32 resize-none font-medium text-slate-600"
              />
            </div>

            {/* File Dropzone Style */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 ml-1">Select Document</label>
              <div className={`relative group border-2 border-dashed rounded-[2rem] transition-all p-8 flex flex-col items-center justify-center ${file ? 'border-emerald-200 bg-emerald-50/30' : 'border-blue-100 bg-blue-50/30 hover:border-blue-300'}`}>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                {file ? (
                  <div className="flex flex-col items-center animate-bounce-short">
                    <FiFile className="text-emerald-500 mb-2" size={32} />
                    <span className="text-sm font-bold text-emerald-700">{file.name}</span>
                    <span className="text-[10px] text-emerald-400 uppercase font-black tracking-widest mt-1">Ready to sync</span>
                  </div>
                ) : (
                  <>
                    <FiUploadCloud className="text-blue-300 group-hover:text-blue-500 transition-colors mb-2" size={40} />
                    <span className="text-sm font-bold text-blue-400">Drop PDF or Click to Browse</span>
                    <span className="text-[10px] text-blue-300 mt-1 uppercase tracking-tighter italic">Max Size: 20MB</span>
                  </>
                )}
              </div>
              {errors.file && <p className="text-rose-500 text-[10px] font-bold ml-1 uppercase mt-2">{errors.file}</p>}
            </div>

            {/* API Error & Success */}
            {(errors.api || success) && (
              <div className={`p-4 rounded-xl flex items-center gap-3 animate-fade-in ${success ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-500 border border-rose-100'}`}>
                {success ? <FiCheckCircle /> : <FiAlertCircle />}
                <p className="text-xs font-black uppercase tracking-widest">{success || errors.api}</p>
              </div>
            )}

            {/* Action Button */}
            <button 
              disabled={loading}
              className={`w-full py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm transition-all shadow-lg active:scale-[0.98] ${loading ? 'bg-slate-200 text-slate-400' : 'bg-[#1E3A8A] text-white hover:bg-blue-700 shadow-blue-500/20'}`}
            >
              {loading ? "Optimizing Upload..." : "Finalize & Post"}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce-short { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        .animate-bounce-short { animation: bounce-short 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}