import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema(
  {
    day: String,

    startTime: String,
    endTime: String,

    subject: String,
    subjectType: String,

    semester: Number,
    division: String,

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    teacherName: String,
  /* 🔥 ADD THIS */
  batchType: {
    type: String,
    enum: ["NORMAL", "OJT"],
    default: "NORMAL",
  },
    room: String,
  },
  { timestamps: true }
);

export default mongoose.model("Timetable", timetableSchema);
