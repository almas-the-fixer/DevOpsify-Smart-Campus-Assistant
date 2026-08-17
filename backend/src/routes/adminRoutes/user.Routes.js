import express from "express";
import bcrypt from "bcryptjs";
import { verifyToken } from "../../middleware/auth.Middleware.js";
import User from "../../models/adminModels/User.js";
import { createUser } from "../../controllers/user.controller.js";

const router = express.Router();

/* ---------------- CREATE USER (Admin) ---------------- */
router.post("/create", verifyToken, createUser);


/* -------- GET NEXT ROLL NO (Semester + Division) -------- */
router.get("/next-roll", verifyToken, async (req, res) => {
  try {
    const { semester, division } = req.query;

    if (!semester || !division) {
      return res.status(400).json({ message: "Semester and division required" });
    }

    const sem = Number(semester);

    // 🔢 Base roll logic
    const base =
      division === "A"
        ? sem * 100
        : division === "B"
        ? sem * 100 + 100
        : division === "C"
        ? sem * 100 + 200
        : null;

    if (!base) {
      return res.status(400).json({ message: "Invalid division" });
    }

    // 🔍 Find last student in same sem + division
    const lastStudent = await User.findOne({
      role: "student",
      semester: sem,
      division,
    }).sort({ rollNo: -1 });

    const nextRoll = lastStudent
      ? lastStudent.rollNo + 1
      : base + 1;

    res.json({ rollNo: nextRoll });
  } catch (err) {
    console.error("ROLL GEN ERROR 👉", err);
    res.status(500).json({ message: "Failed to generate roll number" });
  }
});


/* -------- CHANGE PASSWORD (FIRST LOGIN) -------- */
router.put("/change-password", verifyToken, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(req.user.id, {
      password: hashed,
      isFirstLogin: false,
    });

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR 👉", err);
    res.status(500).json({ message: "Password change failed" });
  }
});



/* ---------------- GET LOGGED-IN USER ---------------- */
router.get("/me", verifyToken, async (req, res) => {
  try {
    // FIX: select() mein semester, division, aur rollNo add kiya
    const user = await User.findById(req.user.id)
      .select("name email role semester division rollNo subjects");

    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

/* ---------------- UPDATE PROFILE ---------------- */
router.put("/update-profile", verifyToken, async (req, res) => {
  try {
    const { name, password, semester, division, rollNo } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (semester) updateData.semester = semester;
    if (division) updateData.division = division;
    if (rollNo) updateData.rollNo = rollNo;

    if (password) {
      if (password.length < 8) {
        return res.status(400).json({
          message: "Password must be at least 8 characters"
        });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select("name email role semester division rollNo"); // FIX: select() updated

    return res.json(updatedUser);
  } catch (err) {
    console.error("UPDATE PROFILE ERROR 👉", err);
    return res.status(500).json({ message: "Profile update failed" });
  }
});


/* -------- UPDATE BATCH TYPE (NORMAL / OJT) -------- */
router.put("/admin/users/:id/batch", verifyToken, async (req, res) => {
  try {
    const { batchType } = req.body;
    const userId = req.params.id;
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    const user = await User.findById(userId);
    if (!user || user.role !== 'student') {
      return res.status(404).json({ message: "Student not found" });
    }

    // Agar batch same hai to update ki zarurat nahi
    if (user.batchType === batchType) return res.json(user);

    // 1. Purane batch ki 'to' date set karein (History maintain)
    if (user.batchHistory.length > 0) {
      const lastIndex = user.batchHistory.length - 1;
      if (!user.batchHistory[lastIndex].to) {
        user.batchHistory[lastIndex].to = today;
      }
    }

    // 2. Naya batch history mein add karein
    user.batchHistory.push({
      type: batchType,
      from: today,
      to: null
    });

    // 3. Current batchType update karein
    user.batchType = batchType;

    await user.save();
    res.json({ message: `Batch switched to ${batchType}`, user });
  } catch (err) {
    console.error("BATCH UPDATE ERROR 👉", err);
    res.status(500).json({ message: "Failed to update batch status" });
  }
});

export default router;
