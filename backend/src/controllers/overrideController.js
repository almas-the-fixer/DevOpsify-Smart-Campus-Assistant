import Override from "../models/adminModels/Override.js";
import Timetable from "../models/adminModels/Timetable.js";
import verifyToken from "../middleware/auth.Middleware.js";
export const updateLecture = async (req, res) => {
  try {
    const { id } = req.params;
    const today = new Date().toLocaleDateString("en-CA");

    const baseLecture = await Timetable.findById(id);

    await Override.findOneAndUpdate(
      { lectureId: id, date: today },
      {
        type: "UPDATE",
        updatedByRole: "ADMIN",
        updatedBy: req.user.id,

        updatedData: {
          subject: req.body.subject || baseLecture.subject,
          subjectId: req.body.subjectId || baseLecture.subjectId,
          teacherId: req.body.teacherId || baseLecture.teacherId,
          teacherName: req.body.teacherName || baseLecture.teacherName,
          startTime: req.body.startTime || baseLecture.startTime,
          endTime: req.body.endTime || baseLecture.endTime,
          room: req.body.room || baseLecture.room
        }
      },
      { upsert: true, new: true }
    );

    res.json({ msg: "Lecture updated (admin override)" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 


export const cancelLecture = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const today = new Date().toLocaleDateString("en-CA");

    const baseLecture = await Timetable.findById(id);

    await Override.findOneAndUpdate(
      { lectureId: id, date: today },
      {
        type: "CANCEL",
        updatedByRole: "ADMIN",
        updatedBy: req.user.id,
        reason,

        updatedData: {
          subject: baseLecture.subject,
          subjectId: baseLecture.subjectId,
          teacherId: baseLecture.teacherId,
          teacherName: baseLecture.teacherName,
          startTime: baseLecture.startTime,
          endTime: baseLecture.endTime,
          room: baseLecture.room
        }
      },
      { upsert: true, new: true }
    );

    res.json({ msg: "Lecture cancelled (admin)" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateLectureTeacher = async (req, res) => {
  try {

    const { id } = req.params;
    const todayDate = new Date().toLocaleDateString("en-CA");

    const lecture = await Timetable.findById(id);

    console.log("PARAM ID:", id);
    console.log("FOUND LECTURE:", lecture?._id);

    if (!lecture) {
      return res.status(404).json({ msg: "Lecture not found" });
    }

    // 🔒 SECURITY
    if (String(lecture.teacherId) !== String(req.user.id)) {
      return res.status(403).json({ msg: "Not allowed" });
    }

    const now = new Date();

    const today = now.toLocaleDateString("en-US", { weekday: "long" });

    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    const todayIndex = days.indexOf(today);
    const lectureIndex = days.indexOf(lecture.day);

    // ❌ Past lecture edit block
    if (lectureIndex < todayIndex) {
      return res.status(400).json({
        msg: "Past lectures cannot be edited"
      });
    }

    // ❌ Today lecture rule
    if (lectureIndex === todayIndex) {

      const [sh, sm] = lecture.startTime.split(":");
      const start = new Date();
      start.setHours(sh, sm, 0, 0);

      const limit = new Date(start.getTime() + 15 * 60000);

      if (now > limit) {
        return res.status(400).json({
          msg: "Lecture edit window closed (15 min passed)"
        });
      }

      const [eh, em] = lecture.endTime.split(":");
      const end = new Date();
      end.setHours(eh, em, 0, 0);

      if (now > end) {
        return res.status(400).json({
          msg: "Lecture already finished"
        });
      }
    }

    // ✅ Override create/update
    await Override.findOneAndUpdate(
      { lectureId: id, date: todayDate },
      {
        type: "UPDATE",
        updatedByRole: "TEACHER",
        updatedBy: req.user.id,

        updatedData: {
          subject: lecture.subject,
          subjectId: lecture.subjectId,
          teacherId: lecture.teacherId,
          teacherName: lecture.teacherName,
          startTime: req.body.startTime,
          endTime: req.body.endTime,
          room: req.body.room,
          semester: lecture.semester,
          division: lecture.division,
          batchType: lecture.batchType
        }
      },
      { upsert: true, new: true }
    );

    res.json({ msg: "Teacher updated lecture" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const cancelLectureTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const today = new Date().toLocaleDateString("en-CA");

    const lecture = await Timetable.findById(id);

    // 🔥 SECURITY
    if (String(lecture.teacherId) !== String(req.user.id)) {
      return res.status(403).json({ msg: "Not allowed" });
    }

    await Override.findOneAndUpdate(
      { lectureId: id, date: today },
      {
        type: "CANCEL",
        updatedByRole: "TEACHER",
        updatedBy: req.user.id,
        reason,

        updatedData: {
          subject: lecture.subject,
          subjectId: lecture.subjectId,
          teacherId: lecture.teacherId,
          teacherName: lecture.teacherName,
          startTime: lecture.startTime,
          endTime: lecture.endTime,
          room: lecture.room
        }
      },
      { upsert: true, new: true }
    );

    res.json({ msg: "Teacher cancelled lecture" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};