// controllers/availabilityController.js

import Subject from "../models/teacherModels/subjects.js";
import Timetable from "../models/adminModels/Timetable.js";



export const getAvailableTeachers = async (req, res) => {
  try {
    const { subjectId } = req.query;

    const subjects = await Subject.find({ _id: subjectId });

    // 🔥 UNIQUE teachers
    const uniqueTeachersMap = new Map();

    subjects.forEach(s => {
      uniqueTeachersMap.set(s.teacherId.toString(), {
        _id: s.teacherId,
        name: s.teacherName
      });
    });

    const teachers = Array.from(uniqueTeachersMap.values());

    res.json(teachers);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


import mongoose from "mongoose";

export const getAvailableSlots = async (req, res) => {
  try {
    const { teacherId, day, semester, division } = req.query;

    if (!teacherId || !day || !semester || !division) {
      return res.status(400).json({ msg: "Missing params" });
    }

    // 🔥 Teacher busy slots
   const { lectureId } = req.query;
const ignoreId = lectureId && mongoose.Types.ObjectId.isValid(lectureId)
  ? new mongoose.Types.ObjectId(lectureId)
  : null;
const teacherLectures = await Timetable.find({
  teacherId: new mongoose.Types.ObjectId(teacherId),
  day,
  ...(ignoreId && { _id: { $ne: ignoreId } })
});

    const teacherBusy = teacherLectures.map(l => l.startTime);

    // 🔥 Class busy slots (VERY IMPORTANT)
const classLectures = await Timetable.find({
  semester,
  division,
  day,
  ...(ignoreId && { _id: { $ne: ignoreId } })
}); 

    const classBusy = classLectures.map(l => l.startTime);

    // 🔥 All slots
    const ALL_SLOTS = [
      { start: "08:00", end: "08:50" },
      { start: "08:55", end: "09:45" },
      { start: "09:50", end: "10:40" },
      { start: "10:45", end: "11:35" },
      { start: "11:40", end: "12:30" },
      { start: "12:35", end: "01:25" },
      { start: "01:30", end: "02:20" },
      { start: "02:25", end: "03:15" },
      { start: "03:20", end: "04:10" },
      { start: "04:10", end: "05:05" }
    ];

    // 🔥 Filter both conditions
    const available = ALL_SLOTS.filter(slot => {
      return (
        !teacherBusy.includes(slot.start) &&
        !classBusy.includes(slot.start)
      );
    });

    res.json(available);

  } catch (err) {
    console.error("SLOTS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


export const getAvailableRooms = async (req, res) => {
  try {
    const { day, startTime } = req.query;

    const lectures = await Timetable.find({ day, startTime });

    const occupiedRooms = lectures.map(l => l.room);

    const ALL_ROOMS = ["215", "314", "Lab-1", "Lab-2", "Lab-3"];

    const availableRooms = ALL_ROOMS.filter(
      r => !occupiedRooms.includes(r)
    );

    res.json(availableRooms);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /check-conflict

// export const checkConflict = async (req, res) => {
//   try {
//     const { teacherId, day, startTime, room, semester, division } = req.body;

//     const teacherClash = await Timetable.findOne({
//       teacherId,
//       day,
//       startTime
//     });

//     const roomClash = await Timetable.findOne({
//       room,
//       day,
//       startTime
//     });

//     const classClash = await Timetable.findOne({
//       semester,
//       division,
//       day,
//       startTime
//     });

//     if (teacherClash) return res.json({ conflict: "TEACHER_BUSY" });
//     if (roomClash) return res.json({ conflict: "ROOM_BUSY" });
//     if (classClash) return res.json({ conflict: "CLASS_BUSY" });

//     res.json({ conflict: null });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

export const checkConflict = async (req, res) => {
  try {

    const { teacherId, day, startTime, room, semester, division } = req.body;

    const today = new Date();
    const todayDay = today.toLocaleDateString("en-US", { weekday: "long" });

    // =============================
    // TIME WINDOW CHECK
    // =============================

    if (day === todayDay) {

      const [h, m] = startTime.split(":").map(Number);

      const slotTime = new Date();
      slotTime.setHours(h, m, 0, 0);

      if (slotTime <= today) {
        return res.json({
          conflict: "PAST_TIME_NOT_ALLOWED"
        });
      }
    }

    // =============================
    // NORMAL CONFLICT CHECKS
    // =============================

    const teacherClash = await Timetable.findOne({
      teacherId,
      day,
      startTime
    });

    const roomClash = await Timetable.findOne({
      room,
      day,
      startTime
    });

    const classClash = await Timetable.findOne({
      semester,
      division,
      day,
      startTime
    });

    if (teacherClash) return res.json({ conflict: "TEACHER_BUSY" });
    if (roomClash) return res.json({ conflict: "ROOM_BUSY" });
    if (classClash) return res.json({ conflict: "CLASS_BUSY" });

    res.json({ conflict: null });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};