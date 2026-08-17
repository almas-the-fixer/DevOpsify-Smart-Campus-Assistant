import bcrypt from "bcryptjs";
import User from "../models/adminModels/User.js";

const SUBJECTS_BY_SEMESTER = {
  6: ["SEQA", "MC", "UDP/TDP", "RM", "AWS"],
  8: ["ADA", "AML", "WAS", "React Native", "MERN", "Flutter"],
};

export const createUser = async (req, res) => {
  try {
const { name, email, semester, division, rollNo, subjects } = req.body;
    const role = req.body.role?.toLowerCase();

    // 🔐 Admin check
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    // ❌ Duplicate email
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 🎓 Student validation
    if (role === "student") {
      if (!semester || !division || !rollNo) {
        return res.status(400).json({
          message: "All student fields are required",
        });
      }

      if (!SUBJECTS_BY_SEMESTER[Number(semester)]) {
        return res.status(400).json({
          message: "Invalid semester for subjects",
        });
      }
    }

    // 👨‍🏫 Teacher validation
    if (role === "teacher") {
      if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
        return res.status(400).json({
          message: "At least one subject is required for teacher",
        });
      }
    }

    // 🔑 Default password
    const hashedPassword = await bcrypt.hash("12345678", 10);

const user = await User.create({
  name,
  email,
  password: hashedPassword,
  role,

semester: role === "student" ? Number(semester) : undefined,
  division: role === "student" ? division : undefined,
  rollNo: role === "student" ? rollNo : undefined,

    subjects: role === "teacher"
  ? subjects || []
  : role === "student"
? SUBJECTS_BY_SEMESTER[Number(semester)]
  : [],


  // ✅ FIXED PART
  batchType: role === "student" ? "NORMAL" : undefined,
  batchHistory: role === "student"
    ? [
        {
          type: "NORMAL",
          from: new Date().toISOString().split("T")[0],
          to: null,
        },
      ]
    : [],

  isFirstLogin: true,
  isActive: true,
});


    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("CREATE USER ERROR 👉", err);
    res.status(500).json({ message: "User creation failed" });
  }
};
