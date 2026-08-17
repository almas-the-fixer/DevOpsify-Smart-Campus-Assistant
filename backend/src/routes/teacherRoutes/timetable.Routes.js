import express from "express";
import Timetable from "../../models/adminModels/Timetable.js";
import auth from "../../middleware/auth.Middleware.js";
import Override from "../../models/adminModels/Override.js";
import { getTeacherTimetable } from "../../controllers/timetableController.js";
const router = express.Router();

router.get("/me",auth,getTeacherTimetable);


export default router;