import mongoose from "mongoose";
import express from "express";
import Subject from "../../models/teacherModels/subjects.js";
import verifyToken  from "../../middleware/auth.Middleware.js";
import { getSubjects } from "../../controllers/subjectController.js";
const router = express.Router();


// routes
router.get("/subjects", getSubjects);

router.get("/my", verifyToken, async (req, res) => {
  try {

    const teacherId = new mongoose.Types.ObjectId(req.user.id);

    const subjects = await Subject.aggregate([
      {
        $match: { teacherId }
      },

      {
        $group: {
          _id: {
            name: "$name",
            semester: "$semester"
          },

          divisions: { $addToSet: "$division" },
          key: { $first: "$key" },
        },
      },

      {
        $project: {
          _id: 0,
          name: "$_id.name",
          semester: "$_id.semester",
          divisions: 1,
          key: 1,
        },
      },
      {
  $sort: { semester: 1 }
}

    ]);

    res.json(subjects);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;