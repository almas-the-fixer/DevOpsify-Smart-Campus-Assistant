import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  FiDownload, FiEdit2, FiTrash2, FiX, FiSave, FiSearch,
  FiFileText, FiInfo, FiPaperclip, FiUploadCloud, FiFolder
} from "react-icons/fi";

import { FiMessageCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function MyMaterials() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState("");
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    file: null,
    oldFile: "",
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const navigate = useNavigate();
  const openDiscussion = (m) => {
    navigate(
      `/teacher/discussion?subject=${m.subject}&semester=${m.semester}&division=${m.division || "All"}`
    );
  };

  const fetchMaterials = async () => {
    try {
      const res = await api.get("/materials/my");
      setList(res.data);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return "N/A";
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? (bytes / 1024).toFixed(1) + " KB" : mb.toFixed(2) + " MB";
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this material? This action cannot be undone.")) return;
    try {
      await api.delete(`/materials/${id}`);
      setList(list.filter((m) => m._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  const openEdit = (m) => {
    setEditItem(m._id);
    setEditForm({
      title: m.title,
      description: m.description || "",
      file: null,
      oldFile: m.fileName,
    });
  };

  const cancelEdit = () => {
    setEditItem(null);
    setEditForm({ title: "", description: "", file: null, oldFile: "" });
  };

  const saveEdit = async (id) => {
    try {
      const formData = new FormData();
      formData.append("title", editForm.title);
      formData.append("description", editForm.description);
      if (editForm.file) formData.append("file", editForm.file);
      
      const res = await api.put(`/materials/${id}`, formData);
      setList(list.map((m) => (m._id === id ? res.data : m)));
      cancelEdit();
    } catch (err) {
      alert("Update failed");
    }
  };

  const filteredList = list.filter((m) =>
    `${m.title} ${m.subject} ${m.semester}`.toLowerCase().includes(search.toLowerCase())
  );

  const downloadFile = async (url, name) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = name;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (e) {
      alert("Download failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 animate-fade-in font-sans selection:bg-blue-100">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8 flex items-center gap-4">
            <div className="p-3 bg-[#203871] rounded-2xl text-white shadow-lg shadow-blue-900/20">
              <FiFolder size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-[#203871] tracking-tight">Material Drive</h2>
              <p className="text-slate-500 font-medium">Manage your {list.length} stored resources</p>
            </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative group mb-10">
          <input
            type="text"
            placeholder="Search by title, subject or semester..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-6 pr-14 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
            <FiSearch size={22} />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Syncing Drive...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredList.map((m) => (
              <div 
                key={m._id} 
                className={`bg-white rounded-[2.2rem] border transition-all duration-300 ${
                  editItem === m._id 
                  ? 'border-blue-500 ring-4 ring-blue-500/5 shadow-2xl' 
                  : 'border-slate-100 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row gap-8 lg:items-center">
                    
                    {/* ICON BOX */}
                    <div className={`hidden md:flex w-16 h-16 rounded-2xl items-center justify-center shrink-0 ${
                      editItem === m._id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'
                    }`}>
                      <FiFileText size={32} />
                    </div>

                    {/* CONTENT AREA */}
                    <div className="flex-1 min-w-0">
                      {editItem === m._id ? (
                        <div className="grid grid-cols-1 gap-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1">Document Title</label>
                              <input
                                value={editForm.title}
                                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700"
                              />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1 ">Replace File</label>
                                <label className="flex items-center gap-3 w-full mt-3 px-4 py-2.5 bg-blue-50/50 border border-dashed border-blue-200 rounded-xl cursor-pointer">
                                  <FiUploadCloud className="text-blue-600 shrink-0" size={18} />
                                  <span className="text-xs font-bold text-blue-700 truncate">
                                    {editForm.file ? editForm.file.name : "Choose new PDF"}
                                  </span>
                                  <input type="file" accept=".pdf" className="hidden" onChange={(e) => setEditForm({...editForm, file: e.target.files[0]})} />
                                </label>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1">Description</label>
                            <textarea
                                value={editForm.description}
                                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm h-20 resize-none outline-none"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-3">
                             <h4 className="text-2xl font-black text-[#203871] truncate">{m.title}</h4>
                             <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-blue-100">
                               {m.subject}
                             </span>
                          </div>
                          <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 max-w-3xl">
                            {m.description || "No description provided."}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[11px] font-bold uppercase tracking-tight">
                            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100/80 rounded-lg"><FiPaperclip className="text-blue-500" /> {m.fileName}</span>
                            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100/80 rounded-lg"><FiInfo className="text-blue-500" /> {formatSize(m.fileSize)}</span>
                            <span className="px-2.5 py-1 bg-slate-100/80 rounded-lg">Semester {m.semester}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ACTION BUTTONS (Single Row Alignment) */}
                    <div className={`flex flex-row items-center justify-start lg:justify-end gap-3 pt-6 lg:pt-0 border-t lg:border-t-0 border-slate-100 lg:pl-8 shrink-0`}>
                      {editItem === m._id ? (
                        <>
                          <button onClick={() => saveEdit(m._id)} className="w-12 h-12 flex items-center justify-center bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all active:scale-90"><FiSave size={22} /></button>
                          <button onClick={cancelEdit} className="w-12 h-12 flex items-center justify-center bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all active:scale-90"><FiX size={22} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => downloadFile(m.fileUrl, m.fileName)} title="Download" className="w-12 h-12 flex items-center justify-center bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all active:scale-95"><FiDownload size={22} /></button>
                          <button onClick={() => openEdit(m)} title="Edit" className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl hover:bg-[#203871] hover:text-white transition-all active:scale-95"><FiEdit2 size={20} /></button>
                          <button onClick={() => handleDelete(m._id)} title="Delete" className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-95"><FiTrash2 size={20} /></button>
                        </>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredList.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <FiSearch size={40} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-700">No materials found</h3>
          </div>
        )}
      
   
</div>
  {list.length > 0 && (
  <button
    onClick={() => openDiscussion(list[0])}
    className="fixed bottom-8 right-8 w-16 h-16 bg-[#203871] text-white rounded-full shadow-2xl shadow-blue-900/30 flex items-center justify-center hover:scale-110 transition-all duration-300 z-50"
  >
    <FiMessageCircle size={26} />
  </button>
)}
      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>
    </div>
  );
}