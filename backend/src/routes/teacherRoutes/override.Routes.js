import express from "express";
import Timetable from "../../models/adminModels/Timetable.js";
import verifyToken from "../../middleware/auth.Middleware.js";
import { updateLectureTeacher,cancelLectureTeacher } from "../../controllers/overrideController.js";

const router = express.Router();

router.put("/update/:id", verifyToken, updateLectureTeacher);
router.post("/cancel/:id", verifyToken, cancelLectureTeacher);




export default router;