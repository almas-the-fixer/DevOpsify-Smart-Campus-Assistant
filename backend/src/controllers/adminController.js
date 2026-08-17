import Attendance from "../models/adminModels/Attendance.js";
import User from "../models/adminModels/User.js";
import Timetable from "../models/adminModels/Timetable.js";
import Subject from "../models/teacherModels/subjects.js";
import bcrypt from "bcryptjs";

export const bulkCreateUsers = async (req, res) => {
  try {
    const { users } = req.body;

    if (!users || !users.length) {
      return res.status(400).json({ message: "No users provided" });
    }

    const created = [];
    const skipped = [];

    for (const u of users) {

      const existing = await User.findOne({ email: u.email });

      if (existing) {
        skipped.push(u.email);
        continue;
      }

      const hashed = await bcrypt.hash("123456", 10);

   const role = u.role?.toLowerCase();

const userData = {
  name: u.name?.trim(),
  email: u.email?.trim(),
  password: hashed,
  role,
  subjects: u.subjects
    ? u.subjects.split(",").map(s => s.trim())
    : [],
  isActive: String(u.approved).toLowerCase() === "true",
  isFirstLogin: true
};

if (role === "student") {
  userData.semester = Number(u.semester);
  userData.division = u.division?.trim();
  userData.rollNo = Number(u.rollNo);

  userData.batchType = "NORMAL";   // default batch

  userData.batchHistory = [{
    type: "NORMAL",
    from: "2026-01-01",
    to: null
  }];
}

const newUser = await User.create(userData);
   created.push(newUser.email);
    }

    res.json({
      success: true,
      createdCount: created.length,
      skipped
    });

  } catch (err) {
    console.error("Bulk Upload Error:", err);
    res.status(500).json({ 
  message: "Bulk upload failed",
  error: err.message
});
  }
};


export const bulkUploadTimetable = async (req, res) => {
  try {
    const { sessions } = req.body;

    if (!sessions || !sessions.length) {
      return res.status(400).json({ message: "No timetable data provided" });
    }

    let createdCount = 0;
    let skippedCount = 0;

    for (const s of sessions) {

      /* ========= FIND TEACHER ========= */

      const teacher = await User.findOne({
        name: s.teacherName.trim(),
        role: "teacher"
      });

      if (!teacher) {
        skippedCount++;
        continue;
      }

      /* ========= FIND SUBJECT ========= */

      const subjectDoc = await Subject.findOne({
        name: s.subject.trim(),
        semester: Number(s.semester),
        division: s.division
      });

      if (!subjectDoc) {
        skippedCount++;
        continue;
      }

      /* ========= DUPLICATE CHECK ========= */

      const existing = await Timetable.findOne({
        day: s.day,
        startTime: s.startTime,
        endTime: s.endTime,
        semester: Number(s.semester),
        division: s.division,
        room: s.room,
        teacherId: teacher._id,
        subjectId: subjectDoc._id,
        batchType: s.batchType || null
      });

      if (existing) {
        skippedCount++;
        continue;
      }

      /* ========= CREATE ENTRY ========= */

      await Timetable.create({
        day: s.day,
        startTime: s.startTime,
        endTime: s.endTime,
        subject: subjectDoc.name,
        subjectType: s.subjectType,
        subjectId: subjectDoc._id,
        semester: Number(s.semester),
        division: s.division,
        teacherId: teacher._id,
        teacherName: teacher.name,
        room: s.room,
        batchType: s.batchType || null
      });

      createdCount++;
    }

    res.json({
      success: true,
      createdCount,
      skippedCount
    });

  } catch (err) {
    console.error("Timetable bulk error:", err);
    res.status(500).json({
      message: "Timetable upload failed",
      error: err.message
    });
  }
};


export const getAttendanceRecords = async (req, res) => {
  try {

    const {
      semester,
      division,
      subject,
      fromDate,
      toDate
    } = req.query;

    let filter = {};

    if (semester) filter.semester = Number(semester);
    if (division) filter.division = division;
    if (subject) filter.subject = subject;

    if (fromDate && toDate) {
      filter.date = {
        $gte: fromDate,
        $lte: toDate,
      };
    }

    const records = await Attendance
      .find(filter)
      .populate("presentStudents", "name rollNo batchHistory batchType")
      .sort({ date: 1 });


    /* 👇 GET ALL STUDENTS FOR EACH RECORD */

    const finalData = await Promise.all(

      records.map(async (rec) => {

        const students = await User.find({
          role: "student",
          semester: rec.semester,
          division: rec.division,
        }).select("name rollNo batchHistory batchType division");

        return {
          ...rec.toObject(),
          students   // ✅ full student list
        };
      })

    );

    res.json(finalData);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Failed to load records",
    });
  }
};






export const getAttendanceSubjects = async (req, res) => {
  try {

      console.log("SUBJECT API HIT:", req.query); // 👈 add
    const { semester, division } = req.query;

    let filter = {};

    if (semester) filter.semester = Number(semester);
    if (division) filter.division = division;

    const subjects = await Attendance
      .distinct("subject", filter);

    res.json(subjects);

  } catch (err) {
    res.status(500).json({
      message: "Subject load failed"
    });
  }
};


export const getAttendanceSummary = async (req, res) => {
  try {

    const {
      semester,
      division,
      fromDate,
      toDate,
    } = req.query;

    if (!semester || !division) {
      return res.status(400).json({
        message: "Semester and Division required",
      });
    }

    /* 1️⃣ All students */

    const students = await User.find({
      role: "student",
      semester,
      division,
    }).sort({ rollNo: 1 });

    /* 2️⃣ Attendance Records */

    const filter = {
      semester,
      division,
    };

    if (fromDate && toDate) {
      filter.date = {
        $gte: fromDate,
        $lte: toDate,
      };
    }

    const records = await Attendance.find(filter);

    /* 3️⃣ Subjects */

    const subjects = [
      ...new Set(records.map(r => r.subject)),
    ];

    /* 4️⃣ Prepare Summary */

    const summary = students.map((student) => {

      let subjectData = {};

      subjects.forEach((sub) => {

        const subjectRecords =
          records.filter(
            r => r.subject === sub
          );

        let total = subjectRecords.length;
        let present = 0;

        subjectRecords.forEach((rec) => {

          if (
            rec.presentStudents
              .map(id => id.toString())
              .includes(student._id.toString())
          ) {
            present++;
          }
        });

        const percent =
          total === 0
            ? 0
            : Math.round((present / total) * 100);

        subjectData[sub] = percent;
      });

      return {
        rollNo: student.rollNo,
        name: student.name,
        subjects: subjectData,
      };
    });

    res.json({
      semester,
      division,
      subjects,
      totalLectures: records.length,
      summary,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Summary failed",
    });
  }
};

export const getAttendanceStats = async (req, res) => {
  try {
    const records = await Attendance.find();

    // Total Lectures
    const totalLectures = records.length;

    // Unique Subjects
    const subjects = await Attendance.distinct("subject");

    let totalPresent = 0;
    let totalStudents = 0;

    let lowAttendanceCount = 0; // < 75%

    records.forEach((r) => {
      const present = r.presentStudents.length;
      const total = r.totalStudents;

      totalPresent += present;
      totalStudents += total;

      // Low Attendance Logic
      if (total > 0) {
        const percent = (present / total) * 100;

        if (percent < 50) {
          lowAttendanceCount++;
        }
      }
    });

    // Overall %
    const overall =
      totalStudents === 0
        ? 0
        : Math.round((totalPresent / totalStudents) * 100);

    // Pending (future)
    const pending = 0;

    res.json({
      overallAttendance: overall,
      activeSubjects: subjects.length,
      pendingRequests: pending,

      // NEW KPI
      lowAttendanceSessions: lowAttendanceCount,

      totalLectures,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Stats error" });
  }
};
