import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, Clock, Moon, Sun, ChevronRight, ArrowRight,
  CheckCircle2, LayoutDashboard, FileText, Lock, Database, 
  Code2, Layers, Target, Sparkles, ShieldCheck, Zap
} from 'lucide-react';

const Home = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const theme = {
    primary: '#203871',
    accent: '#3B82F6',
    bg: isDarkMode ? 'bg-[#020617]' : 'bg-[#F8FAFC]',
    card: isDarkMode ? 'bg-slate-900/40 border-slate-800/50' : 'bg-white/80 border-slate-200/60 shadow-sm',
    text: isDarkMode ? 'text-slate-100' : 'text-slate-900',
    subtext: isDarkMode ? 'text-slate-400' : 'text-slate-500'
  };

  return (
    <div className={`min-h-screen selection:bg-[#203871] selection:text-white transition-colors duration-700 font-sans ${theme.bg} ${theme.text} overflow-x-hidden`}>
      
      {/* --- Animated Background Elements --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 animate-pulse ${isDarkMode ? 'bg-blue-600' : 'bg-blue-400'}`}></div>
        <div className={`absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full blur-[120px] opacity-10 ${isDarkMode ? 'bg-indigo-600' : 'bg-indigo-300'}`}></div>
      </div>

      {/* --- Navigation --- */}
      <nav className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled ? 'py-4 backdrop-blur-xl border-b border-white/10' : 'py-8'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative">
              <div className="w-10 h-10 bg-[#203871] rounded-xl flex items-center justify-center text-white shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <LayoutDashboard size={20} />
              </div>
              <div className="absolute -inset-1 bg-blue-500/20 blur rounded-xl scale-0 group-hover:scale-110 transition-transform"></div>
            </div>
            <span className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#203871] via-blue-600 to-indigo-500">
              Smart Campus Assistant
            </span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="hover:scale-110 transition-transform">
              {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-[#203871]" />}
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-[#203871] text-white rounded-full font-bold text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(32,56,113,0.3)] transition-all flex items-center gap-2 group"
            >
              Login <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative pt-48 pb-32">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
              <Sparkles size={14} />
              <span className="text-[10px] font-black tracking-widest uppercase text-nowrap">Next-Gen Education Portal</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black leading-[1.05] tracking-tight">
              Empowering <span className="text-[#203871] italic">Faculty</span>, <br />
              Inspiring <span className="text-blue-500">Growth.</span>
            </h1>
            
            <p className={`text-lg md:text-xl font-medium max-w-lg ${theme.subtext}`}>
              A high-performance ecosystem designed to centralize attendance, 
              resource management, and institutional intelligence.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button onClick={() => navigate('/login')} className="px-10 py-5 bg-[#203871] text-white rounded-2xl font-black shadow-xl hover:-translate-y-1 transition-all">
                Get Started Now
              </button>
              
            </div>
          </div>

          <div className="relative group perspective-1000">
             {/* Abstract Dashboard Visual */}
             <div className="relative bg-gradient-to-br from-[#203871] to-blue-900 rounded-[3rem] p-4 shadow-2xl rotate-2 group-hover:rotate-0 transition-transform duration-700 overflow-hidden">
                <div className="bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] p-8 h-[400px] border border-white/10">
                   <div className="flex gap-2 mb-8">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                   </div>
                   <div className="space-y-4">
                      <div className="h-8 w-2/3 bg-white/10 rounded-lg animate-pulse"></div>
                      <div className="h-32 w-full bg-white/5 rounded-2xl flex items-end p-4 gap-2">
                         {[40, 70, 50, 90, 60].map((h, i) => (
                           <div key={i} style={{height: `${h}%`}} className="flex-1 bg-blue-400/40 rounded-t-md"></div>
                         ))}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-20 bg-white/5 rounded-2xl"></div>
                        <div className="h-20 bg-white/5 rounded-2xl"></div>
                      </div>
                   </div>
                </div>
                {/* Floating Badge */}
                <div className="absolute -bottom-6 -right-6 bg-emerald-500 text-white p-6 rounded-[2rem] shadow-xl animate-bounce">
                   <ShieldCheck size={32} />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- Bento Grid Features --- */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Large Feature */}
          <div className={`md:col-span-2 rounded-[3rem] p-12 relative overflow-hidden group transition-all duration-500 border ${theme.card}`}>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center mb-8">
                <BarChart3 size={32} />
              </div>
              <h3 className="text-4xl font-black mb-4">Intelligent Analytics</h3>
              <p className={`text-lg font-medium max-w-sm mb-8 ${theme.subtext}`}>Visualise student progress and faculty performance with auto-generated heatmaps.</p>
              {/* <button className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-blue-600 group-hover:gap-4 transition-all">
                Explore Dashboard <ChevronRight size={16} />
              </button> */}
            </div>
            <Target className="absolute -right-20 -bottom-20 text-blue-500/5 group-hover:text-blue-500/10 transition-all duration-700" size={400} />
          </div>

          {/* Small Feature 1 */}
          <div className={`rounded-[3rem] p-10 border group transition-all duration-500 ${theme.card}`}>
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-6">
              <Clock size={28} />
            </div>
            <h3 className="text-2xl font-black mb-2">Auto-Attendance</h3>
            <p className={`font-medium text-sm leading-relaxed ${theme.subtext}`}>One-tap digital roll calls that sync instantly with student records.</p>
          </div>

          {/* Small Feature 2 */}
          <div className={`rounded-[3rem] p-10 border group transition-all duration-500 ${theme.card}`}>
            <div className="w-14 h-14 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center mb-6">
              <FileText size={28} />
            </div>
            <h3 className="text-2xl font-black mb-2">Smart Hub</h3>
            <p className={`font-medium text-sm leading-relaxed ${theme.subtext}`}>Version-controlled resource sharing for seamless academic collaboration.</p>
          </div>

          {/* Security Wide Card */}
          <div className={`md:col-span-2 rounded-[3rem] p-12 bg-[#203871] text-white relative overflow-hidden group shadow-2xl`}>
             <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-blue-200 mb-6">
                    <Zap size={12} className="fill-current" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Enterprise Grade</span>
                  </div>
                  <h3 className="text-3xl font-black mb-4">Secure by Architecture</h3>
                  <p className="text-blue-100/70 font-medium mb-8">Deploying industry-standard encryption and role-based access to keep institutional data private.</p>
                  <div className="flex gap-4">
                    <CheckCircle2 className="text-blue-400" />
                    <span className="font-bold text-sm">AES-256 Encryption</span>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-48 h-48 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-700">
                    <Lock size={64} className="text-blue-200" />
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- Tech Stack --- */}
      <section className={`py-24 border-y ${isDarkMode ? 'border-slate-800 bg-slate-900/20' : 'border-slate-100 bg-slate-50/50'}`}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-12">The Power Behind the Portal</h2>
          <div className="flex flex-wrap justify-center gap-16 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
            <TechIcon icon={<Database size={32} />} name="MongoDB" />
            <TechIcon icon={<Code2 size={32} />} name="Express" />
            <TechIcon icon={<LayoutDashboard size={32} />} name="React" />
            <TechIcon icon={<Layers size={32} />} name="Node.js" />
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-16 text-center px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center gap-6">
           
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">
              © 2026 Smart Campus Assistant • LJ University Portal
            </p>
            <div className="flex gap-8 text-xs font-bold text-slate-500">
              <a href="#" className="hover:text-[#203871] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#203871] transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-[#203871] transition-colors">Contact Support</a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </div>
  );
};

const TechIcon = ({ icon, name }) => (
  <div className="flex flex-col items-center gap-3 transition-transform hover:scale-110">
    <div className="text-[#203871]">{icon}</div>
    <span className="font-black text-[10px] uppercase tracking-widest">{name}</span>
  </div>
);

export default Home;