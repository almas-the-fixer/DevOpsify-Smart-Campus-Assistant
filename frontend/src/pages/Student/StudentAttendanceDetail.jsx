import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import Topbar from "../../ui/Topbar";
import {
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiClock,
  FiInfo
} from "react-icons/fi";

export default function StudentAttendanceDetail() {
  const { subject } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/student/attendance/${subject}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [subject]);

  return (
    <div className="min-h-screen bg-[#F8FAFF]">
      

      <div className="max-w-6xl mx-auto px-6 py-10 animate-fade-in font-sans">
        
        {/* ENHANCED HEADER CARD */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#203871] to-[#3b82f6] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200 mb-10 group">
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-110"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full w-fit mb-4">
              <FiCalendar className="text-blue-200" size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">History Log</span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter">{subject}</h2>
            <p className="text-blue-100/80 text-sm font-medium mt-2">
              Detailed breakdown of your <span className="text-white">lecture-wise presence</span>
            </p>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-sm font-black text-blue-600 uppercase tracking-widest">Analyzing Records...</p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && data.length === 0 && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-16 text-center shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiInfo size={40} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-[#203871] tracking-tight">No Records Found</h3>
            <p className="text-sm font-medium text-slate-500 mt-2">Attendance data for this subject is not available yet.</p>
          </div>
        )}

        {/* MODERN TABLE / DATA GRID */}
        {!loading && data.length > 0 && (
          <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Schedule</th>
                    <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Session Time</th>
                    <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.map((d, i) => (
                    <tr 
                      key={i} 
                      className="group hover:bg-blue-50/30 transition-colors duration-300"
                    >
                      {/* Date & Day */}
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-[#203871]">{d.date}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d.day}</span>
                        </div>
                      </td>

                      {/* Time */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                          <FiClock size={14} className="text-blue-400" />
                          {d.startTime}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-8 py-5">
                        {d.status === "Present" ? (
                          <div className="flex items-center gap-2 w-fit px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                            <FiCheckCircle size={14} /> Present
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 w-fit px-4 py-1.5 bg-rose-50 text-rose-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100">
                            <FiXCircle size={14} /> Absent
                          </div>
                        )}
                      </td>

                      {/* Remark */}
                      <td className="px-8 py-5">
                        <span className={`text-xs font-bold ${d.status === "Present" ? "text-slate-500" : "text-rose-400 italic"}`}>
                          {d.status === "Present" ? "On Time" : "Missed Lecture"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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