import Announcement from "../models/adminModels/Announcement.js";

import AnnouncementRead from "../models/adminModels/AnnouncementRead.js";

// controllers/announcementController.js

import User from "../models/adminModels/User.js";

export const getAcademicMeta = async (req,res)=>{
try{

const semesters = await User.distinct("semester");
const divisions = await User.distinct("division");

res.json({
semesters: semesters.sort((a,b)=>a-b),
divisions: divisions.sort()
});

}catch(err){
res.status(500).json({message:err.message});
}
};

export const getAnnouncements = async (req,res)=>{

try{

const {page=1,limit=10,search="",semester,division,role} = req.query;

const query = {
title:{$regex:search,$options:"i"}
};

if(role){
query.role = { $in:[role,"all"] };
}

if(semester){
query.$or = [
{ semester:Number(semester) },
{ semester:null }
];
}

if(division){
query.$and = [
{ $or:[
{ division:division },
{ division:"All" }
]}
];
}

const announcements = await Announcement
.find(query)
.sort({isPinned:-1,createdAt:-1})
.skip((page-1)*limit)
.limit(Number(limit));

const total = await Announcement.countDocuments(query);

res.json({
announcements,
total,
pages:Math.ceil(total/limit)
});

}catch(err){
res.status(500).json({message:err.message});
}

};
export const createAnnouncement = async (req,res)=>{
try{

const {title,message,type,semester,division,role,expiryDate,isPinned} = req.body;

let sem = semester;
let div = division;

if(role === "all" || role === "teacher"){
sem = null;
div = "All";
}

const announcement = await Announcement.create({

title,
message,
type,
semester: sem,
division: div,
role,
expiryDate:expiryDate || null,
isPinned:isPinned || false,
createdBy:req.user._id

});

res.json(announcement);

}catch(err){
res.status(500).json({message:err.message});
}
};


export const updateAnnouncement = async (req,res)=>{

try{

const updated = await Announcement.findByIdAndUpdate(

req.params.id,
req.body,
{new:true}

);

res.json(updated);

}catch(err){
res.status(500).json({message:err.message});
}

};

export const deleteAnnouncement = async (req,res)=>{

try{

await Announcement.findByIdAndDelete(req.params.id);

res.json({message:"Announcement deleted"});

}catch(err){
res.status(500).json({message:err.message});
}

};

export const togglePin = async (req,res)=>{

try{

const ann = await Announcement.findById(req.params.id);

ann.isPinned = !ann.isPinned;

await ann.save();

res.json(ann);

}catch(err){
res.status(500).json({message:err.message});
}

};


export const deactivateAnnouncement = async (req, res) => {
  try {

    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    res.json({
      message: "Announcement deactivated",
      announcement
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getUnreadAnnouncementCount = async (req,res) => {

try{

const userId = req.user._id;
const user = req.user;
const today = new Date();

const readIds = await AnnouncementRead
.find({ userId })
.distinct("announcementId");

const unreadCount = await Announcement.countDocuments({

isActive:true,

role:{ $in:["student","all"] },

$and:[

{
$or:[
{semester:Number(user.semester)},
{semester:null}
]
},

{
$or:[
{division:user.division},
{division:"All"}
]
},

{
$or:[
{expiryDate:null},
{expiryDate:{$gte:today}}
]
}

],

_id:{ $nin:readIds }

});

res.json({count:unreadCount});

}catch(err){
console.error(err);
res.status(500).json({message:err.message});
}

};



export const markAnnouncementRead = async (req,res)=>{

try{

const {announcementId} = req.body;

await AnnouncementRead.findOneAndUpdate(

{
userId:req.user._id,
announcementId
},

{},

{upsert:true}

);

res.json({message:"Marked read"});

}catch(err){
console.error(err);
res.status(500).json({message:err.message});
}

};

// controllers/announcementController.js

export const getAnnouncementStats = async (req, res) => {
  try {

    const today = new Date();

    const total = await Announcement.countDocuments();

    const active = await Announcement.countDocuments({
      isActive: true,
      $or: [
        { expiryDate: null },
        { expiryDate: { $gte: today } }
      ]
    });

    const expired = await Announcement.countDocuments({
      expiryDate: { $lt: today }
    });

    const reads = await AnnouncementRead.countDocuments();

    res.json({
      total,
      active,
      expired,
      reads
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

