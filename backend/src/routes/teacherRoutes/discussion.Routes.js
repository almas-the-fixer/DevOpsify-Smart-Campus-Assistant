import express from "express";
import {
  getOrCreateDiscussion,
  getMessages,
  sendMessage,
  deleteMessage,
} from "../../controllers/discussion.Controller.js";
import verifyToken from "../../middleware/auth.Middleware.js";
import { editMessage, deleteOwnMessage } from "../../controllers/discussion.Controller.js";

const router = express.Router();

/* ================= DISCUSSION ================= */


/* GET /discussion */
router.get(
  "/",
  verifyToken,
  getOrCreateDiscussion
);

/* GET /discussion/messages/:discussionId */
router.get(
  "/messages/:discussionId",
  verifyToken,
  getMessages
);

/* POST /discussion/message */
router.post(
  "/message",
  verifyToken,
  sendMessage
);

/* DELETE /discussion/message/:messageId */
router.delete(
  "/message/:messageId",
  verifyToken,
  deleteMessage
);

router.put("/message/:messageId", verifyToken, editMessage);
router.delete("/message/:messageId", verifyToken, deleteOwnMessage);

export default router;