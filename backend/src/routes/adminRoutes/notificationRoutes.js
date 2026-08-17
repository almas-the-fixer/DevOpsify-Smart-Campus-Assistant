// routes/notificationRoutes.js
import express from "express";
import {
  cancelLecture,
  updateLecture,
  getMyNotifications,
  markAsRead
} from "../../controllers/notificationController.js";

import { verifyToken } from "../../middleware/auth.Middleware.js";

const router = express.Router();

router.post("/cancel/:id", verifyToken, cancelLecture);
router.put("/update/:id", verifyToken, updateLecture);
router.get("/my", verifyToken, getMyNotifications);
router.put("/read/:id", verifyToken, markAsRead);

export default router;