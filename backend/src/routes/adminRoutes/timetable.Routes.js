import express from "express";
import Timetable from "../../models/adminModels/Timetable.js";
import auth from "../../middleware/auth.Middleware.js";
import {
  getLectureWithStudents,
} from "../../controllers/attendance.Controller.js";
import { getLectureById, getTimetable } from "../../controllers/timetableController.js";



const router = express.Router();

// 👉 Get All Timetables (Admin)
router.get("/", getTimetable);


// 👉 Semester + Division Wise
router.get("/class", async (req, res) => {
  const { semester, division } = req.query;

  try {
    const data = await Timetable.find({
      semester,
      division,
    });

    res.json(data);

  } catch (err) {
    res.status(500).json(err);
  }
});


// 👉 Teacher Wise
router.get("/teacher/:id", async (req, res) => {
  try {
    const data = await Timetable.find({
      teacherId: req.params.id,
    });

    res.json(data);

  } catch (err) {
    res.status(500).json(err);
  }
});


router.get("/lecture/:id", auth, getLectureWithStudents);

router.get("/:id", getLectureById); // 🔥 THIS IS MISSING
export default router;
