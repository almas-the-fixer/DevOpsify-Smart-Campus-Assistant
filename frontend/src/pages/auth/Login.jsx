import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiArrowRight 
} from "react-icons/fi";
import { Sun, Moon, LayoutDashboard, ShieldCheck } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid format";
    }
    if (!password.trim()) {
      newErrors.password = "Key is required";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const data = await login(email, password);
      const user = data.user;
      if (!user.isActive) {
        setAuthError("Account restricted. Contact admin.");
        return;
      }
      user.isFirstLogin ? navigate("/change-password") : navigate(`/${user.role}`);
    } catch (err) {
      setAuthError(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen selection:bg-[#203871] selection:text-white transition-colors duration-500 font-sans ${
      isDarkMode ? 'bg-[#030712] text-slate-100' : 'bg-[#F8FAFC] text-[#203871]'
    }`}>
      
      {/* --- Navigation --- */}
      <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? (isDarkMode ? 'bg-[#030712]/80 border-b border-slate-800' : 'bg-white/70 border-b border-slate-200 shadow-sm') 
          : 'bg-transparent'
      } backdrop-blur-md py-5`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-[#203871] rounded-xl flex items-center justify-center text-white shadow-lg rotate-3 group-hover:rotate-0 transition-all">
              <LayoutDashboard size={20} />
            </div>
            <span className="font-black text-2xl tracking-tighter">
              Smart Campus Assistant<span className="text-blue-500"></span>
            </span>
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2.5 rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 text-yellow-400' : 'bg-white border-slate-200 text-[#203871] shadow-sm'}`}>
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>

      <div className="relative flex items-center justify-center px-6 min-h-screen pt-24 pb-12">
        
      
        <div className="w-full max-w-[480px] z-10 animate-fade-in">
          
          {/* Back Button */}
          <button
            onClick={() => navigate("/")}
            className={`flex items-center gap-2 px-5 py-2.5 mb-8 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all
            ${isDarkMode ? "border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white" : "bg-white border-slate-200 text-slate-500 hover:text-[#203871] shadow-sm hover:shadow-md"}`}
          >
            <FiArrowRight className="rotate-180" size={16} />
            Go to Home
          </button>

          <div className={`rounded-[3rem] p-10 md:p-12 shadow-2xl transition-all duration-500 border ${
            isDarkMode ? 'bg-slate-900/80 border-slate-800 backdrop-blur-xl shadow-black/40' : 'bg-white border-slate-100 shadow-blue-900/5'
          }`}>
            
            <header className="text-center mb-10">
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 border ${
                isDarkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-[#203871]'
              }`}>
                <ShieldCheck size={14} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Faculty Portal</span>
              </div>
              <h2 className={`text-4xl font-black tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-[#203871]'}`}>Login Hub</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Institutional access only</p>
            </header>

            {authError && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-8 animate-shake text-[10px] font-black uppercase tracking-wider">
                <FiAlertCircle className="text-lg shrink-0" />
                {authError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              
              {/* EMAIL FIELD */}
              <div className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 group-focus-within:text-[#203871] transition-colors">
                  Official Email
                </label>
                
                <div className="relative ">
                   <FiMail className="absolute top-1/2 ml-3 -translate-y-1/2 text-slate-400 group-focus-within:text-[#203871] transition-colors z-10" size={18} />
                 <input
                    type="email"
                    placeholder="name@university.edu.in"
                    className={`w-full rounded-[1.5rem] h-16 pl-14 pr-6 outline-none transition-all font-bold text-sm border ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-[#203871] placeholder-slate-600 focus:border-blue-500' 
                        : 'bg-slate-50 border-slate-100 text-[#203871] placeholder-slate-400 focus:bg-white focus:border-[#203871] focus:shadow-xl focus:shadow-blue-900/5'
                    } ${errors.email ? '!border-red-500 bg-red-50/50' : ''}`}
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: "" }); }}
                  />
                </div>
                {errors.email && <p className="text-[9px] font-black text-red-500 ml-4 uppercase tracking-tighter">{errors.email}</p>}
              </div>

              {/* PASSWORD FIELD */}
              <div className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 group-focus-within:text-[#203871] transition-colors">
                  Access Key
                </label>
               
                  <div className="relative "> 
                   
                   <FiLock className="absolute top-1/2 ml-3 -translate-y-1/2 text-slate-400 group-focus-within:text-[#203871] transition-colors z-10" size={18} />
                   <input type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full rounded-[1.5rem] h-16 pl-14 pr-14 outline-none transition-all font-bold text-sm border ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-[#203871] placeholder-slate-600 focus:border-blue-500' 
                        : 'bg-slate-50 border-slate-100 text-[#203871] placeholder-slate-400 focus:bg-white focus:border-[#203871] focus:shadow-xl focus:shadow-blue-900/5'
                    } ${errors.password ? '!border-red-500 bg-red-50/50' : ''}`}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: "" }); }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-400 hover:text-[#203871] transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-[9px] font-black text-red-500 ml-4 uppercase tracking-tighter">{errors.password}</p>}
              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#203871] hover:bg-blue-800 disabled:opacity-50 text-white font-black h-16 rounded-[1.5rem] shadow-xl shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-3 mt-8 group"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="tracking-[0.3em] text-[10px] uppercase">Authorize & Enter</span>
                    <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-6 border-t border-slate-100 text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">
                LJ University Assistant v2.0
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in { 
          from { opacity: 0; transform: translateY(40px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes shake { 
          0%, 100% { transform: translateX(0); } 
          25% { transform: translateX(-5px); } 
          75% { transform: translateX(5px); } 
        }
        .animate-fade-in { animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
}