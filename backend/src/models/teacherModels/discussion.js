import mongoose from "mongoose";

const discussionSchema = new mongoose.Schema(
  {
    subject: String,
    semester: Number,
    division: {
      type: String,
      default: "All",
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    teacherName: String,
  },
  { timestamps: true }
);

export default mongoose.model("Discussion", discussionSchema);