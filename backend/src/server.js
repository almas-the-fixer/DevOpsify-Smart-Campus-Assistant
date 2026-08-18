import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import User from './models/adminModels/User.js'; 
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import connectDB from "./config/db.js";
import authRoutes from "./routes/adminRoutes/auth.Routes.js";
import userRoutes from "./routes/adminRoutes/user.Routes.js";
import adminRoutes from "./routes/adminRoutes/admin.Routes.js";
import attendanceRoutes from "./routes/adminRoutes/attendance.Routes.js";
import timetableRoutes from "./routes/adminRoutes/timetable.Routes.js";
import systemlogRoutes from "./routes/adminRoutes/systemlog.Routes.js";
import subjectRoutes from "./routes/teacherRoutes/subjects.Routes.js";
import materialRoutes from "./routes/teacherRoutes/material.Routes.js";
import teacherAttendanceRoutes from "./routes/teacherRoutes/attendance.Routes.js";
import studentRoutes from "./routes/students.Routes.js";
import TeacherTimetableRoutes from "./routes/teacherRoutes/timetable.Routes.js"
import notificationRoutes from "./routes/adminRoutes/notificationRoutes.js";
import availabilityRoutes from "./routes/adminRoutes/availability.Routes.js";
import subjectRoutes1 from "./routes/adminRoutes/subject.Routes.js";
import overrideRoutes from "./routes/adminRoutes/override.Routes.js";
import overrideRoutes1 from "./routes/teacherRoutes/override.Routes.js"
import notificationRoutes1 from "./routes/teacherRoutes/notification.Routes.js"
import conflictRoutes from "./routes/adminRoutes/conflict.Routes.js";
import announcementRoutes from "./routes/adminRoutes/announcement.Routes.js";
import discussionRoutes from "./routes/teacherRoutes/discussion.Routes.js";


dotenv.config({path: "../.env" });
connectDB();

const adminEmail = 'admin@campus.com';
const adminPassword = 'Admin@123';

const seedAdmin = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/campus_db';
    
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected for Seeding...');

    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      console.log(`⚠️ Admin user already exists: ${admin.email}`);
      return; // <--- ADD THIS RIGHT HERE!
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create the Admin User
    admin = await User.create({
      name: 'Super Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin' 
    });

    console.log('🚀 Admin user created successfully!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);

  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    // Don't exit here either, let the server try to start anyway!
  }
};

seedAdmin();

const app = express();


const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://smart-campus-assistant-eight.vercel.app",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/attendance-api", attendanceRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/systemlogs", systemlogRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/materials", materialRoutes);

app.use("/api", availabilityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin/subjects", subjectRoutes1);
app.use("/api/check-conflict", conflictRoutes);
app.use("/api/override", overrideRoutes);
app.use("/api/override/teacher", overrideRoutes1);
app.use("/api/teacher/timetable", TeacherTimetableRoutes);
app.use("/api/teacher/attendance", teacherAttendanceRoutes);
app.use("/api/student", studentRoutes);

app.use("/api/admin/announcements", announcementRoutes);
app.use("/api/teacher/notifications", notificationRoutes1);
app.use("/api/teacher/discussion", discussionRoutes);

app.get("/", (req, res) => {
  res.send("Smart Campus Assistant Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
