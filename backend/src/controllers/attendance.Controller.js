import Attendance from "../models/adminModels/Attendance.js";
import SystemLog from "../models/adminModels/SystemLog.js";
import Timetable from "../models/adminModels/Timetable.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import User from "../models/adminModels/User.js";
import Override from "../models/adminModels/Override.js";

export const getLectureWithStudents = async (req, res) => {
  try {

    const lecture = await Timetable.findById(req.params.id);

    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found",
      });
    }

    const today = new Date().toISOString().split("T")[0];

    /* ===============================
       CHECK OVERRIDE
    ============================== */

    const override = await Override.findOne({
      lectureId: lecture._id,
      date: today
    });

    let finalLecture = lecture.toObject();

    if (override) {

      if (override.type === "CANCEL") {
        finalLecture.isCancelled = true;
      }

      if (override.type === "UPDATE") {
        finalLecture = {
          ...finalLecture,
          ...override.updatedData,
          isModified: true
        };
      }
    }

    /* ===============================
       STUDENTS
    ============================== */

    const students = await User.find({
      role: "student",
      semester: lecture.semester,
      division: lecture.division,
      batchType: lecture.batchType,
      isActive: true,
    })
      .select("name rollNo email batchType")
      .sort({ rollNo: 1 });

    res.json({
      lecture: finalLecture,
      students,
    });

  } catch (err) {

    console.error("Lecture Fetch Error:", err);

    res.status(500).json({
      message: err.message
    });
  }
};



/* ===============================
   GET TODAY LECTURES
================================ */
export const getTodayLectures = async (req, res) => {
  try {

    const day = new Date().toLocaleString("en-US", {
      weekday: "long",
    });

    const today = new Date().toISOString().split("T")[0];

    /* ===============================
       BASE LECTURES
    ============================== */

    let lectures = await Timetable.find({
      teacherId: req.user.id,
      day,
    });

    /* ===============================
       OVERRIDES
    ============================== */

    const overrides = await Override.find({
      date: today
    }).sort({ createdAt: -1 });

    const overrideMap = new Map();

    overrides.forEach(o => {
      overrideMap.set(o.lectureId.toString(), o);
    });

    /* ===============================
       MERGE LOGIC
    ============================== */

    lectures = lectures.map(lec => {

  const base = lec.toObject();

  const override = overrideMap.get(base._id.toString());

  if (!override) return base;

  if (override.type === "CANCEL") {
    return {
      ...base,
      isCancelled: true
    };
  }

  if (override.type === "UPDATE") {
    return {
      ...base,
      ...override.updatedData,
      isModified: true
    };
  }

  return base;

});

    /* ===============================
       SORT BY TIME
    ============================== */

    lectures.sort((a, b) => {

      const [h1, m1] = a.startTime.split(":").map(Number);
      const [h2, m2] = b.startTime.split(":").map(Number);

      return h1 * 60 + m1 - (h2 * 60 + m2);
    });

    /* ===============================
       ATTENDANCE STATUS
    ============================== */

    const result = await Promise.all(

      lectures.map(async (lec) => {

        const attendance = await Attendance.findOne({
          lectureId: lec._id,
          teacherId: req.user.id,
          date: today,
        });

        return {
          ...lec,
          taken: !!attendance,
          attendanceId: attendance?._id || null,
          date: today,
        };
      })
    );

    res.json(result);

  } catch (err) {

    console.error("Today Lectures Error:", err);

    res.status(500).json({
      message: "Failed to load today's lectures",
    });
  }
};

/* ===============================
   TAKE ATTENDANCE
================================ */
export const takeAttendance = async (req, res) => {
  try {
    const {
      lectureId,
      presentStudents,
      totalStudents,
    } = req.body;

    if (!req.user?.name || !req.user?.email) {
      return res.status(401).json({
        message: "Unauthorized user data missing",
      });
    }

    const timetable = await Timetable.findById(lectureId);

    if (!timetable) {
      return res.status(404).json({
        message: "Lecture not found",
      });
    }

    const today = new Date();
    const date = today.toISOString().split("T")[0];
    const day = today.toLocaleString("en-US", { weekday: "long" });

    /* 🔒 Prevent duplicate */
    const already = await Attendance.findOne({
      lectureId,
      teacherId: req.user.id,
      date,
    });

    if (already) {
      return res.status(400).json({
        message: "Attendance already submitted",
      });
    }

    /* 🔥 ALWAYS TAKE DATA FROM TIMETABLE */
    const attendance = await Attendance.create({
      lectureId,
      subject: timetable.subject,
      semester: timetable.semester,
      division: timetable.division,
      batchType: timetable.batchType, // 🔥 SOURCE OF TRUTH
      date,
      day,
      teacherId: req.user.id,
      teacherName: req.user.name,
      teacherEmail: req.user.email,
      presentStudents,
      totalStudents,
      status: "DONE",
    });

    await SystemLog.create({
      action: "ATTENDANCE_TAKEN",
      performedBy: req.user.id,
      role: "teacher",
      details: {
        subject: timetable.subject,
        division: timetable.division,
        batchType: timetable.batchType,
        date,
      },
      ipAddress: req.ip,
    });

    res.json({ success: true });

  } catch (err) {
    console.error("Take Attendance Error:", err);
    res.status(500).json({ message: err.message });
  }
};



/* ===============================
   GET HISTORY
================================ */

export const getHistory = async (req, res) => {
  try {

    const records = await Attendance.find({
      teacherId: req.user.id,
    })
      .sort({ createdAt: -1 })
      .populate("presentStudents", "name rollNo batchHistory batchType")

    /* Attach All Students */
    const finalData = await Promise.all(

      records.map(async (rec) => {

const students = await User.find({
  role: "student",
  semester: rec.semester,
  division: rec.division,
  batchType: rec.batchType,
});

        return {
          ...rec.toObject(),
          students, // 👈 ALL students
        };
      })

    );

    res.json(finalData);

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const getStats = async (req, res) => {
  try {

    const records = await Attendance.find({
      teacherId: req.user.id,
    });

    /* ======================
       BASIC STATS
    ====================== */

    let totalLectures = records.length;
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalStudents = 0;

    records.forEach(r => {
      const present = r.presentStudents.length;
      const total = r.totalStudents;

      totalPresent += present;
      totalAbsent += (total - present);
      totalStudents += total;
    });

    const avgAttendance = totalLectures
      ? Math.round(totalPresent / totalLectures)
      : 0;

    const percentage = totalStudents
      ? Math.round((totalPresent / totalStudents) * 100)
      : 0;

    /* ======================
      TODAY STATUS (CORRECT LOGIC)
    ====================== */

    const todayDate = new Date().toISOString().split("T")[0];
    const todayDay = new Date().toLocaleString("en-US", { weekday: "long" });

    // 1️⃣ Get today's timetable lectures
    const todayTimetable = await Timetable.find({
      teacherId: req.user.id,
      day: todayDay
    });

    const todayTotal = todayTimetable.length;

    // 2️⃣ Get today's attendance records
    const todayAttendance = await Attendance.find({
      teacherId: req.user.id,
      date: todayDate
    });

    // 3️⃣ Count completed (status DONE)
    const todayCompleted = todayTimetable.filter(t => {
  return todayAttendance.some(a =>
    a.lectureId?.toString() === t._id.toString() &&
    a.status === "DONE"
  );
}).length;


    // 4️⃣ Pending = scheduled - completed
    const todayPending = todayTotal - todayCompleted;


    /* ======================
       CLASS PERFORMANCE
    ====================== */

    let classMap = {};

    records.forEach(r => {

      const key = `Sem-${r.semester}${r.division}-${r.batchType}`;

      if (!classMap[key]) {
        classMap[key] = {
          present: 0,
          total: 0
        };
      }

      classMap[key].present += r.presentStudents.length;
      classMap[key].total += r.totalStudents;
    });


    const classPerformance = Object.keys(classMap).map(key => {

      const item = classMap[key];

      const percent = item.total
        ? Math.round((item.present / item.total) * 100)
        : 0;

      return {
        class: key,
        percent
      };
    });


    /* ======================
       RESPONSE
    ====================== */

    res.json({

      // Summary
      totalLectures,
      totalPresent,
      totalAbsent,
      avgAttendance,
      percentage,

      // Today
      todayTotal,
      todayCompleted,
      todayPending,

      // Class
      classPerformance
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server error"
    });
  }
};



/* ===============================
   EDIT ATTENDANCE
================================ */

export const editAttendance = async (req, res) => {
  try {

    const { id } = req.params;

    const record = await Attendance.findById(id);

    if (!record) {
      return res.status(404).json({ message: "Not found" });
    }

    /* 24 Hour Lock */
    const diff =
      (Date.now() - new Date(record.createdAt)) / (1000 * 60 * 60);

    if (diff > 24) {
      return res.status(403).json({
        message: "Attendance is locked after 24 hours",
      });
    }

    const updated = await Attendance.findByIdAndUpdate(
      id,
      {
        presentStudents: req.body.presentStudents,
        edited: true,
      },
      { new: true }
    );

    /* Log */
    await SystemLog.create({
      action: "ATTENDANCE_EDITED",
      performedBy: req.user.id,
      role: "teacher",
      details: { attendanceId: id },
      ipAddress: req.ip,
    });

    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: "Edit failed" });
  }
};

const getBatchOnDate = (student, date) => {
  for (const h of student.batchHistory || []) {
    if (
      date >= h.from &&
      (!h.to || date <= h.to)
    ) {
      return h.type; // NORMAL / OJT
    }
  }
  return "NORMAL";
};



const generatePDF = async (records, req, res) => {

  if (!records.length) {
    return res.status(400).json({ message: "No data" });
  }

  const PDFDocument = (await import("pdfkit")).default;
  const User = (await import("../models/adminModels/User.js")).default;

  const semester = records[0].semester;
  const divisions = [...new Set(records.map(r => r.division))];
  const subjects = [...new Set(records.map(r => r.subject))];
  const fromDate = records[0].date;
  const toDate = records[records.length - 1].date;

  const students = await User.find({
  role: "student",
  semester,
  division: { $in: divisions },
  batchType: records[0].batchType
}).sort({ division: 1, rollNo: 1 });


  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margin: 22,
  });

  res.setHeader(
    "Content-Disposition",
    "attachment; filename=Attendance_Analysis_Report.pdf"
  );

  doc.pipe(res);


  /* ================= HEADER ================= */

  doc.font("Helvetica-Bold").fontSize(20)
     .text("L. J. Institute of Computer Applications", {
       align: "center"
     });

  doc.fontSize(14)
     .text("Attendance Statement Report", {
       align: "center"
     });

  doc.moveDown(0.4);


  /* ================= INFO BAR ================= */

  doc.rect(20, doc.y, 800, 24)
     .fill("#EEF1F9");

  doc.fillColor("black");

  doc.font("Helvetica-Bold").fontSize(11);

  doc.text(
    `Semester: ${semester}     Division: ${divisions.join(", ")}     Period: ${fromDate} To ${toDate}`,
    20,
    doc.y + 6,
    {
      width: 800,
      align: "center"
    }
  );

  doc.moveDown(1.2);


  /* ================= TABLE CONFIG ================= */

  let startX = 20;
  let y = doc.y;

  const col = {
    sr: 40,
    roll: 80,
    name: 200,
    sub: 75,
    avg: 60,
  };

  const tableWidth =
    col.sr +
    col.roll +
    col.name +
    subjects.length * col.sub +
    col.avg;


  /* ================= HEADER ROW ================= */

  doc.rect(startX, y, tableWidth, 30)
     .fill("#D9DFF5");

  doc.fillColor("black");

  doc.font("Helvetica-Bold").fontSize(11);

  let x = startX;

  const centerText = (txt, x, w, y) => {
    doc.text(txt, x, y + 9, {
      width: w,
      align: "center"
    });
  };

  centerText("Sr", x, col.sr, y); x += col.sr;
  centerText("Roll No", x, col.roll, y); x += col.roll;
  centerText("Student Name", x, col.name, y); x += col.name;

  subjects.forEach(sub => {
    centerText(sub, x, col.sub, y);
    x += col.sub;
  });

  centerText("AVG %", x, col.avg, y);

  y += 30;


  /* ================= BORDERS ================= */

  doc.rect(startX, y - 30, tableWidth, 30).stroke();


  /* ================= DATA ================= */

  doc.font("Helvetica").fontSize(10.5);

  let sr = 1;

  students.forEach((stu, i) => {

    /* Row BG */

    if (i % 2 === 0) {
      doc.rect(startX, y, tableWidth, 26)
         .fill("#F8F9FE");
      doc.fillColor("black");
    }

    x = startX;

    let totalAll = 0;
    let presentAll = 0;


    const cell = (txt, x, w) => {
      doc.text(txt, x, y + 7, {
        width: w,
        align: "center"
      });
    };


    cell(sr++, x, col.sr); x += col.sr;

    cell(`${stu.division}${stu.rollNo}`, x, col.roll); x += col.roll;

    doc.text(stu.name, x + 6, y + 7, {
      width: col.name - 12,
      align: "left"
    });
    x += col.name;


    subjects.forEach(sub => {

      let total = 0;
      let present = 0;

      records.forEach(r => {

        if (r.subject === sub && r.division === stu.division) {

          total++;

          if (
            r.presentStudents.some(
              p => p._id.toString() === stu._id.toString()
            )
          ) {
            present++;
          }
        }
      });

      totalAll += total;
      presentAll += present;

      const percent =
        total ? Math.round((present / total) * 100) : 0;

      cell(percent, x, col.sub);

      x += col.sub;
    });


    const avg =
      totalAll
        ? Math.round((presentAll / totalAll) * 100)
        : 0;


    cell(avg, x, col.avg);


    /* Grid Lines */

    let lx = startX;

    [
      col.sr,
      col.roll,
      col.name,
      ...subjects.map(() => col.sub),
      col.avg
    ].forEach(w => {

      doc.moveTo(lx, y)
         .lineTo(lx, y + 26)
         .strokeColor("#BFC7E0")
         .stroke();

      lx += w;
    });

    doc.moveTo(lx, y)
       .lineTo(lx, y + 26)
       .stroke();


    doc.moveTo(startX, y + 26)
       .lineTo(startX + tableWidth, y + 26)
       .stroke();


    y += 26;


    /* Page Break */

    if (y > 510) {

      doc.addPage();
      y = 50;

    }

  });


  /* ================= FOOTER ================= */

  doc.moveDown(1.8);

  doc.font("Helvetica-Bold").fontSize(10);

  doc.text("Prepared By", 60);
  doc.text("_______________________", 60, doc.y + 3);

  doc.text("Verified By (HOD)", 620);
  doc.text("_______________________", 620, doc.y - 12);


  doc.end();
};







const generateExcel = async (records, req, res) => {

  const ExcelJS = (await import("exceljs")).default;
  const User = (await import("../models/adminModels/User.js")).default;

  const semester = records[0].semester;
  const divisions = [...new Set(records.map(r => r.division))].sort();
  const subjects = [...new Set(records.map(r => r.subject))];

  const students = await User.find({
  role: "student",
  semester,
  division: { $in: divisions },
  batchType: records[0].batchType
}).sort({ division: 1, rollNo: 1 });


  const wb = new ExcelJS.Workbook();
  const sheet = wb.addWorksheet("Attendance");

  sheet.addRow([
    `L. J. Institute of Computer Applications - Attendance Report`
  ]);
  sheet.mergeCells(`A1:${String.fromCharCode(65 + subjects.length + 3)}1`);
  sheet.getRow(1).font = { bold: true };

  sheet.addRow([`Semester : ${semester}`]);
  sheet.addRow([`Division : ${divisions.join(", ")}`]);
  sheet.addRow([]);

  sheet.addRow([
    "Sr",
    "Roll",
    "Student Name",
    ...subjects,
    "AVG",
  ]).font = { bold: true };

  let sr = 1;

  students.forEach(stu => {

    let totalAll = 0;
    let presentAll = 0;

    const row = [
      sr++,
      `${stu.division}${stu.rollNo}`,
      stu.name,
    ];

    subjects.forEach(sub => {

      let total = 0;
      let present = 0;

      records.forEach(r => {
        if (r.subject === sub && r.division === stu.division) {
          total++;
          if (r.presentStudents.some(p => p._id.equals(stu._id))) {
            present++;
          }
        }
      });

      totalAll += total;
      presentAll += present;

      row.push(total ? Math.round((present / total) * 100) : 0);
    });

    row.push(
      totalAll ? Math.round((presentAll / totalAll) * 100) : 0
    );

    sheet.addRow(row);
  });

  res.setHeader(
    "Content-Disposition",
    "attachment; filename=IMCA_Attendance.xlsx"
  );

  await wb.xlsx.write(res);
  res.end();
};




export const exportPDF = async (req, res) => {

  try {

    const records = await Attendance.find({
      teacherId: req.user.id,
    })
      .populate("presentStudents", "name rollNo")
      .sort({ date: 1 });


    if (!records.length) {
      return res.status(404).json({ message: "No Data" });
    }


    /* ================= COLLECT INFO ================= */

    const subjects = [
      ...new Set(records.map(r => r.subject))
    ];

    const totalLectures = records.length;

    const fromDate = records[0].date;
    const toDate = records[records.length - 1].date;

    const semester = records[0].semester;
    const division = records[0].division;


    /* Get All Students */

  const students = await User.find({
  role: "student",
  semester,
  division,
  batchType: records[0].batchType
}).sort({ rollNo: 1 });



    /* ================= PDF SETUP ================= */

    const doc = new PDFDocument({
      margin: 30,
      size: "A4",
      layout: "landscape"
    });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=attendance_sheet.pdf"
    );

    doc.pipe(res);


    /* ================= HEADER ================= */

    doc.fontSize(18).text("L.J. Institute of MCA", {
      align: "center"
    });

    doc.fontSize(14).text("Attendance Sheet", {
      align: "center"
    });

    doc.moveDown(0.5);

    doc.fontSize(11);

    doc.text(`Semester: ${semester}`);
    doc.text(`Division: ${division}`);
    doc.text(`Subjects: ${subjects.join(", ")}`);
    doc.text(`Total Lectures: ${totalLectures}`);
    doc.text(`From: ${fromDate}   To: ${toDate}`);

    doc.moveDown(1);


    /* ================= TABLE HEADER ================= */

    let y = doc.y;

    const col = {
      roll: 30,
      name: 80,
      present: 280,
      total: 350,
      percent: 420,
    };


    doc.font("Helvetica-Bold");

    doc.text("Roll", col.roll, y);
    doc.text("Name", col.name, y);
    doc.text("Present", col.present, y);
    doc.text("Total", col.total, y);
    doc.text("%", col.percent, y);

    doc.moveDown(0.3);

    doc.moveTo(30, doc.y).lineTo(750, doc.y).stroke();

    doc.font("Helvetica");

    y = doc.y + 5;


    /* ================= TABLE DATA ================= */

    students.forEach((stu, index) => {

      let presentCount = 0;

      records.forEach(r => {

        if (
          r.presentStudents.find(
            p => p._id.toString() === stu._id.toString()
          )
        ) {
          presentCount++;
        }

      });

      const percent =
        ((presentCount / totalLectures) * 100).toFixed(1);


      doc.fontSize(10);

      doc.text(stu.rollNo, col.roll, y);   // ✅ Only once
      doc.text(stu.name, col.name, y);

      doc.text(presentCount, col.present, y);
      doc.text(totalLectures, col.total, y);
      doc.text(`${percent}%`, col.percent, y);

      y += 22;


      /* Page Break */

      if (y > 520) {

        doc.addPage();
        y = 50;

      }

    });


    /* ================= FOOTER ================= */

    doc.moveDown(3);

    doc.text("__________________", 80, doc.y);
    doc.text("Teacher Sign", 80, doc.y + 15);

    doc.text("__________________", 600, doc.y - 15);
    doc.text("HOD Sign", 600, doc.y + 15);


    doc.end();

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "PDF Export Failed"
    });
  }
};

export const exportExcel = async (req, res) => {

  try {

    const records = await Attendance.find({
      teacherId: req.user.id,
    })
      .populate("presentStudents", "name rollNo")
      .sort({ date: 1 });


    if (!records.length) {
      return res.status(404).json({ message: "No Data" });
    }


    const semester = records[0].semester;
    const division = records[0].division;

    const subjects = [
      ...new Set(records.map(r => r.subject))
    ];

    const totalLectures = records.length;


  const students = await User.find({
  role: "student",
  semester,
  division,
  batchType: records[0].batchType
}).sort({ rollNo: 1 });


    const wb = new ExcelJS.Workbook();

    const sheet = wb.addWorksheet("Attendance");


    /* ================= HEADER ================= */

    sheet.mergeCells("A1:E1");

    sheet.getCell("A1").value =
      "L.J. Institute of MCA - Attendance Sheet";

    sheet.getCell("A1").font = {
      size: 16,
      bold: true
    };

    sheet.getCell("A1").alignment = {
      horizontal: "center"
    };


    sheet.addRow([]);
    sheet.addRow([`Semester: ${semester}`]);
    sheet.addRow([`Division: ${division}`]);
    sheet.addRow([`Subjects: ${subjects.join(", ")}`]);
    sheet.addRow([`Total Lectures: ${totalLectures}`]);

    sheet.addRow([]);


    sheet.addRow([
      "Roll",
      "Name",
      "Present",
      "Total",
      "Percentage"
    ]).font = { bold: true };


    /* ================= DATA ================= */

    students.forEach(stu => {

      let presentCount = 0;

      records.forEach(r => {

        if (
          r.presentStudents.find(
            p => p._id.toString() === stu._id.toString()
          )
        ) {
          presentCount++;
        }

      });

      const percent =
        ((presentCount / totalLectures) * 100).toFixed(1);


      sheet.addRow([
        stu.rollNo,
        stu.name,
        presentCount,
        totalLectures,
        percent + "%"
      ]);

    });


    sheet.columns = [
      { width: 10 },
      { width: 25 },
      { width: 12 },
      { width: 12 },
      { width: 12 },
    ];


    res.setHeader(
      "Content-Disposition",
      "attachment; filename=attendance_sheet.xlsx"
    );

    await wb.xlsx.write(res);

    res.end();

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Excel Export Failed"
    });
  }
};



export const getAnalysisOptions = async (req, res) => {

  try {

    const records = await Attendance.find({
      teacherId: req.user.id,
    });

    const semesters = [...new Set(records.map(r => r.semester))];
    const divisions = [...new Set(records.map(r => r.division))];
    const subjects = [...new Set(records.map(r => r.subject))];

    res.json({
      semesters,
      divisions,
      subjects,
    });

  } catch (err) {

    res.status(500).json({ message: "Options load failed" });
  }
};


export const exportAnalysisReport = async (req, res) => {

  try {

    const { type } = req.params;

    const {
      semester,
      division,
      subject,
      from,
      to,
    } = req.query;

    let filter = {
      teacherId: req.user.id,
    };

    // ✅ Add only if exists
    if (semester) filter.semester = Number(semester);
    if (division) filter.division = division;
    if (subject) filter.subject = subject;
    if (req.query.batchType) filter.batchType = req.query.batchType; 
    if (from && to) {
      filter.date = {
        $gte: from,
        $lte: to,
      };
    }

    console.log("EXPORT FILTER:", filter); // Debug

    const records = await Attendance.find(filter)
      .populate("presentStudents", "name rollNo batchHistory")
      .sort({ date: 1 });

    if (!records.length) {
      return res.status(404).json({
        message: "No attendance data found"
      });
    }

    if (type === "pdf") {
      return generatePDF(records, req, res);
    }

    if (type === "excel") {
      return generateExcel(records, req, res);
    }

    res.status(400).json({
      message: "Invalid export type"
    });

  } catch (err) {

    console.error("Export Error:", err);

    res.status(500).json({
      message: "Export failed"
    });
  }
};
