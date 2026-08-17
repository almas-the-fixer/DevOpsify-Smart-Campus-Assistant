import express from "express";
import auth from "../../middleware/auth.Middleware.js";

import {
  getTodayLectures,
  takeAttendance,
  getHistory,
  getStats,
  editAttendance,
} from "../../controllers/attendance.Controller.js";

import {
  exportExcel,
  exportPDF,getAnalysisOptions, exportAnalysisReport
} from "../../controllers/attendance.Controller.js";


const router = express.Router();



router.get("/export/excel", auth, exportExcel);

router.get("/export/pdf", auth, exportPDF);

router.get("/today", auth, getTodayLectures);

router.post("/take", auth, takeAttendance);

router.get("/history", auth, getHistory);

router.get("/stats", auth, getStats);

router.put("/edit/:id", auth, editAttendance);
router.get("/analysis/options", auth, getAnalysisOptions);
router.get("/analysis/export/:type", auth, exportAnalysisReport);


export default router;
