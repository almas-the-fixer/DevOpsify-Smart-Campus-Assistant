// routes/availabilityRoutes.js

import express from "express";
import {
  getAvailableTeachers,
  getAvailableSlots,
  getAvailableRooms,
} from "../../controllers/availabilityController.js";

const router = express.Router();

router.get("/available-teachers", getAvailableTeachers);
router.get("/available-slots", getAvailableSlots);
router.get("/available-rooms", getAvailableRooms);
export default router;