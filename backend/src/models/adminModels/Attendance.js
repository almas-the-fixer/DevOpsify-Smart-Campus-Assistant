  import mongoose from "mongoose";

  const attendanceSchema = new mongoose.Schema(
    {
      subject: {
        type: String,
        required: true,
      },

      semester: {
        type: Number,
        required: true,
      },

      division: {
        type: String,
        required: true,
      },

      date: {
        type: String, // "2026-01-29"
        required: true,
      },

      day: {
        type: String, // "Tuesday"
        required: true,
      },

      teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // ya Teacher model
        required: true,
      },

      teacherName: {
        type: String,
        required: true,
      },

      teacherEmail: {
        type: String,
        required: true,
      },

      presentStudents: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],

      totalStudents: {
        type: Number,
        required: true,
      },
      lectureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Timetable",
      required: true,
    },
      batchType: {
  type: String,
  enum: ["NORMAL", "OJT"],
  required: true,
},
      status:{
      type:String,
      default:"DONE" // DONE | MISSED
    },

    edited:{
      type:Boolean,
      default:false
    }
    },
    { timestamps: true }
  );

  export default mongoose.model("Attendance", attendanceSchema);
