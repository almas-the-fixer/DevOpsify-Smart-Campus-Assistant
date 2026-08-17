import express from "express";
import bcrypt from "bcryptjs";
import User from "../../models/adminModels/User.js";
import { verifyToken, verifyAdmin } from "../../middleware/auth.Middleware.js";
import { getAttendanceRecords, getAttendanceSubjects, getAttendanceSummary, getAttendanceStats, bulkCreateUsers, bulkUploadTimetable } from "../../controllers/adminController.js";
import Attendance from "../../models/adminModels/Attendance.js";
import Timetable from "../../models/adminModels/Timetable.js";
import { startOJT, endOJT, getOjtHistory,getActiveOjt,updateOjt,getOjtDashboard,getSingleOjt } from "../../controllers/ojtController.js";

const router = express.Router();
router.get("/ojt/dashboard",getOjtDashboard);
router.get("/ojt/ojthistory",getOjtHistory);
router.get("/ojt/active",getActiveOjt);
router.get("/ojt/:id", getSingleOjt);

router.post("/ojt/start", startOJT);
router.put("/ojt/end", endOJT);
router.put("/ojt/:id",updateOjt);

router.get(
  "/attendance-records",
  getAttendanceRecords
);

router.get(
  "/attendance-records/subjects",
  getAttendanceSubjects
);

router.put(
  "/users/:id/batch",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { batchType } = req.body;
      const user = await User.findById(req.params.id);

      if (!user || user.role !== "student") {
        return res.status(400).json({ message: "Invalid student" });
      }

      const today = new Date().toISOString().split("T")[0];

      // close previous batch
      const last = user.batchHistory.at(-1);
      if (last && !last.to) {
        last.to = today;
      }

      // add new batch entry
      user.batchHistory.push({
        type: batchType,
        from: today,
        to: null,
      });

      user.batchType = batchType;

      await user.save();

      res.json({ message: "Batch updated" });

    } catch (err) {
      res.status(500).json({ message: "Batch update failed" });
    }
  }
);



/* ===========================
   ADMIN DASHBOARD STATS
=========================== */

router.get(
  "/dashboard-stats",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {

      /* USERS */
      const totalUsers = await User.countDocuments({
        role: { $in: ["student", "teacher"] },
      });

      const students = await User.countDocuments({ role: "student" });
      const teachers = await User.countDocuments({ role: "teacher" });
      
      const blocked = await User.countDocuments({
        isActive: false,
        role: { $ne: "admin" }, // 👈 important
      });

      /* TODAY DATE + DAY */
      const now = new Date();
      const todayDate = now.toISOString().split("T")[0];
      const todayDay = now.toLocaleString("en-US", { weekday: "long" });

      /* TODAY'S SCHEDULED LECTURES (Timetable) */
      const todayTimetables = await Timetable.find({
        day: todayDay,
      });

      const totalScheduledLectures = todayTimetables.length;

      /* TODAY'S TAKEN LECTURES (Attendance) */
      const todayAttendances = await Attendance.find({
        date: todayDate,
      });

      const lecturesTakenToday = todayAttendances.length;

      /* ACTIVE TEACHERS (from attendance, all time) */
      const activeTeachers = await Attendance.distinct("teacherId");
      const inactiveTeachers =
        teachers - activeTeachers.length >= 0
          ? teachers - activeTeachers.length
          : 0;
const completionRate =
  totalScheduledLectures > 0
    ? Math.round((lecturesTakenToday / totalScheduledLectures) * 100)
    : 0;

     res.json({
  totalUsers,
  students,
  teachers,
  blocked,

  analytics: {
    today: {
      taken: lecturesTakenToday,
      total: totalScheduledLectures,
      completionRate,   // 👈 NEW
    },
    activeTeachers: activeTeachers.length,
    inactiveTeachers,
  },
});


    } catch (err) {
      console.error("Dashboard stats failed:", err);
      res.status(500).json({ message: "Dashboard stats failed" });
    }
  }
);


router.get(
  "/today-attendance",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {

      const now = new Date();
      const date = now.toISOString().split("T")[0];
      const day = now.toLocaleString("en-US", { weekday: "long" });

      // Today timetable
      const timetables = await Timetable.find({ day });

      // Today attendance
      const attendances = await Attendance.find({ date });

      const result = timetables.map(tt => {

        const taken = attendances.find(a =>
          a.lectureId?.toString() === tt._id.toString()
        );

        return {
          subject: tt.subject,
          time: `${tt.startTime} - ${tt.endTime}`,
          teacherName: tt.teacherName,
          room: tt.room,

          lectureId: tt._id,      // for future detail page
          teacherId: tt.teacherId,
          date,

          status: taken ? "Taken" : "Pending",
        };
      });

      res.json(result);

    } catch (err) {

      console.error("Today attendance error:", err);

      res.status(500).json({
        message: "Failed to load today attendance",
      });
    }
  }
);


router.get("/attendance-stats", verifyToken, verifyAdmin, getAttendanceStats);

router.post("/users/bulk", verifyToken, verifyAdmin, bulkCreateUsers);
router.post("/timetable/bulk", verifyToken, verifyAdmin, bulkUploadTimetable);

router.get(
  "/attendance-records",
  verifyToken,
  verifyAdmin,
  getAttendanceRecords
);



router.get(
  "/attendance-summary",
  verifyToken,
  verifyAdmin,
  getAttendanceSummary
);

/* ===========================
   GET ALL USERS
=========================== */
router.get("/users", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/* ===========================
   UPDATE USER ROLE
=========================== */
router.put("/users/:id/role", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    await User.findByIdAndUpdate(req.params.id, { role });
    res.json({ message: "Role updated" });
  } catch {
    res.status(500).json({ message: "Role update failed" });
  }
});

/* ===========================
   RESET PASSWORD → 12345678
=========================== */
router.put(
  "/users/:id/reset-password",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const hashed = await bcrypt.hash("12345678", 10);
      await User.findByIdAndUpdate(req.params.id, { password: hashed,isFirstLogin: true });
      res.json({ message: "Password reset successful" });
    } catch {
      res.status(500).json({ message: "Password reset failed" });
    }
  }
);

/* ===========================
   DELETE USER
=========================== */
router.delete("/users/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
});

/* ===========================
   BLOCK / UNBLOCK USER
=========================== */
router.put(
  "/users/:id/block",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { isActive } = req.body;

      await User.findByIdAndUpdate(req.params.id, {
        isActive,
      });

      res.json({
        message: isActive
          ? "User unblocked successfully"
          : "User blocked successfully",
      });
    } catch (err) {
      res.status(500).json({ message: "Block action failed" });
    }
  }
);


export default router;

