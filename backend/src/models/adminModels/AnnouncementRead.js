import mongoose from "mongoose";

const announcementReadSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  announcementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Announcement",
    required: true
  },

  read: {
    type: Boolean,
    default: true
  },

  readAt: {
    type: Date,
    default: Date.now
  }

},{timestamps:true});

export default mongoose.model(
  "AnnouncementRead",
  announcementReadSchema
);