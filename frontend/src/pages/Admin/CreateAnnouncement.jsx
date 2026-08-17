import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
FiArrowLeft, FiType, FiMessageSquare, FiFlag,
FiUser, FiLayers, FiGrid, FiCalendar, FiSend
} from "react-icons/fi";

export default function CreateAnnouncement(){

const navigate = useNavigate();

const [errors,setErrors] = useState({});
const [loading,setLoading] = useState(false);

const [semesters,setSemesters] = useState([]);
const [divisions,setDivisions] = useState([]);

const [form,setForm] = useState({
title:"",
message:"",
type:"GENERAL",
semester:"",
division:"",
role:"student",
expiryDate:""
});

useEffect(()=>{
updateOptions(form.role);
},[form.role]);

const updateOptions = (role)=>{

if(role === "student"){
setSemesters(["All",6,8]);
setDivisions(["All","A","B","C"]);
}

else if(role === "teacher"){
setSemesters([]);
setDivisions([]);
setForm(prev=>({...prev,semester:"",division:""}));
}

else if(role === "all"){
setSemesters([]);
setDivisions([]);
setForm(prev=>({...prev,semester:"",division:""}));
}

};

const validate = ()=>{

let err = {};

if(!form.title) err.title="Title required";
if(!form.message) err.message="Message required";

if(form.role === "student"){
if(!form.semester) err.semester="Select semester";
if(!form.division) err.division="Select division";
}

if(!form.expiryDate) err.expiryDate="Expiry required";

setErrors(err);

return Object.keys(err).length === 0;
};

const submit = async(e)=>{

e.preventDefault();

if(!validate()) return;

setLoading(true);

try{

const payload = {...form};

if(form.role !== "student"){
payload.semester = null;
payload.division = "All";
}

await api.post("/admin/announcements",payload);
navigate("/admin/announcementdashboard");

}catch(err){

console.log(err);

alert("Failed to publish");

}

setLoading(false);

};

return(

<div className="min-h-screen bg-[#F1F5F9] p-6 flex justify-center">

<div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl">

<div className="bg-[#203871] text-white p-6 relative">

<button
onClick={()=>navigate(-1)}
className="absolute left-6 top-6"
>
<FiArrowLeft size={22}/>
</button>

<h2 className="text-3xl font-black text-center">
New Broadcast
</h2>

</div>

<form onSubmit={submit} className="p-10 space-y-6">

{/* TITLE */}

<div>
<label className="font-bold text-sm">Title</label>

<input
className="w-full h-12 px-4 rounded-xl bg-slate-100"
onChange={(e)=>setForm({...form,title:e.target.value})}
/>

{errors.title && <p className="text-red-500">{errors.title}</p>}

</div>


{/* MESSAGE */}

<div>

<label className="font-bold text-sm">Message</label>

<textarea
className="w-full p-4 rounded-xl bg-slate-100"
rows="4"
onChange={(e)=>setForm({...form,message:e.target.value})}
/>

{errors.message && <p className="text-red-500">{errors.message}</p>}

</div>


{/* TYPE */}

<div>

<label className="font-bold text-sm">Type</label>

<select
className="w-full h-12 px-4 rounded-xl bg-slate-100"
onChange={(e)=>setForm({...form,type:e.target.value})}
>

<option>GENERAL</option>
<option>EXAM</option>
<option>HOLIDAY</option>
<option>EVENT</option>
<option>IMPORTANT</option>

</select>

</div>


{/* ROLE */}

<div>

<label className="font-bold text-sm">Audience</label>

<select
className="w-full h-12 px-4 rounded-xl bg-slate-100"
onChange={(e)=>setForm({...form,role:e.target.value})}
>

<option value="student">Only Students</option>
<option value="teacher">Only Teachers</option>
<option value="all">Everyone</option>

</select>

</div>


{/* SEMESTER */}

<div>

<label className="font-bold text-sm">Semester</label>

<select
disabled={form.role !== "student"}
className="w-full h-12 px-4 rounded-xl bg-slate-100"
onChange={(e)=>setForm({...form,semester:e.target.value})}
>

<option value="">Select</option>

{semesters.map(s=>(
<option key={s} value={s}>{s}</option>
))}

</select>

{errors.semester && <p className="text-red-500">{errors.semester}</p>}

</div>


{/* DIVISION */}

<div>

<label className="font-bold text-sm">Division</label>

<select
disabled={form.role !== "student"}
className="w-full h-12 px-4 rounded-xl bg-slate-100"
onChange={(e)=>setForm({...form,division:e.target.value})}
>

<option value="">Select</option>

{divisions.map(d=>(
<option key={d} value={d}>{d}</option>
))}

</select>

{errors.division && <p className="text-red-500">{errors.division}</p>}

</div>


{/* EXPIRY */}

<div>

<label className="font-bold text-sm">Expiry Date</label>

<input
type="date"
className="w-full h-12 px-4 rounded-xl bg-slate-100"
onChange={(e)=>setForm({...form,expiryDate:e.target.value})}
/>

</div>


<button
disabled={loading}
className="w-full bg-[#203871] text-white py-4 rounded-xl font-bold"
>

{loading ? "Publishing..." : "Publish Announcement"}

</button>

</form>

</div>

</div>

);

}