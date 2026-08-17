import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { 
  FiBook, 
  FiFolder, 
  FiLayers, 
  FiUploadCloud, 
  FiChevronRight,
  FiHash,
  FiBox,
  FiBookOpen
} from "react-icons/fi";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await api.get("/subjects/my");
      setSubjects(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
  <div className="flex items-start gap-5">
    {/* Icon Container with Gradient & Animation */}
    <div className="p-4 bg-gradient-to-br from-[#203871] to-[#3b5ba1] rounded-2xl text-white shadow-xl shadow-blue-900/20 transform -rotate-3 group-hover:rotate-0 transition-transform duration-300 shrink-0">
      <FiBookOpen size={32} strokeWidth={2.5} />
    </div>

    <div>
      {/* Small Badge Label */}
      <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em] mb-2">
        <FiBook className="animate-bounce" /> Academic Curriculum
      </div>
      
      {/* Main Title */}
      <h1 className="text-4xl font-black text-[#203871] tracking-tight">
        My Subjects
      </h1>
      
      {/* Subtitle */}
      <p className="text-slate-500 font-medium mt-1">
        Manage your assigned courses and study materials
      </p>
    </div>
  </div>

          
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Courses</p>
              <p className="text-xl font-black text-indigo-600">{subjects.length}</p>
            </div>
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <FiLayers size={20} />
            </div>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Fetching Curriculum...</p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <FiBox size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-700">No subjects assigned</h3>
            <p className="text-slate-400 mt-2">Please contact the administrator for course allocation.</p>
          </div>
        ) : (
          /* SUBJECT GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subjects.map((sub) => (
              <div 
                key={sub.key} 
                className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-900/10 transition-all duration-500 overflow-hidden flex flex-col"
              >
                {/* Card Top: Gradient Accent */}
                <div className="h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                
                <div className="p-8 flex flex-col h-full">
                  {/* Subject Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 group-hover:rotate-[10deg]">
                      <FiFolder size={24} />
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 uppercase tracking-tighter">
                      <FiHash size={12}/> {sub.key}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-2">
                    MCA – Semester {sub.semester}
                  </h3>
                  
                  <h4 className="text-xl font-black text-slate-800 leading-tight mb-4 group-hover:text-indigo-600 transition-colors">
                    {sub.name}
                  </h4>

                  {/* Divisions Badges */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {sub.divisions.map((div) => (
                      <span key={div} className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[10px] font-bold">
                        Div: {div}
                      </span>
                    ))}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() =>
                      navigate("/teacher/upload", {
                        state: { subject: sub.name, semester: sub.semester },
                      })
                    }
                    className="mt-auto w-full group/btn flex items-center justify-center gap-3 py-4 bg-[#203871] text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-900/10 active:scale-95"
                  >
                    <FiUploadCloud size={18} className="group-hover/btn:-translate-y-1 transition-transform" />
                    <span>Upload Material</span>
                    <FiChevronRight className="ml-2 opacity-50 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>
    </div>
  );
}