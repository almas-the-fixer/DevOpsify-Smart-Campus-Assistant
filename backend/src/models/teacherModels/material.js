import mongoose from "mongoose";

const materialSchema = new mongoose.Schema(
  {
    title: String,
    description: String,

    subject: String,
    semester: Number,

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    fileUrl: String,
    fileName: String,
    fileType: String,
    fileSize: Number,

  },
  { timestamps: true }
);

export default mongoose.model("Material", materialSchema);
