// models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["CANCELLED", "UPDATED", "CREATED"],
    required: true
  },

  title: String,
  message: String,

  lectureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Timetable"
  },

  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  targetAudience: {
    semester: Number,
    division: String,
    batchType: String
  },

  changes: {
    oldData: Object,
    newData: Object
  },

  reason: String,

  date: String,
  startTime: String,
  endTime: String,
  subject: String,
  room: String,

  isReadBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);