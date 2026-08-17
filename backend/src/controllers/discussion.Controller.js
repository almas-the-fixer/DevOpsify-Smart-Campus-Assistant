import Discussion from "../models/teacherModels/discussion.js";
import DiscussionMessage from "../models/teacherModels/discussionMessage.js";
import mongoose from "mongoose";

/* ================= GET OR CREATE DISCUSSION ================= */

export const getOrCreateDiscussion = async (req, res) => {
  try {
    const { subject, semester, division } = req.query;

    if (!subject || !semester || !division) {
      return res.status(400).json({ message: "Missing parameters" });
    }
// 🔥 If division missing → set to "All"
    if (!division || division === "undefined" || division === "null") {
      division = "All";
    }
    let discussion;

    // ================= TEACHER =================
    if (req.user.role === "teacher") {
      discussion = await Discussion.findOne({
        subject,
        semester,
        division,
        teacherId: req.user.id,
      });

      if (!discussion) {
        discussion = await Discussion.create({
          subject,
          semester,
          division,
          teacherId: req.user.id,
          teacherName: req.user.name,
        });
      }
    }

    // ================= STUDENT =================
    else {
      discussion = await Discussion.findOne({
        subject,
        semester,
        division,
      });

      if (!discussion) {
        return res
          .status(404)
          .json({ message: "Discussion not started by teacher yet" });
      }
    }

    res.json(discussion);
  } catch (err) {
    console.error("Get Discussion Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET MESSAGES ================= */

export const getMessages = async (req, res) => {
  try {
    const { discussionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(discussionId)) {
      return res.status(400).json({ message: "Invalid discussion ID" });
    }

    const messages = await DiscussionMessage.find({
      discussionId,
      deleted: false,
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Get Messages Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= SEND MESSAGE ================= */

export const sendMessage = async (req, res) => {
  try {
    const { discussionId, message } = req.body;

    if (!discussionId || !message) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const newMsg = await DiscussionMessage.create({
      discussionId,
      senderId: req.user.id,
      senderName: req.user.name,
      senderRole: req.user.role,
      message,
    });

    res.status(201).json(newMsg);
  } catch (err) {
    console.error("Send Message Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= DELETE MESSAGE ================= */

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: "Invalid message ID" });
    }

    const message = await DiscussionMessage.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // ===== TEACHER: Can delete any message =====
    if (req.user.role === "teacher") {
      message.deleted = true;
      await message.save();
      return res.json({ message: "Message deleted by teacher" });
    }

    // ===== STUDENT: Can delete only own message =====
    if (
      req.user.role === "student" &&
      message.senderId.toString() === req.user.id
    ) {
      message.deleted = true;
      await message.save();
      return res.json({ message: "Message deleted" });
    }

    return res.status(403).json({ message: "Not authorized" });
  } catch (err) {
    console.error("Delete Message Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message } = req.body;

    const msg = await DiscussionMessage.findById(messageId);
    if (!msg) return res.status(404).json({ message: "Not found" });

    if (msg.senderId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const diff = Date.now() - new Date(msg.createdAt).getTime();
    const oneHour = 60 * 60 * 1000;

    if (diff > oneHour) {
      return res.status(403).json({ message: "Edit time expired" });
    }

    msg.message = message;
    msg.edited = true;
    await msg.save();

    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


export const deleteOwnMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const msg = await DiscussionMessage.findById(messageId);
    if (!msg) return res.status(404).json({ message: "Not found" });

    if (msg.senderId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const diff = Date.now() - new Date(msg.createdAt).getTime();
    const oneHour = 60 * 60 * 1000;

    if (diff > oneHour) {
      return res.status(403).json({ message: "Delete time expired" });
    }

    msg.deleted = true;
    await msg.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};