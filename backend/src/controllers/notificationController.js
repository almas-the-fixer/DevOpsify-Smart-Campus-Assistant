// controllers/notificationController.js
import Notification from "../models/adminModels/Notification.js";
import Timetable from "../models/adminModels/Timetable.js";

import Override from "../models/adminModels/Override.js";
import NotificationRead from "../models/teacherModels/notificationRead.js";
import Announcement from "../models/adminModels/Announcement.js";
import AnnouncementRead from "../models/adminModels/AnnouncementRead.js";


// 🔴 CANCEL LECTURE
export const cancelLecture = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const lecture = await Timetable.findById(id);
    if (!lecture) return res.status(404).json({ msg: "Lecture not found" });

    // Notification create
    await Notification.create({
      type: "CANCELLED",
      title: "Lecture Cancelled",
      message: `${lecture.subject} lecture cancelled`,

      lectureId: lecture._id,
      teacherId: lecture.teacherId,

      targetAudience: {
        semester: lecture.semester,
        division: lecture.division,
        batchType: lecture.batchType
      },

      reason,

      date: lecture.day,
      startTime: lecture.startTime,
      endTime: lecture.endTime,
      subject: lecture.subject,
      room: lecture.room
    });

    res.json({ msg: "Lecture cancelled + notification sent" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🟡 UPDATE LECTURE
export const updateLecture = async (req, res) => {
  try {
    const { id } = req.params;

    const oldLecture = await Timetable.findById(id);
    if (!oldLecture) return res.status(404).json({ msg: "Lecture not found" });

    const updatedLecture = await Timetable.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    await Notification.create({
      type: "UPDATED",
      title: "Lecture Updated",
      message: `${oldLecture.subject} lecture updated`,

      lectureId: id,
      teacherId: updatedLecture.teacherId,

      targetAudience: {
        semester: updatedLecture.semester,
        division: updatedLecture.division,
        batchType: updatedLecture.batchType
      },

      changes: {
        oldData: oldLecture,
        newData: updatedLecture
      },

      date: updatedLecture.day,
      startTime: updatedLecture.startTime,
      endTime: updatedLecture.endTime,
      subject: updatedLecture.subject,
      room: updatedLecture.room
    });

    res.json({ msg: "Lecture updated + notification created" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🔵 GET STUDENT NOTIFICATIONS
export const getMyNotifications = async (req, res) => {
  try {
    const { semester, division, batchType } = req.user;

    const notifications = await Notification.find({
      "targetAudience.semester": semester,
      "targetAudience.division": division,
      "targetAudience.batchType": batchType
    })
    .sort({ createdAt: -1 });

    res.json(notifications);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ MARK AS READ
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.findByIdAndUpdate(id, {
      $addToSet: { isReadBy: req.user._id }
    });

    res.json({ msg: "Marked as read" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};  



// controllers/notificationController.js

// 🟢 Teacher Notifications
export const getTeacherNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await Override.find({
      "updatedData.teacherId": userId
    }).sort({ createdAt: -1 });

    const readData = await NotificationRead.find({ userId });

    const readMap = {};
    readData.forEach(r => {
      readMap[r.overrideId] = true;
    });

    const final = data.map(item => ({
      ...item._doc,
      isRead: !!readMap[item._id]
    }));

    res.json(final);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟢 Mark as Read
export const markAsReadTeacher = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await NotificationRead.findOneAndUpdate(
      { userId, overrideId: id },
      { userId, overrideId: id, read: true },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    // 👉 total notifications
    const totalDocs = await Override.find({
      "updatedData.teacherId": userId
    }).select("_id");

    const totalIds = totalDocs.map(d => d._id.toString());

    // 👉 read notifications
    const readDocs = await NotificationRead.find({ userId });

    const readIds = readDocs.map(r => r.overrideId.toString());

    // 👉 unread = total - read (proper filter)
    const unreadCount = totalIds.filter(id => !readIds.includes(id)).length;

    res.json({ count: unreadCount });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// // 🟢 Student Notifications (Override based)
// export const getStudentNotifications = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { semester, division, batchType } = req.user;

//     const data = await Override.find({
//       "updatedData.semester": semester,
//       "updatedData.division": division,
//       "updatedData.batchType": batchType
//     }).sort({ createdAt: -1 });

//     const readData = await NotificationRead.find({ userId });

//     const readMap = {};
//     readData.forEach(r => {
//       readMap[r.overrideId] = true;
//     });

//     const final = data.map(item => ({
//       ...item._doc,
//       isRead: !!readMap[item._id]
//     }));

//     res.json(final);

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };



// export const getStudentUnreadCount = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { semester, division, batchType } = req.user;

//     const totalDocs = await Override.find({
//       "updatedData.semester": semester,
//       "updatedData.division": division,
//       "updatedData.batchType": batchType
//     }).select("_id");

//     const totalIds = totalDocs.map(d => d._id.toString());

//     const readDocs = await NotificationRead.find({ userId });
//     const readIds = readDocs.map(r => r.overrideId.toString());

//     const unread = totalIds.filter(id => !readIds.includes(id)).length;

//     res.json({ count: unread });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };



export const getStudentNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { semester, division, batchType } = req.user;

    const data = await Override.aggregate([
      {
        $lookup: {
          from: "timetables",
          localField: "lectureId",
          foreignField: "_id",
          as: "lecture"
        }
      },
      { $unwind: "$lecture" },

      {
        $match: {
          "lecture.semester": semester,
          "lecture.division": division,
          "lecture.batchType": batchType
        }
      },

      { $sort: { createdAt: -1 } }
    ]);

    // 🔹 Read tracking
    const readData = await NotificationRead.find({ userId });
    const readMap = {};

    readData.forEach(r => {
      readMap[r.overrideId.toString()] = true;
    });

    const final = data.map(item => ({
      ...item,
      isRead: !!readMap[item._id.toString()]
    }));

    res.json(final);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const getStudentUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { semester, division, batchType } = req.user;

    const data = await Override.aggregate([
      {
        $lookup: {
          from: "timetables",
          localField: "lectureId",
          foreignField: "_id",
          as: "lecture"
        }
      },
      { $unwind: "$lecture" },

      {
        $match: {
          "lecture.semester": semester,
          "lecture.division": division,
          "lecture.batchType": batchType
        }
      },

      { $project: { _id: 1 } }
    ]);

    const totalIds = data.map(d => d._id.toString());

    const readDocs = await NotificationRead.find({ userId });
    const readIds = readDocs.map(r => r.overrideId.toString());

    const unread = totalIds.filter(id => !readIds.includes(id)).length;

    res.json({ count: unread });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const markAsReadUniversal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await NotificationRead.findOneAndUpdate(
      { userId, overrideId: id },
      { userId, overrideId: id, read: true },
      { upsert: true }
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const getTeacherAnnouncements = async (req,res)=>{

try{

const today = new Date();

const announcements = await Announcement.find({

isActive:true,

role:{ $in:["teacher","all"] },

$or:[
{expiryDate:null},
{expiryDate:{$gte:today}}
]

})
.sort({isPinned:-1,createdAt:-1});

res.json(announcements);

}catch(err){
res.status(500).json({message:err.message});
}

};


export const getTeacherUnreadCount = async (req,res)=>{

try{

const userId = req.user._id;
const today = new Date();

const readIds = await AnnouncementRead
.find({ userId })
.distinct("announcementId");

const count = await Announcement.countDocuments({

isActive:true,

role:{ $in:["teacher","all"] },

$or:[
{expiryDate:null},
{expiryDate:{$gte:today}}
],

_id:{ $nin:readIds }

});

res.json({count});

}catch(err){
res.status(500).json({message:err.message});
}

};

export const markTeacherAnnouncementRead = async (req,res)=>{

try{

const {announcementId} = req.body;

await AnnouncementRead.create({

userId:req.user._id,
announcementId

});

res.json({message:"Marked read"});

}catch(err){
res.status(500).json({message:err.message});
}

};