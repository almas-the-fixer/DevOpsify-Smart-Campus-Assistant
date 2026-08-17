import express from "express";
import {
  createAnnouncement,
  getAnnouncements,
  deactivateAnnouncement,
  getAnnouncementStats,
  updateAnnouncement,togglePin,
  deleteAnnouncement,
  getAcademicMeta
} from "../../controllers/announcementController.js";

import verifyToken from "../../middleware/auth.Middleware.js";

const router = express.Router();

// routes/announcementRoutes.js
router.get("/meta", verifyToken, getAcademicMeta);
router.get("/",verifyToken,getAnnouncements);

router.post("/",verifyToken,createAnnouncement);

router.patch("/:id",verifyToken,updateAnnouncement);

router.delete("/:id",verifyToken,deleteAnnouncement);

router.patch("/:id/pin",verifyToken,togglePin);

router.patch("/:id/deactivate", verifyToken, deactivateAnnouncement);
// routes/announcementRoutes.js

router.get("/stats", verifyToken, getAnnouncementStats);

export default router;