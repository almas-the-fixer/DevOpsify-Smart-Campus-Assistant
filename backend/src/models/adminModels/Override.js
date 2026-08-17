import mongoose from "mongoose";

const overrideSchema = new mongoose.Schema({
  lectureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Timetable",
    required: true
  },

  date: {
    type: String,
    required: true
  },

  type: {
    type: String,
    enum: ["UPDATE", "CANCEL"],
    required: true
  },

  // 🔥 NEW (IMPORTANT)
  updatedByRole: {
    type: String,
    enum: ["ADMIN", "TEACHER"],
    required: true
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  updatedData: {
    subject: String,
    subjectId: mongoose.Schema.Types.ObjectId,
    teacherId: mongoose.Schema.Types.ObjectId,
    teacherName: String,
    startTime: String,
    endTime: String,
    room: String
  },

  reason: String

}, { timestamps: true });

// 🔥 prevent duplicate override per day
overrideSchema.index(
  { lectureId: 1, date: 1 },
  { unique: true }
);

export default mongoose.model("Override", overrideSchema);