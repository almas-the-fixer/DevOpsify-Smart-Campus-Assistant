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
  FiUser
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

export default function StudentDiscussion() {
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
  }, []);

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
    e.preventDefault();
    if (!text.trim()) return;
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

  const canModify = (msg) => {
    const diff = Date.now() - new Date(msg.createdAt).getTime();
    return msg.senderRole === "student" && diff < 60 * 60 * 1000;
  };

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
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Syncing Classroom</p>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-[#F1F5F9] text-slate-900 font-sans">
      
      {/* HEADER */}
      <header className="bg-white px-8 py-5 flex items-center gap-6 border-b border-slate-200 shadow-sm sticky top-0 z-20">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2.5 bg-slate-50 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all group"
        >
          <FiArrowLeft size={22} className="group-active:-translate-x-1 transition-transform" />
        </button>
        
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="font-extrabold text-xl tracking-tight text-slate-800">{discussion?.subject}</h2>
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <FiInfo size={12} /> Semester {discussion?.semester}
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <FiUser size={12} /> Division {discussion?.division}
            </span>
          </div>
        </div>
      </header>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto px-4 py-8 md:px-24 lg:px-[25%] space-y-8">
        {messages.map((msg, idx) => {
          const isMe = msg.senderRole === "student";
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
                  
                  {/* Sender Info */}
                  {!isMe && !msg.deleted && (
                    <span className="mb-1.5 ml-1 text-[11px] font-black text-blue-600 uppercase tracking-wide">
                      {msg.senderName}
                    </span>
                  )}

                  {/* Message Bubble */}
                  <div className={`group-relative p-4 rounded-2xl shadow-sm transition-all border ${
                    isMe 
                      ? "bg-[#203871] border-transparent text-white rounded-tr-none" 
                      : "bg-white border-slate-200 text-slate-700 rounded-tl-none hover:border-slate-300"
                  } ${msg.deleted ? "bg-slate-50/50 border-dashed border-slate-300 opacity-60" : ""}`}>
                    
                    {msg.deleted ? (
                      <p className="italic text-sm text-slate-400">This message was removed by the sender.</p>
                    ) : (
                      <>
                        <p className="text-[15px] leading-[1.6] whitespace-pre-wrap">{msg.message}</p>
                        <div className={`flex items-center justify-end gap-2 mt-2 text-[10px] font-bold opacity-60`}>
                          {msg.edited && <span className="flex items-center gap-1 tracking-tighter uppercase"><FiEdit size={10}/> Edited</span>}
                          <span className="tracking-tighter">{formatTime(msg.createdAt)}</span>
                        </div>
                      </>
                    )}

                    {/* Pop-out Action Menu */}
                    {canModify(msg) && !msg.deleted && (
                      <div className={`absolute top-0 ${isMe ? "-left-12" : "-right-12"} h-full flex items-center opacity-0 group-hover:opacity-100 transition-opacity`}>
                        <div className="bg-white shadow-xl border border-slate-200 rounded-xl p-1 flex flex-col gap-1">
                          <button 
                            onClick={() => {setEditingId(msg._id); setText(msg.message);}} 
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button 
                            onClick={() => deleteMessage(msg._id)} 
                            className="p-2 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors border-t border-slate-100"
                            title="Delete"
                          >
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
        })}
        <div ref={bottomRef} className="h-4"></div>
      </div>

      {/* INPUT AREA */}
      <footer className="bg-white p-6 border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          {editingId && (
            <div className="flex items-center justify-between px-5 py-2.5 bg-blue-600 text-white rounded-t-2xl animate-in slide-in-from-bottom-2">
              <span className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                <FiEdit /> Modifying Message
              </span>
              <button 
                onClick={() => {setEditingId(null); setText("");}} 
                className="hover:rotate-90 transition-transform p-1"
              >
                <FiX size={18} />
              </button>
            </div>
          )}

          <form 
            onSubmit={sendMessage} 
            className={`flex items-center gap-4 p-2 bg-slate-50 border-2 transition-all ${
              editingId ? "rounded-b-2xl border-blue-600 border-t-0" : "rounded-3xl border-transparent focus-within:border-blue-200 focus-within:bg-white"
            }`}
          >
            <textarea
              rows="1"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              placeholder="Share your thoughts with the class..."
              className="flex-1 bg-transparent px-4 py-2 text-sm font-medium outline-none resize-none max-h-40 placeholder:text-slate-400"
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
              className="h-12 w-12 flex items-center justify-center bg-[#203871] text-white rounded-2xl shadow-lg hover:shadow-blue-900/20 hover:scale-105 active:scale-95 disabled:opacity-20 disabled:grayscale transition-all"
            >
              {editingId ? <FiCheck size={24} /> : <FiSend size={20} />}
            </button>
          </form>
          <div className="mt-3 flex justify-between items-center px-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide italic">End-to-End Academic Discussion</p>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">1h Modification Limit</p>
          </div>
        </div>
      </footer>
    </div>
  );
}