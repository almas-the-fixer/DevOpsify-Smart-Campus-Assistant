// controllers/subjectController.js

import Subject from "../models/teacherModels/subjects.js";
// controller
export const getSubjects = async (req, res) => {
  try {
    const { semester, division } = req.query;

    const subjects = await Subject.aggregate([
      {
        $match: {
          semester: Number(semester),
          division: division
        }
      },
      {
        $group: {
          _id: {
            name: "$name",
            semester: "$semester",
            division: "$division"
          },
          subject: { $first: "$$ROOT" }
        }
      },
      {
        $replaceRoot: { newRoot: "$subject" }
      }
    ]);

    res.json(subjects);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};