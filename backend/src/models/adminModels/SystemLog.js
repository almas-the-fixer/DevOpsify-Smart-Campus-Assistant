import mongoose from "mongoose";

const systemLogSchema = new mongoose.Schema(
  {
    action: String,

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    role: String,

    details: Object,

    ipAddress: String,
  },
  { timestamps: true }
);

export default mongoose.model("SystemLog", systemLogSchema);
