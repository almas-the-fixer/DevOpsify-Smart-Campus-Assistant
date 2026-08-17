import { useEffect, useState } from "react";
import api from "../../../api/axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  FiDownload, FiFilter, FiCalendar, FiSearch, 
  FiUsers, FiBookOpen, FiActivity, FiArrowRight,
  FiChevronLeft, FiChevronRight, FiDatabase, FiFileText 
} from "react-icons/fi";

export default function AttendanceRecords() {
  const [records, setRecords] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [semester, setSemester] = useState("");
  const [division, setDivision] = useState("");
  const [subject, setSubject] = useState("");
  const [batch, setBatch] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);

  /* PAGINATION STATE */
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const today = new Date().toISOString().split("T")[0];

  /* ================= HELPERS (NO CHANGE) ================= */
  const getFinalBatch = (stu) => {
    if (!stu.batchHistory || !stu.batchHistory.length) return "NORMAL";
    return stu.batchHistory.at(-1).type;
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
  };

  /* ================= FETCH LOGIC (NO CHANGE) ================= */
  const fetchRecords = async () => {
    setLoading(true);
    setCurrentPage(1); 
    try {
      const res = await api.get("/admin/attendance-records", {
        params: { semester, division, subject, fromDate, toDate },
      });
      setRecords(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    if (!semester) return setSubjects([]);
    const res = await api.get("/admin/attendance-records/subjects", { 
      params: { semester, ...(division && { division }) } 
    });
    setSubjects(res.data || []);
  };

  useEffect(() => { fetchRecords(); }, []);
  useEffect(() => { fetchSubjects(); }, [semester, division]);

  /* ================= PAGINATION CALCULATIONS (NO CHANGE) ================= */
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(records.length / recordsPerPage);

  /* ================= PDF EXPORT (NO CHANGE) ================= */
  const exportPDF = () => {
    if (!records.length) return alert("No data to export");
    const doc = new jsPDF("landscape");
    const pageW = doc.internal.pageSize.getWidth();
    const displayFrom = fromDate ? formatDateDisplay(fromDate) : "1-1-2026";
    const displayTo = toDate ? formatDateDisplay(toDate) : formatDateDisplay(new Date());
    const subjectsList = [...new Set(records.map(r => r.subject))];
    const studentMap = {};

    records.forEach(r => {
      r.students.forEach(stu => {
        const finalBatch = getFinalBatch(stu);
        if (!studentMap[stu._id]) {
          studentMap[stu._id] = {
            _id: stu._id,
            roll: `${r.division}${stu.rollNo}`,
            name: stu.name,
            batch: finalBatch,
            division: r.division
          };
        }
      });
    });

    let students = Object.values(studentMap);
    if (batch !== "ALL") students = students.filter(s => s.batch === batch);

    const rows = students.sort((a, b) => a.roll.localeCompare(b.roll)).map(stu => {
      const row = [stu.roll, stu.name];
      subjectsList.forEach(sub => {
        const subjectRecords = records.filter(
          r => r.subject === sub && r.division === stu.division
        );
        let total = subjectRecords.length, present = 0;
        subjectRecords.forEach(r => {
          if (r.presentStudents.some(p => p._id === stu._id)) present++;
        });
        row.push(total ? Math.round((present / total) * 100) : "0");
      });
      return row;
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(32, 56, 113);
    doc.text("LJ University", pageW / 2, 12, { align: "center" });
    doc.setFontSize(14);
    doc.text("L. J. Integrated MCA", pageW / 2, 20, { align: "center" });
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text("Student's Attendance Summary Report", pageW / 2, 28, { align: "center" });
    doc.text(`Sem - ${semester || 'ALL '} Div - ${division || 'ALL '} (Date : ${displayFrom} TO ${displayTo})`, pageW / 2, 34, { align: "center" });

    autoTable(doc, {
      startY: 40,
      head: [
        [
          { content: 'Roll No', rowSpan: 2 },
          { content: 'Student Name', rowSpan: 2 },
          { content: 'Subject-wise Attendance (%)', colSpan: subjectsList.length },
        ],
        [...subjectsList]
      ],
      body: rows,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 3, halign: 'center', valign: 'middle', lineColor: [200, 200, 200], lineWidth: 0.1 },
      headStyles: { fillColor: [32, 56, 113], textColor: 255, fontSize: 8, fontStyle: 'bold', halign: 'center' },
      columnStyles: { 1: { halign: 'center', fontStyle: 'bold' } },
      margin: { left: 10, right: 10 },
    });

    const finalY = doc.lastAutoTable.finalY + 25;
    doc.text("__________________", 35, finalY);
    doc.text("ACADEMIC HEAD", 35, finalY + 7);
    doc.text("__________________", pageW / 2, finalY, { align: "center" });
    doc.text("HOD", pageW / 2, finalY + 7, { align: "center" });
    doc.text("__________________", pageW - 35, finalY, { align: "right" });
    doc.text("DIRECTOR", pageW - 35, finalY + 7, { align: "right" });

    doc.save(`Attendance_Report.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 animate-fade-in relative overflow-hidden">
      
      {/* Background Decorative Blur */}
      <div className="absolute top-[-5%] left-[-5%] w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl -z-0"></div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* --- THEMED HEADER SECTION --- */}
        <div className="relative overflow-hidden bg-[#203871] rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl shadow-blue-900/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl border border-white/20">
                <FiDatabase className="text-blue-300" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                  Attendance <span className="text-blue-300">Vault</span>
                </h1>
                <p className="text-blue-100/60 font-medium text-sm mt-1">Audit and export institutional interaction logs</p>
              </div>
            </div>

            <button
              onClick={exportPDF}
              className="group flex items-center gap-3 bg-white text-[#203871] px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl active:scale-95"
            >
              <FiDownload size={18} className="group-hover:translate-y-0.5 transition-transform" /> Export Report
            </button>
          </div>
        </div>

        {/* --- UPDATED FILTER CARD --- */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                <FiFilter size={14} />
            </div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Query Parameters</h3>
            <div className="h-px flex-1 bg-slate-50"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
            <FilterSelect label="Semester" value={semester} onChange={e => setSemester(e.target.value)}>
              <option value="">All Semesters</option>
              <option value="6">Semester 6</option>
              <option value="8">Semester 8</option>
            </FilterSelect>

            <FilterSelect label="Division" value={division} onChange={e => setDivision(e.target.value)}>
              <option value="">All Divisions</option>
              <option>A</option><option>B</option><option>C</option>
            </FilterSelect>

            <FilterSelect label="Subject" value={subject} onChange={e => setSubject(e.target.value)}>
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </FilterSelect>

            <FilterSelect label="Batch Type" value={batch} onChange={e => setBatch(e.target.value)}>
              <option value="ALL">All Batches</option>
              <option value="NORMAL">Normal</option>
              <option value="OJT">OJT</option>
            </FilterSelect>

            <div className="flex flex-col gap-2">
               <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Date From</label>
               <input type="date" className="custom-input" max={today} value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>

            <div className="flex flex-col gap-2">
               <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Date To</label>
               <input type="date" className="custom-input" max={today} value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
          </div>

          <div className="mt-8 flex justify-end border-t border-slate-50 pt-6">
            <button
              onClick={fetchRecords}
              className="flex items-center gap-3 bg-slate-900 text-white px-10 py-3.5 rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-lg active:scale-95"
            >
              <FiSearch /> Execute Search
            </button>
          </div>
        </div>

        {/* --- DATA TABLE CARD --- */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div className="flex items-center gap-3">
                  <FiFileText className="text-slate-400" />
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                    Showing {indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, records.length)} of {records.length} Records
                  </span>
              </div>
          </div>

          <div className="overflow-x-auto px-4 pb-4">
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-[#203871] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest animate-pulse">Querying Database...</p>
              </div>
            ) : records.length > 0 ? (
              <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <th className="px-6 py-4">Lecture Details</th>
                    <th className="px-4 py-4">Classification</th>
                    <th className="px-4 py-4 text-center">Timestamp</th>
                    <th className="px-4 py-4 text-center">Attendance</th>
                    <th className="px-6 py-4 text-right">Engagement</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map(r => {
                    const pct = Math.round((r.presentStudents.length / r.totalStudents) * 100);
                    return (
                      <tr key={r._id} className="bg-white border border-slate-100 hover:bg-slate-50/50 transition-all group shadow-sm">
                        <td className="px-6 py-5 rounded-l-3xl border-y border-l border-slate-50">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#203871] font-black group-hover:bg-[#203871] group-hover:text-white transition-all duration-300">
                               {r.subject.charAt(0)}
                             </div>
                             <div>
                               <p className="font-black text-slate-800 text-sm tracking-tight">{r.subject}</p>
                               <p className="text-[11px] text-slate-400 font-medium">Prof. {r.teacherName}</p>
                             </div>
                          </div>
                        </td>
                        <td className="px-4 py-5 border-y border-slate-50">
                          <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200">
                            Sem {r.semester} • Div {r.division}
                          </span>
                        </td>
                        <td className="px-4 py-5 text-center border-y border-slate-50">
                          <span className="text-sm font-bold text-slate-600 tracking-tight">{r.date}</span>
                        </td>
                        <td className="px-4 py-5 text-center border-y border-slate-50">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[11px] font-black">
                            {r.presentStudents.length} / {r.totalStudents}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right rounded-r-3xl border-y border-r border-slate-50">
                           <div className="flex items-center justify-end gap-3">
                              <span className={`text-sm font-black ${pct < 50 ? 'text-rose-500' : 'text-slate-800'}`}>
                                {pct}%
                              </span>
                              <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                                 <div className={`h-full rounded-full transition-all duration-1000 ${pct < 50 ? 'bg-rose-500' : 'bg-[#203871]'}`} style={{ width: `${pct}%` }}></div>
                              </div>
                           </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-24 text-center">
                <FiUsers size={48} className="mx-auto text-slate-200 mb-4" />
                <h3 className="text-slate-500 font-black uppercase text-xs tracking-widest">Null Response</h3>
                <p className="text-slate-400 text-sm mt-2">Adjust filters to find data logs.</p>
              </div>
            )}
          </div>

          {/* PAGINATION */}
          {records.length > 0 && (
            <div className="px-8 py-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="flex items-center gap-2 px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-all"
              >
                <FiChevronLeft /> Prev
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                      currentPage === num ? "bg-[#203871] text-white shadow-lg shadow-blue-900/20" : "text-slate-400 hover:bg-white"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="flex items-center gap-2 px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-all"
              >
                Next <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-input, .custom-select {
          width: 100%;
          background: #FFFFFF;
          border: 1.5px solid #F1F5F9;
          border-radius: 14px;
          padding: 12px 16px;
          font-size: 13px;
          font-weight: 700;
          color: #334155;
          outline: none;
          transition: all 0.3s;
        }
        .custom-input:focus, .custom-select:focus {
          border-color: #203871;
          box-shadow: 0 0 0 4px rgba(32, 56, 113, 0.08);
          transform: translateY(-1px);
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
}

function FilterSelect({ label, children, value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">{label}</label>
      <select className="custom-select cursor-pointer" value={value} onChange={onChange}>
        {children}
      </select>
    </div>
  );
}