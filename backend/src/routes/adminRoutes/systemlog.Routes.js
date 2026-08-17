import express from "express";
import { getSystemLogs } from "../../controllers/systemlog.Controller.js";
import {verifyToken} from "../../middleware/auth.Middleware.js";

const router = express.Router();

router.get("/", verifyToken, getSystemLogs);

export default router;
