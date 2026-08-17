import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  FiUser,
  FiFileText,
  FiEye,
  FiDownload,
  FiBookOpen,
  FiInfo,
  FiMessageCircle,
  FiCalendar,
  FiHardDrive,
  FiArrowLeft
} from "react-icons/fi";

export default function StudentMaterials() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function to format bytes to KB/MB
  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const downloadFile = async (url, name) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  useEffect(() => {
    api
      .get(`/student/materials/${id}`)
      .then((res) => {
        setMaterials(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const openDiscussion = () => {
    if (materials.length === 0) return;
    const m = materials[0];
    navigate(
      `/student/discussion?subject=${m.subject}&semester=${m.semester}&division=${m.division || "All"}`
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF]">
      <div className="max-w-6xl mx-auto px-6 py-10 animate-fade-in font-sans">
        {/* SECTION HEADER */}
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
            >
              <FiArrowLeft size={20} />
            </button>
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <FiBookOpen size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#1E3A8A] tracking-tighter">
                Resource Library
              </h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
                Subject Materials
              </p>
            </div>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-sm font-black text-blue-600 uppercase tracking-widest">
              Fetching Files...
            </p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && materials.length === 0 && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-16 text-center shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiInfo size={40} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-[#1E3A8A] tracking-tight">
              No Materials Found
            </h3>
            <p className="text-sm font-medium text-slate-500 mt-2 max-w-xs mx-auto">
              Your faculty hasn't uploaded any resources for this subject yet.
            </p>
          </div>
        )}

        {/* MATERIALS */}
        {!loading && materials.length > 0 && (
          <div className="grid gap-6">
            {materials.map((m) => (
              <div
                key={m._id}
                className="group bg-white rounded-[2rem] p-6 border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-1"
              >
                <div className="flex items-start gap-5 flex-1">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                    <FiFileText />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xl font-black text-[#1E3A8A] tracking-tight group-hover:text-blue-600 transition-colors">
                      {m.title}
                    </h4>
                    {m.description && (
                      <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-xl">
                        {m.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-3">
                      {/* FILE NAME */}
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100">
                        <FiFileText size={12} />
                        {m.fileName}
                      </div>
                      
                      {/* TEACHER */}
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                        <FiUser size={12} />
                        {m.teacherName || "Faculty"}
                      </div>

                      {/* DATE ADDED */}
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        <FiCalendar size={12} />
                        {new Date(m.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>

                      {/* FILE SIZE */}
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                        <FiHardDrive size={12} />
                        {formatBytes(m.fileSize)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-4 md:pt-0">
                  <a
                    href={`${m.fileUrl}#toolbar=0`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest text-slate-600 bg-slate-50 hover:bg-slate-100 transition-all active:scale-95"
                  >
                    <FiEye size={16} /> View
                  </a>

                  <button
                    onClick={() => downloadFile(m.fileUrl, m.fileName)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest text-white bg-[#203871] hover:bg-blue-600 shadow-lg shadow-blue-900/10 transition-all active:scale-95"
                  >
                    <FiDownload size={16} /> Get File
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FLOATING CHAT BUTTON */}
      {!loading && materials.length > 0 && (
        <button
          onClick={openDiscussion}
          className="fixed bottom-8 right-8 w-16 h-16 bg-[#203871] text-white rounded-full shadow-2xl shadow-blue-900/30 flex items-center justify-center hover:scale-110 transition-all duration-300 z-50"
        >
          <FiMessageCircle size={26} />
        </button>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}