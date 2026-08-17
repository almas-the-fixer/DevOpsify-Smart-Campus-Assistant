// models/teacherModels/NotificationRead.js

import mongoose from "mongoose";

const schema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  overrideId: mongoose.Schema.Types.ObjectId,
  read: { type: Boolean, default: true }
});

export default mongoose.model("NotificationRead", schema);