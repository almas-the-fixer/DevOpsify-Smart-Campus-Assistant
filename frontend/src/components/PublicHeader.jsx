import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiLogIn, FiCpu, FiMoon, FiSun, FiChevronDown } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function PublicHeader({ showLogin, user = null }) {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500  bg-[#203871]${
      isScrolled ? "py-3" : "py-6"
    }`}>
      <div className={`max-w-7xl mx-auto px-6`}>
        <div className={`flex items-center justify-between px-6 py-3 rounded-2xl transition-all duration-500 ${
          isScrolled 
          ? "bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.05)]" 
          : "bg-transparent"
        }`}>
          
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center shadow-indigo-200 shadow-lg">
              <FiCpu className="text-white" size={22} />
            </div>
            <div className="hidden sm:block">
              <h1 className={`font-bold text-lg leading-none ${isScrolled ? "text-slate-900" : "text-slate-800"}`}>
                Smart<span className="text-indigo-600">Campus</span>
              </h1>
              <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">L J University</p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
             <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                {theme === "dark" ? <FiSun /> : <FiMoon />}
             </button>

            {showLogin && !user && (
              <button 
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95"
              >
                <FiLogIn /> Portal Login
              </button>
            )}
            
            {user && (
               <div className="flex items-center gap-2 bg-slate-100 p-1 pr-3 rounded-xl border border-slate-200">
                  <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold">{user.name[0]}</div>
                  <span className="text-xs font-bold text-slate-700">{user.name}</span>
               </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}