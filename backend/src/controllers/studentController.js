import Timetable from "../models/adminModels/Timetable.js";
import Override from "../models/adminModels/Override.js"; // 🔥 ADD THIS
export const getStudentTimetable = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const timetable = await Timetable.find({
      semester: req.user.semester,
      division: req.user.division
    });

    const overrides = await Override.find({ date: today });

    const overrideMap = new Map();
    overrides.forEach(o => {
      overrideMap.set(o.lectureId.toString(), o);
    });

    const finalData = timetable.map(lec => {
      const override = overrideMap.get(lec._id.toString());

      if (!override) return lec;

      if (override.type === "CANCEL") {
        return {
          ...lec.toObject(),
          isCancelled: true,
          reason: override.reason
        };
      }

      if (override.type === "UPDATE") {
        return {
          ...lec.toObject(),
          ...override.updatedData,
          isUpdated: true
        };
      }

      return lec;
    });

    res.json(finalData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};