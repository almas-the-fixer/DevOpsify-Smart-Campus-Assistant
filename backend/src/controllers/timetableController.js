import Override from "../models/adminModels/Override.js";
import Timetable from "../models/adminModels/Timetable.js";

import mongoose from "mongoose";

export const getLectureById = async (req, res) => {
  try {

    const { id } = req.params;

    // 🔥 invalid id handle
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid ID" });
    }

    const lecture = await Timetable.findById(id);

    if (!lecture) {
      return res.status(404).json({ msg: "Lecture not found" });
    }

    res.json(lecture);

  } catch (err) {
    console.error("GET LECTURE ERROR:", err); // 👈 IMPORTANT
    res.status(500).json({ error: err.message });
  }
};


export const getTimetable = async (req, res) => {
  try {

    const today = new Date().toLocaleDateString("en-CA"); // ✅ IST safe

    const baseLectures = await Timetable.find();

    const overrides = await Override.find({ date: today })
      .sort({ createdAt: -1 });

    // 🔥 O(1) lookup
    const overrideMap = new Map();

    overrides.forEach(o => {
      if (!overrideMap.has(o.lectureId.toString())) {
        overrideMap.set(o.lectureId.toString(), o);
      }
    });

    const final = baseLectures.map(lecture => {

      const override = overrideMap.get(lecture._id.toString());

      if (!override) return lecture;

      if (override.type === "CANCEL") return null;

      if (override.type === "UPDATE") {
        return {
          ...lecture._doc,
          ...override.updatedData,
          isModified: true,
          overrideId: override._id
        };
      }

    }).filter(Boolean);

    res.json(final);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getTeacherTimetable = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const today = new Date().toLocaleDateString("en-CA");

    // 1️⃣ Base lectures (teacher ke)
    const baseLectures = await Timetable.find({ teacherId });

    // 2️⃣ ALL overrides (date-based only)
    const overrides = await Override.find({ date: today })
      .sort({ createdAt: -1 });

    // 3️⃣ Filter only relevant overrides
    const overridesFiltered = overrides.filter(o =>
      baseLectures.some(l => l._id.toString() === o.lectureId.toString())
    );

    // 4️⃣ Map
    const overrideMap = new Map();

    overridesFiltered.forEach(o => {
      const key = o.lectureId.toString();

      if (!overrideMap.has(key)) {
        overrideMap.set(key, o);
      }
    });

    // 5️⃣ Merge
    let final = baseLectures.map(lecture => {
      const override = overrideMap.get(lecture._id.toString());

      if (!override) return lecture;

      if (override.type === "CANCEL") return null;

      if (override.type === "UPDATE") {
        return {
          ...lecture._doc,
          ...override.updatedData,
          isModified: true
        };
      }

      return lecture;
    }).filter(Boolean);

    // 6️⃣ EXTRA
    const extraLectures = overridesFiltered
      .filter(o => o.type === "EXTRA")
      .map(o => ({
        ...o.updatedData,
        isExtra: true
      }));

    final = [...final, ...extraLectures];

    res.json(final);

  } catch (err) {
    console.error("Teacher timetable error:", err);
    res.status(500).json({ error: err.message });
  }
};