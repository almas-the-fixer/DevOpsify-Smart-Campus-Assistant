import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      required: true,
    },

    // 🔹 Student-only fields
    semester: {
      type: Number,
      required: function () {
        return this.role === "student";
      },
    },

    division: {
      type: String,
      required: function () {
        return this.role === "student";
      },
    },

    rollNo: {
      type: Number,
      required: function () {
        return this.role === "student";
      },
    },

    subjects: {
      type: [String],
      default: [],
    },
// 🔹 Batch / OJT Tracking
batchType: {
  type: String,
  enum: ["NORMAL", "OJT"],
  default: "NORMAL",
},

batchHistory: [
  {
    type: {
      type: String, // NORMAL | OJT
      required: true,
    },
    from: {
      type: String, // "2026-02-01"
      required: true,
    },
    to: {
      type: String, // "2026-02-10" | null = current
      default: null,
    },
  },
],

  phone:{
    type:String,
  },
    // 🔹 Common flags
    isActive: {
      type: Boolean,
      default: true,
    },

    isFirstLogin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
