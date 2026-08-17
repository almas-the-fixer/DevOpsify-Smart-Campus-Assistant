import { useEffect, useState, useRef } from "react";
import api from "../../api/axios";
import {
  FiSend,
  FiArrowLeft,
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiX,
  FiCheck,
  FiInfo,
  FiUsers,
  FiBookOpen
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

export default function TeacherDiscussion() {
  const [discussion, setDiscussion] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);

  const bottomRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const subject = query.get("subject");
  const semester = query.get("semester");
  const division = query.get("division") || "All";

  useEffect(() => {
    fetchDiscussion();
  }, [subject, semester, division]);

  const fetchDiscussion = async () => {
    try {
      const res = await api.get(
        `/teacher/discussion?subject=${subject}&semester=${semester}&division=${division}`
      );
      setDiscussion(res.data);
      const msgRes = await api.get(`/teacher/discussion/messages/${res.data._id}`);
      setMessages(msgRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || !discussion?._id) return;
    try {
      if (editingId) {
        const res = await api.put(`/teacher/discussion/message/${editingId}`, { message: text });
        setMessages((prev) => prev.map((m) => (m._id === editingId ? res.data : m)));
        setEditingId(null);
      } else {
        const res = await api.post("/teacher/discussion/message", {
          discussionId: discussion._id,
          message: text,
        });
        setMessages((prev) => [...prev, res.data]);
      }
      setText("");
    } catch (err) { console.error(err); }
  };

  const deleteMessage = async (id) => {
    try {
      await api.delete(`/teacher/discussion/message/${id}`);
      setMessages((prev) => prev.map((m) => (m._id === id ? { ...m, deleted: true } : m)));
      setActiveMenu(null);
    } catch (err) { console.error(err); }
  };

  // Teacher can edit/delete their own messages anytime (no 1h limit usually, but logic is here)
  const canModify = (msg) => msg.senderRole === "teacher";

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const shouldShowDateDivider = (msg, prevMsg) => {
    if (!prevMsg) return true;
    return new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();
  };

  const formatDateLabel = (dateString) => {
    const d = new Date(dateString);
    if (d.toDateString() === new Date().toDateString()) return "Today";
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, editingId]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[#203871] rounded-full animate-spin"></div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Opening Faculty Portal</p>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-[#F1F5F9] text-slate-900 font-sans">
      
      {/* HEADER */}
      <header className="bg-white px-8 py-5 flex items-center gap-6 border-b border-slate-200 shadow-sm sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-slate-50 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all group">
          <FiArrowLeft size={22} className="group-active:-translate-x-1 transition-transform" />
        </button>
        
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="font-extrabold text-xl tracking-tight text-slate-800">{discussion?.subject}</h2>
            <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded tracking-tighter uppercase">Teacher View</span>
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <FiInfo size={12} /> Semester {discussion?.semester}
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <FiUsers size={12} /> Div {discussion?.division}
            </span>
          </div>
        </div>
      </header>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto px-4 py-8 md:px-24 lg:px-[25%] space-y-8">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-60">
            <FiBookOpen size={48} className="mb-4" />
            <p className="font-bold uppercase tracking-widest text-xs">No classroom activity yet</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderRole === "teacher";
            const showDate = shouldShowDateDivider(msg, messages[idx - 1]);

            return (
              <div key={msg._id} className="flex flex-col">
                {showDate && (
                  <div className="relative flex items-center justify-center my-8">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                    <span className="relative bg-[#F1F5F9] px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                      {formatDateLabel(msg.createdAt)}
                    </span>
                  </div>
                )}

                <div className={`flex ${isMe ? "justify-end" : "justify-start"} group`}>
                  <div className={`relative max-w-[90%] md:max-w-[80%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    
                    {!isMe && !msg.deleted && (
                      <span className="mb-1.5 ml-1 text-[11px] font-black text-[#203871] uppercase tracking-wide">
                        {msg.senderName}
                      </span>
                    )}

                    <div className={`group-relative p-4 rounded-2xl shadow-sm transition-all border ${
                      isMe 
                        ? "bg-[#203871] border-transparent text-white rounded-tr-none" 
                        : "bg-white border-slate-200 text-slate-700 rounded-tl-none hover:border-slate-300"
                    } ${msg.deleted ? "bg-slate-50/50 border-dashed border-slate-300 opacity-60" : ""}`}>
                      
                      {msg.deleted ? (
                        <p className="italic text-sm text-slate-400">Message deleted.</p>
                      ) : (
                        <>
                          <p className="text-[15px] leading-[1.6] whitespace-pre-wrap">{msg.message}</p>
                          <div className="flex items-center justify-end gap-2 mt-2 text-[10px] font-bold opacity-60">
                            {msg.edited && <span className="flex items-center gap-1 uppercase tracking-tighter">Edited</span>}
                            <span className="tracking-tighter">{formatTime(msg.createdAt)}</span>
                          </div>
                        </>
                      )}

                      {/* Teacher Actions */}
                      {isMe && !msg.deleted && (
                        <div className="absolute top-0 -left-12 h-full flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white shadow-xl border border-slate-200 rounded-xl p-1 flex flex-col gap-1">
                            <button onClick={() => {setEditingId(msg._id); setText(msg.message);}} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg">
                              <FiEdit size={16} />
                            </button>
                            <button onClick={() => deleteMessage(msg._id)} className="p-2 hover:bg-rose-50 text-rose-500 rounded-lg border-t border-slate-100">
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} className="h-4"></div>
      </div>

      {/* INPUT AREA */}
      <footer className="bg-white p-6 border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          {editingId && (
            <div className="flex items-center justify-between px-5 py-2.5 bg-[#203871] text-white rounded-t-2xl">
              <span className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                <FiEdit /> Updating Instruction
              </span>
              <button onClick={() => {setEditingId(null); setText("");}}><FiX size={18} /></button>
            </div>
          )}

          <form onSubmit={sendMessage} className={`flex items-center gap-4 p-2 bg-slate-50 border-2 transition-all ${
              editingId ? "rounded-b-2xl border-[#203871] border-t-0" : "rounded-3xl border-transparent focus-within:border-blue-200 focus-within:bg-white"
            }`}>
            <textarea
              rows="1"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              placeholder="Post a new announcement or reply..."
              className="flex-1 bg-transparent px-4 py-2 text-sm font-medium outline-none resize-none max-h-40"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="h-12 w-12 flex items-center justify-center bg-[#203871] text-white rounded-2xl shadow-lg hover:scale-105 active:scale-95 disabled:opacity-20 transition-all"
            >
              {editingId ? <FiCheck size={24} /> : <FiSend size={20} />}
            </button>
          </form>
          <div className="mt-3 flex justify-between items-center px-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Faculty Discussion Portal</p>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">Enter to broadcast</p>
          </div>
        </div>
      </footer>
    </div>
  );
}