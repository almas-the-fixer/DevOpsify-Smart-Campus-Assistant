import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Topbar from "../../ui/Topbar";
import {
  FiBookOpen,
  FiUsers,
  FiFolder,
  FiArrowRight,
  FiBook
} from "react-icons/fi";

export default function StudentSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/student/my-subjects")
      .then(res => {
        setSubjects(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFF]">

      <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in font-sans">
        
        {/* ENHANCED HEADER CARD */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200 mb-12 group">
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-110"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full w-fit mb-4">
                <FiBook className="text-blue-200" size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Academic Curriculum</span>
              </div>
              <h2 className="text-4xl font-black tracking-tighter">Enrolled Subjects</h2>
              <p className="text-blue-100/80 text-sm font-medium mt-2">
                MCA · <span className="text-white">Semester 8</span> · Academic Year 2025–26
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-4 rounded-3xl flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner">
                <FiUsers size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase opacity-60 leading-none mb-1">Total Load</p>
                <p className="text-2xl font-bold leading-none">{subjects.length} Subjects</p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION TITLE */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="h-6 w-1 bg-blue-600 rounded-full"></div>
          <h3 className="text-xl font-black text-[#1E3A8A] tracking-tight uppercase">Subject Directory</h3>
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 rounded-[2.5rem] bg-white border border-slate-100 animate-pulse flex flex-col p-8 gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl"></div>
                <div className="h-6 bg-slate-100 rounded-lg w-3/4"></div>
                <div className="h-4 bg-slate-50 rounded-lg w-1/2"></div>
                <div className="mt-auto h-10 bg-slate-50 rounded-xl w-full"></div>
              </div>
            ))}
          </div>
        )}

        {/* SUBJECTS GRID */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {subjects.map(sub => {
              const hasMaterial = sub.materialCount > 0;

              return (
                <div
                  key={sub._id}
                  onClick={() => hasMaterial && navigate(`/student/materials/${sub._id}`)}
                  className={`
                    group relative bg-white rounded-[2.5rem] p-8 
                    border border-slate-100 transition-all duration-500
                    ${hasMaterial 
                      ? "cursor-pointer hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2" 
                      : "opacity-70 cursor-not-allowed"}
                  `}
                >
                  {/* Decorative Icon Baground */}
                  <div className={`
                    absolute -right-4 -top-4 w-32 h-32 rounded-full transition-transform duration-700
                    ${hasMaterial ? "bg-blue-50/50 group-hover:scale-150" : "bg-slate-50"}
                  `}></div>

                  <div className="relative z-10">
                    {/* Icon Box */}
                    <div className={`
                      w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl mb-6 shadow-sm transition-transform duration-500
                      ${hasMaterial ? "bg-blue-50 text-blue-600 group-hover:scale-110 group-hover:rotate-3" : "bg-slate-100 text-slate-400"}
                    `}>
                      <FiBookOpen />
                    </div>

                    <h4 className="text-xl font-black text-[#1E3A8A] tracking-tight group-hover:text-blue-600 transition-colors line-clamp-1">
                      {sub.name}
                    </h4>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                         <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                         Division {sub.division}
                      </div>
                      <div className="text-sm font-bold text-slate-600 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">👨‍🏫</div>
                        {sub.teacherName}
                      </div>
                    </div>

                    {/* Footer / Badge */}
                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                      {hasMaterial ? (
                        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                          <FiFolder />
                          {sub.materialCount} Resources
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-rose-50 text-rose-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                          Locked
                        </div>
                      )}

                      {hasMaterial && (
                        <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                          Study <FiArrowRight />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}