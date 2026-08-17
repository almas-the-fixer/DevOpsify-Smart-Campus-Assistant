import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import {
  FiUser, FiMail, FiLock, FiArrowLeft, FiShield, 
  FiHash, FiLayers, FiGrid, FiChevronRight, FiCheckCircle, FiXCircle
} from "react-icons/fi";

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [rules, setRules] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get("/users/me").then((res) => {
      setForm({
        name: res.data.name || "",
        email: res.data.email || "",
        password: "",
      });
    });
  }, []);

  const validate = (v) => {
    setRules({
      length: v.length >= 8,
      capital: /[A-Z]/.test(v),
      number: /[0-9]/.test(v),
      special: /[^A-Za-z0-9]/.test(v),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "password") validate(value);
  };

  const valid = rules.length && rules.capital && rules.number && rules.special;

  const submit = async (e) => {
    e.preventDefault();
    if (form.password && !valid) return;
    setLoading(true);
    try {
      const res = await axios.put("/users/update-profile", {
        name: form.name,
        password: form.password || null,
      });
      setUser(res.data);
      navigate(-1);
    } catch {
      alert("Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faff] selection:bg-blue-100 -mt-14">
      {/* Background Decor (Matching Profile Page) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[-2%] w-[400px] h-[400px] bg-[#3b82f6]/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[5%] left-[18%] w-[500px] h-[500px] bg-[#203871]/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative pt-24 pb-20 px-4 max-w-5xl mx-auto">
        <div className="animate-slide-up">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div className="space-y-1">
             
              <h1 className="text-4xl font-black text-[#203871] tracking-tight">Edit Profile</h1>
            </div>
            <button 
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 px-6 py-3 bg-white text-[#203871] rounded-2xl font-bold text-sm shadow-sm border border-slate-100 hover:shadow-xl transition-all active:scale-95"
            >
              <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back
            </button>
          </div>

          <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Security Status */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#203871] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '20px 20px' }}></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                    <FiShield size={28} className="text-blue-300" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Identity Guard</h3>
                  <p className="text-blue-100/70 text-xs leading-relaxed font-medium">
                    Critical academic fields like Roll No and Semester are verified and locked to maintain database integrity.
                  </p>
                </div>
              </div>
{user?.role === "student" && (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_rgba(32,56,113,0.04)]">
    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-50 pb-4">
      Student Metadata
    </h4>

    <div className="space-y-6">
      <StaticRow label="Roll Number" value={user?.rollNo} icon={<FiHash />} />
      <StaticRow label="Current Sem" value={user?.semester} icon={<FiLayers />} />
      <StaticRow label="Division" value={user?.division} icon={<FiGrid />} />
    </div>
  </div>
)}

{user?.role === "teacher" && (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_rgba(32,56,113,0.04)]">
    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-50 pb-4">
      Teaching Profile
    </h4>

    <div className="space-y-6">
      <StaticRow label="Experience" value="5 Years" icon={<FiLayers />} />
      <StaticRow label="Subject" value={user?.subject || "1"} icon={<FiGrid />} />
      <StaticRow label="Rating" value="4.8 / 5" icon={<FiCheckCircle />} />
    </div>
  </div>
)}

{user?.role === "admin" && (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_rgba(32,56,113,0.04)]">
    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-50 pb-4">
      Admin Control
    </h4>

    <div className="space-y-6">
      <StaticRow label="Access Level" value="Super Admin" icon={<FiShield />} />
      <StaticRow label="System Role" value="Platform Manager" icon={<FiLayers />} />
      <StaticRow label="Permissions" value="Full Control" icon={<FiCheckCircle />} />
    </div>
  </div>
)}
            </div>

            {/* Right Column: Main Edit Form */}
            <div className="lg:col-span-8 bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-[0_20px_50px_rgba(32,56,113,0.06)] space-y-12">
              
              <div className="space-y-10">
                <FormSection title="Personal Information" color="blue" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup 
                    label="Full Name" 
                    icon={<FiUser />} 
                    name="name" 
                    value={form.name} 
                    onChange={handleChange} 
                    placeholder="John Doe"
                  />
                  <InputGroup 
                    label="Official Email" 
                    icon={<FiMail />} 
                    value={form.email} 
                    disabled 
                  />
                </div>
              </div>

              <div className="space-y-10">
                <FormSection title="Security Protocol" color="emerald" />
                <div className="space-y-6">
                  <InputGroup 
                    label="New Password" 
                    icon={<FiLock />} 
                    name="password" 
                    type="password" 
                    value={form.password} 
                    onChange={handleChange} 
                    placeholder="••••••••"
                  />
                  
                  {form.password && (
                    <div className="bg-[#f8faff] p-6 rounded-[2rem] border border-blue-50 grid grid-cols-2 gap-4 animate-in fade-in zoom-in duration-300">
                      <ValidationRule ok={rules.length} text="8+ Characters" />
                      <ValidationRule ok={rules.capital} text="Uppercase" />
                      <ValidationRule ok={rules.number} text="Contains Number" />
                      <ValidationRule ok={rules.special} text="Special Char" />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50">
                <button 
                  type="submit" 
                  disabled={(form.password && !valid) || loading}
                  className="w-full py-5 bg-[#203871] text-white rounded-[1.5rem] font-black text-lg hover:bg-[#3b82f6] shadow-xl shadow-blue-900/20 transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : "Update Profile Data"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* --- Sub-Components --- */

function FormSection({ title, color }) {
  const colorMap = {
    blue: "border-blue-500",
    emerald: "border-emerald-500"
  };
  return (
    <div className={`border-l-4 ${colorMap[color]} pl-4`}>
      <h2 className="text-sm font-black text-[#203871] uppercase tracking-[0.15em]">{title}</h2>
    </div>
  );
}

function InputGroup({ label, icon, ...props }) {
  return (
    <div className="group space-y-3">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="flex items-center gap-4 bg-[#f8faff] border border-slate-100 rounded-2xl px-5 py-2 focus-within:bg-white focus-within:border-[#3b82f6] focus-within:ring-4 focus-within:ring-[#3b82f6]/5 transition-all duration-300">
        <div className="text-slate-400 group-focus-within:text-[#3b82f6] transition-colors">
          {icon}
        </div>
        <div className="h-6 w-[1px] bg-slate-200"></div>
        <input
          {...props}
          className="w-full py-3 bg-transparent text-sm font-bold text-[#203871] outline-none placeholder:text-slate-300 disabled:text-slate-400"
        />
      </div>
    </div>
  );
}

function StaticRow({ label, value, icon }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="w-10 h-10 bg-[#f8faff] rounded-xl flex items-center justify-center text-[#3b82f6] group-hover:bg-[#3b82f6] group-hover:text-white transition-all duration-300 shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">{label}</p>
        <p className="text-sm font-black text-[#203871]">{value || "--"}</p>
      </div>
    </div>
  );
}

function ValidationRule({ ok, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${ok ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-slate-200'}`}>
        {ok ? <FiCheckCircle className="text-white" size={12} /> : <FiXCircle className="text-white" size={12} />}
      </div>
      <span className={`text-[10px] font-black uppercase tracking-tight ${ok ? 'text-emerald-700' : 'text-slate-400'}`}>{text}</span>
    </div>
  );
}