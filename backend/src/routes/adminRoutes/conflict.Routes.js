import express from "express";
import { checkConflict } from "../../controllers/availabilityController.js";

const router = express.Router();

router.post("/", checkConflict);

export default router;