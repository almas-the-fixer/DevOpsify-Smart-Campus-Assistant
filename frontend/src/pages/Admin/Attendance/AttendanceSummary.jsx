import { useEffect, useState } from "react";
import api from "../../../api/axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import "../../../styles/attendance.css";

export default function AttendanceSummary() {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [semester, setSemester] = useState("");
  const [division, setDivision] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* ================= FETCH ================= */

  const fetchSummary = async () => {

    if (!semester || !division) {
      alert("Select semester & division");
      return;
    }

    setLoading(true);

    try {

      const res = await api.get(
        "/admin/attendance-summary",
        {
          params: {
            semester,
            division,
            fromDate,
            toDate,
          },
        }
      );

      setData(res.data);

    } catch (err) {
      console.error(err);
      alert("Failed to load data");

    } finally {
      setLoading(false);
    }
  };

  /* ================= CSV ================= */

  const exportCSV = () => {

    if (!data) return;

    const rows = data.summary.map((s) => {

      let row = {
        RollNo: s.rollNo,
        Name: s.name,
      };

      data.subjects.forEach((sub) => {
        row[sub] = s.subjects[sub] + "%";
      });

      return row;
    });

    const csv = Papa.unparse(rows);

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    saveAs(blob, "attendance-summary.csv");
  };

  /* ================= PDF ================= */

  const exportPDF = () => {

    if (!data) return;

    const doc = new jsPDF("landscape");

    /* ===== HEADER ===== */

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);

    doc.text(
      "STUDENT ATTENDANCE SUMMARY REPORT",
      doc.internal.pageSize.getWidth() / 2,
      18,
      { align: "center" }
    );

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    doc.text(
      `Semester: ${semester}   Division: ${division}`,
      14,
      28
    );

    doc.text(
      `Period: ${fromDate || "Start"} to ${toDate || "End"}`,
      14,
      35
    );

    /* ===== TABLE ===== */

    const head = [
      "Roll",
      "Name",
      ...data.subjects,
    ];

    const body = data.summary.map((s) => {

      let row = [
        s.rollNo,
        s.name,
      ];

      data.subjects.forEach((sub) => {
        row.push(s.subjects[sub] + "%");
      });

      return row;
    });

    autoTable(doc, {
      startY: 45,

      head: [head],

      body,

      theme: "grid",

      styles: {
        fontSize: 9,
        halign: "center",
      },

      headStyles: {
        fillColor: [0, 34, 68],
        textColor: 255,
      },

      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },

      margin: { left: 12, right: 12 },
    });

    /* ===== FOOTER ===== */

    const pages = doc.internal.getNumberOfPages();

    for (let i = 1; i <= pages; i++) {

      doc.setPage(i);

      doc.setFontSize(10);

      doc.text(
        `Page ${i}/${pages}`,
        doc.internal.pageSize.getWidth() - 25,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    doc.save("attendance-summary.pdf");
  };

  /* ================= UI ================= */

  return (
    <div>

      {/* HEADER */}

      <div className="records-header">

        <div>
          <h2>Attendance Summary</h2>

          <p className="page-subtitle">
            Student-wise subject attendance
          </p>
        </div>

        {data && (
          <div className="export-btns">

            <button
              className="outline-btn"
              onClick={exportCSV}
            >
              Export CSV
            </button>

            <button
              className="primary-btn"
              onClick={exportPDF}
            >
              Download PDF
            </button>

          </div>
        )}

      </div>

      {/* FILTERS */}

      <div className="filter-bar">

        <select
          value={semester}
          onChange={(e) =>
            setSemester(e.target.value)
          }
        >
          <option value="">Semester</option>
          <option value="6">6</option>
          <option value="8">8</option>
        </select>

        <select
          value={division}
          onChange={(e) =>
            setDivision(e.target.value)
          }
        >
          <option value="">Division</option>
          <option>A</option>
          <option>B</option>
          <option>C</option>
        </select>

        <input
          type="date"
          value={fromDate}
          onChange={(e) =>
            setFromDate(e.target.value)
          }
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) =>
            setToDate(e.target.value)
          }
        />

        <button
          className="outline-btn"
          onClick={fetchSummary}
          disabled={loading}
        >
          {loading ? "Loading..." : "Generate"}
        </button>

      </div>

      {/* TABLE */}

      {data && (

        <div className="table-wrapper">

          <table className="attendance-table">

            <thead>
              <tr>
                <th>Roll</th>
                <th>Name</th>

                {data.subjects.map((s) => (
                  <th key={s}>{s}</th>
                ))}

              </tr>
            </thead>

            <tbody>

              {data.summary.map((s, i) => (

                <tr key={i}>

                  <td>{s.rollNo}</td>
                  <td>{s.name}</td>

                  {data.subjects.map((sub) => (
                    <td key={sub}>
                      {s.subjects[sub]}%
                    </td>
                  ))}

                </tr>
              ))}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}
