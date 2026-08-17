import express from "express";
import Attendance from "../../models/adminModels/Attendance.js";
import { getAttendanceRecords, getAttendanceSubjects } from "../../controllers/adminController.js";
const router = express.Router();


// 👉 Get All Attendance (Admin Panel)
router.get("/", async (req, res) => {
  try {
    const data = await Attendance.find()
      .sort({ date: -1 });

    res.json(data);

  } catch (err) {
    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
});

router.get(
  "/attendance-records",
  getAttendanceRecords
);

router.get(
  "/attendance-records/subjects",
  getAttendanceSubjects
);

// 👉 Get Teacher Wise Attendance
router.get("/teacher/:id", async (req, res) => {
  try {
    const data = await Attendance.find({
      teacherId: req.params.id,
    });

    res.json(data);

  } catch (err) {
    res.status(500).json(err);
  }
});


// 👉 Get Class Wise Attendance
router.get("/class", async (req, res) => {
  const { semester, division } = req.query;

  try {
    const data = await Attendance.find({
      semester,
      division,
    });

    res.json(data);

  } catch (err) {
    res.status(500).json(err);
  }
});


export default router;
