import express from "express";
import User from "../models/adminModels/User.js";
import Attendance from "../models/adminModels/Attendance.js";
import Timetable from "../models/adminModels/Timetable.js"; // 👈 add this
import Subject from "../models/teacherModels/subjects.js";
import Material from "../models/teacherModels/material.js";
import verifyToken from "../middleware/auth.Middleware.js";
import { getStudentNotifications,getStudentUnreadCount,markAsReadUniversal } from "../controllers/notificationController.js";
import { getStudentTimetable } from "../controllers/studentController.js";
import { getUnreadAnnouncementCount,markAnnouncementRead } from "../controllers/announcementController.js";
const router = express.Router();



router.get(
  "/unread-count",
  verifyToken,
  getUnreadAnnouncementCount
);

router.post(
  "/mark-read",
  verifyToken,
  markAnnouncementRead
);

router.get("/notifications", verifyToken, getStudentNotifications);
router.get("/notifications/unread-count", verifyToken, getStudentUnreadCount);
router.put("/read/:id", verifyToken, markAsReadUniversal);
// Get logged-in student's subjects with material info
// My Subjects
router.get("/my-subjects", verifyToken, async (req, res) => {

  try {

    const student = await User.findById(req.user.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const subjects = await Subject.find({
      semester: student.semester,
      division: student.division,
    });


    const result = await Promise.all(

      subjects.map(async (sub) => {

        const count = await Material.countDocuments({
          subject: { $regex: `^${sub.name}$`, $options: "i" },
          semester: sub.semester
        });

        return {
          ...sub.toObject(),
          materialCount: count,
        };
      })

    );

    res.json(result);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// Materials Page
router.get("/materials/:subjectId", verifyToken, async (req,res)=>{

  try{

    const subject = await Subject.findById(req.params.subjectId);

    if(!subject){
      return res.status(404).json({message:"Subject not found"});
    }

    const data = await Material.find({
      subject: { $regex: `^${subject.name}$`, $options: "i" },
      semester: subject.semester
    });

    res.json(data);

  }catch(err){
    res.status(500).json({message: err.message});
  }

});


// Get student attendance summary
router.get("/attendance", verifyToken, async (req, res) => {

  try {

    const student = await User.findById(req.user.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }


    // Get all lectures of student's class
    const records = await Attendance.find({
      semester: student.semester,
      division: student.division
    });


    const summary = {};


    records.forEach(r => {

      if (!summary[r.subject]) {
        summary[r.subject] = {
          subject: r.subject,
          present: 0,
          total: 0
        };
      }

      // Total lectures
      summary[r.subject].total += 1;

      // If student was present
      const isPresent = r.presentStudents.some(
        id => id.toString() === student._id.toString()
      );

      if (isPresent) {
        summary[r.subject].present += 1;
      }

    });


    res.json(Object.values(summary));

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

});

router.get("/attendance/:subject", verifyToken, async (req, res) => {

  try {

    const student = await User.findById(req.user.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }


    // Attendance records
    const records = await Attendance.find({
      subject: req.params.subject,
      semester: student.semester,
      division: student.division
    }).sort({ date: -1 });


    // Get timetable for this subject
    const timetable = await Timetable.find({
      subject: req.params.subject,
      semester: student.semester,
      division: student.division
    });


    const result = records.map(r => {

      // Match timetable by day
      const tt = timetable.find(t => t.day === r.day);


      const present = r.presentStudents.some(
        id => id.toString() === student._id.toString()
      );


      return {
        date: r.date,
        day: r.day,

        // 👇 Start time from timetable
        startTime: tt ? tt.startTime : "--",

        status: present ? "Present" : "Absent"
      };

    });


    res.json(result);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

});


// // Get Student Timetable (Weekly)
// router.get("/timetable", verifyToken, async (req, res) => {

//   try {

//     const student = await User.findById(req.user.id);

//     if (!student) {
//       return res.status(404).json({ message: "Student not found" });
//     }

//     const data = await Timetable.find({
//       semester: student.semester,
//       division: student.division,
//       batchType: student.batchType
//     }).sort({ startTime: 1 });


//     res.json(data);

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }

// });
router.get("/timetable", verifyToken, getStudentTimetable);

export default router;
