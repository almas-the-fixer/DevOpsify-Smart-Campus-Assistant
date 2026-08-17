import express from "express";
import { updateLecture, cancelLecture } from "../../controllers/overrideController.js";
import { verifyToken, verifyAdmin } from "../../middleware/auth.Middleware.js";
const router = express.Router();

// 🔥 ADMIN ONLY
router.put("/update/:id", verifyToken, verifyAdmin, updateLecture);
router.post("/cancel/:id", verifyToken, verifyAdmin, cancelLecture);


export default router;