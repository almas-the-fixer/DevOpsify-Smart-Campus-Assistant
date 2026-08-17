import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    key: String,
    name: String,
    semester: Number,
    division: String,

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    teacherName: String,
  },
  { timestamps: true }
);

export default mongoose.model("Subject", subjectSchema);
