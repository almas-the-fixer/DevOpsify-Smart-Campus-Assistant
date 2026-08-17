// routes/teacherRoutes/notificationRoutes.js

import express from "express";
import {
  getTeacherNotifications,
  getUnreadCount,markAsReadTeacher,getTeacherAnnouncements,
  getTeacherUnreadCount,markTeacherAnnouncementRead
} from "../../controllers/notificationController.js";
import authMiddleware from "../../middleware/auth.Middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getTeacherNotifications);
router.put("/read/:id", authMiddleware, markAsReadTeacher);
router.get("/unread-count", authMiddleware, getUnreadCount);


router.get("/announcements",authMiddleware,getTeacherAnnouncements);

router.get("/announcements/unread-count",authMiddleware,getTeacherUnreadCount);

router.post("/announcements/mark-read",authMiddleware,markTeacherAnnouncementRead);

export default router;