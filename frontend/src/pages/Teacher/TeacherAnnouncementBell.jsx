import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import api from "../../api/axios";
import { FiAlertCircle } from "react-icons/fi";

export default function TeacherAnnouncementBell(){

const [open,setOpen] = useState(false);
const [announcements,setAnnouncements] = useState([]);
const [count,setCount] = useState(0);

useEffect(()=>{
loadAnnouncements();
},[]);

const loadAnnouncements = async ()=>{

try{

const res = await api.get("/teacher/notifications/announcements");

setAnnouncements(res.data || []);

const unread = await api.get("/teacher/notifications/announcements/unread-count");

setCount(unread.data.count || 0);

}catch(err){
console.error(err);
}

};

const markRead = async(id)=>{

try{

await api.post("/teacher/notifications/announcements/mark-read",{announcementId:id});

setCount(prev => prev>0 ? prev-1 : 0);

}catch(err){
console.error(err);
}

};

return(

<div className="relative">

{/* 🔔 Notification Bell */}

<button
onClick={()=>setOpen(!open)}
className="relative flex items-center justify-center w-10 h-10 rounded-xl
bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20
text-white transition-all duration-200 hover:scale-110"
>

<FiAlertCircle size={22}/>

{count>0 &&(

<span
className="absolute -top-1.5 -right-1.5
min-w-[18px] h-[18px] flex items-center justify-center
bg-red-600 text-white text-[10px] font-bold
rounded-full px-1 shadow-md"
>

{count}

</span>

)}

</button>


{/* PORTAL MODAL */}

{open && createPortal(

<>

{/* BACKDROP */}

<div
className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[99998]"
onClick={()=>setOpen(false)}
></div>


{/* MODAL */}

<div className="fixed inset-0 flex items-center justify-center z-[99999]">

<div
className="w-[480px] max-h-[520px]
bg-white rounded-3xl
shadow-[0_20px_60px_rgba(0,0,0,0.15)]
border border-slate-200
overflow-hidden animate-[fadeIn_.25s_ease]"
>

{/* Header */}

<div className="flex justify-between items-center px-8 py-5 border-b bg-blue-50">

<h3 className="text-sm font-bold text-blue-900 tracking-wide">
Teacher Announcements
</h3>

<button
onClick={()=>setOpen(false)}
className="text-xs font-semibold text-blue-500 hover:text-blue-700"
>
Close
</button>

</div>


{/* Announcement List */}

<div className="max-h-[420px] overflow-y-auto">

{announcements.length===0 ?(

<p className="p-6 text-sm text-gray-500 text-center">
No announcements
</p>

):(announcements.map(a=>(

<div
key={a._id}
onClick={()=>markRead(a._id)}
className="px-6 py-4 border-b last:border-none hover:bg-blue-50 cursor-pointer transition"
>

<div className="flex justify-between">

<h4 className="font-semibold text-sm text-gray-800">
{a.title}
</h4>

<span className="text-xs text-gray-400">
{new Date(a.createdAt).toLocaleDateString("en-IN")}
</span>

</div>

<p className="text-sm text-gray-600 mt-1">
{a.message}
</p>

<div className="flex gap-2 text-[11px] mt-2">

<span className="bg-purple-100 text-purple-700 px-2 py-[2px] rounded font-medium">
Teacher
</span>

<span className="bg-blue-100 text-blue-600 px-2 py-[2px] rounded font-medium">
{a.type}
</span>

</div>

</div>

)))}

</div>

</div>

</div>

</>,

document.body

)}

</div>

);

}