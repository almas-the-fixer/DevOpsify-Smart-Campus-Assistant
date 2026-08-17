import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  FiLock,
  FiShield,
  FiAlertCircle,
  FiCheckCircle,
  FiArrowRight,
  FiEye,
  FiEyeOff
} from "react-icons/fi";
import { Sun, Moon, LayoutDashboard } from "lucide-react";

export default function ChangePassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1)
      return { label: "Weak", color: "bg-red-500", width: "33%", text: "text-red-500" };
    if (score <= 3)
      return { label: "Strong", color: "bg-amber-500", width: "66%", text: "text-amber-500" };
    return { label: "Excellent", color: "bg-emerald-500", width: "100%", text: "text-emerald-500" };
  };

  const strength = password ? getStrength(password) : null;

  const validate = () => {
    if (password.length < 8) return "Min 8 characters required";
    if (!/[A-Z]/.test(password)) return "Capital letter missing";
    if (!/[0-9]/.test(password)) return "Number missing";
    if (!/[^A-Za-z0-9]/.test(password)) return "Special character missing";
    if (password !== confirm) return "Passwords don't match";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const err = validate();
    if (err) return setError(err);

    try {
      setLoading(true);
      await api.put("/users/change-password", { newPassword: password });

      const user = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, isFirstLogin: false })
      );

      navigate(`/${user.role}`);
    } catch (err) {
      setError("Update failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen selection:bg-[#203871] selection:text-white transition-colors duration-500 font-sans ${
      isDarkMode ? "bg-[#030712] text-slate-100" : "bg-[#F8FAFC] text-[#203871]"
    }`}>

      {/* NAVBAR */}
      <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? (isDarkMode
            ? "bg-[#030712]/80 border-b border-slate-800"
            : "bg-white/70 border-b border-slate-200 shadow-sm")
          : "bg-transparent"
      } backdrop-blur-md py-5`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 bg-[#203871] rounded-xl flex items-center justify-center text-white shadow-lg rotate-3 group-hover:rotate-0 transition-all">
              <LayoutDashboard size={20} />
            </div>
            <span className="font-black text-2xl tracking-tighter">
              Smart Campus Assistant
            </span>
          </div>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2.5 rounded-2xl border transition-all ${
              isDarkMode
                ? "bg-slate-900 border-slate-800 text-yellow-400"
                : "bg-white border-slate-200 text-[#203871] shadow-sm"
            }`}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="relative flex items-center justify-center px-6 min-h-screen pt-24 pb-12">
        <div className="w-full max-w-[480px] z-10 animate-fade-in">
            <button
            onClick={() => navigate("/")}
            className={`flex items-center gap-2 px-5 py-2.5 mb-8 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all
            ${isDarkMode ? "border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white" : "bg-white border-slate-200 text-slate-500 hover:text-[#203871] shadow-sm hover:shadow-md"}`}
          >
            <FiArrowRight className="rotate-180" size={16} />
            Go to Home
          </button>
          <div className={`rounded-[3rem] p-10 md:p-12 shadow-2xl transition-all duration-500 border ${
            isDarkMode 
              ? "bg-slate-900/80 border-slate-800 backdrop-blur-xl shadow-black/40" 
              : "bg-white border-slate-100 shadow-blue-900/5"
          }`}>

            {/* HEADER */}
            <header className="text-center mb-10">
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 border ${
                isDarkMode 
                  ? "bg-blue-500/10 border-blue-500/20 text-blue-400" 
                  : "bg-blue-50 border-blue-100 text-[#203871]"
              }`}>
                <FiShield size={14} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  Security Activation
                </span>
              </div>

              <h2 className={`text-4xl font-black tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-[#203871]'}`}>
                Set Access Key
              </h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                Create a secure password for your account
              </p>
            </header>

            {/* ERROR */}
            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-8 animate-shake text-[10px] font-black uppercase tracking-wider">
                <FiAlertCircle className="text-lg shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* NEW PASSWORD */}
              <div className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 group-focus-within:text-[#203871] transition-colors">
                  New Password
                </label>
                <FiLock className="absolute mt-10 -translate-y-1/2 text-slate-400 group-focus-within:text-[#203871] transition-colors z-10" size={18} />
                
                <div className="relative ml-10">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full rounded-[1.5rem] h-16 pl-14 pr-14 outline-none transition-all font-bold text-sm border ${
                      isDarkMode
                        ? "bg-slate-950 border-slate-800 text-[#203871] placeholder-slate-600 focus:border-blue-500"
                        : "bg-slate-50 border-slate-100 text-[#203871] placeholder-slate-400 focus:bg-white focus:border-[#203871] focus:shadow-xl focus:shadow-blue-900/5"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-400 hover:text-[#203871]"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>

                {strength && (
                  <div className="mt-4 px-2 ml-10">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-2">
                      <span className={strength.text}>{strength.label} Strength</span>
                      <FiCheckCircle size={10} className={strength.text} />
                    </div>
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-500 ${strength.color}`} style={{ width: strength.width }} />
                    </div>
                  </div>
                )}
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 group-focus-within:text-[#203871] transition-colors">
                  Verify Password
                </label>
                <FiLock className="absolute mt-10 -translate-y-1/2 text-slate-400 group-focus-within:text-[#203871] transition-colors z-10" size={18} />
                
                <div className="relative ml-10">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={`w-full rounded-[1.5rem] h-16 pl-14 pr-14 outline-none transition-all font-bold text-sm border ${
                      isDarkMode
                        ? "bg-slate-950 border-slate-800 text-[#203871] placeholder-slate-600 focus:border-blue-500"
                        : "bg-slate-50 border-slate-100 text-[#203871] placeholder-slate-400 focus:bg-white focus:border-[#203871] focus:shadow-xl focus:shadow-blue-900/5"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-400 hover:text-[#203871]"
                  >
                    {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#203871] hover:bg-blue-800 disabled:opacity-50 text-white font-black h-16 rounded-[1.5rem] shadow-xl shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-3 mt-8 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="tracking-[0.3em] text-[10px] uppercase">Activate Account</span>
                    <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-6 border-t border-slate-100 text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">
                Institutional Security • AES-256
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