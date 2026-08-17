import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    discussionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discussion",
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    senderName: String,
    senderRole: {
      type: String,
      enum: ["teacher", "student"],
    },
    message: String,
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("DiscussionMessage", messageSchema);