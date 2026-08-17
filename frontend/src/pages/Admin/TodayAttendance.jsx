import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiCheckCircle,
  FiClock,
  FiActivity,
  FiUser,
  FiMapPin,
  FiLayout,
  FiTrendingUp,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";

export default function TodayAttendance() {

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/admin/today-attendance");
        setList(res.data);
      } catch (err) {
        console.error("Today attendance error", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = list.filter(item =>
    item.subject.toLowerCase().includes(search.toLowerCase()) ||
    item.teacherName.toLowerCase().includes(search.toLowerCase()) ||
    item.room?.toLowerCase().includes(search.toLowerCase())
  );

  /* pagination calculations */

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const changePage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading)
    return (
      <div className="ta-loader min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-100 border-t-[#203871] rounded-full animate-spin"></div>
          <FiActivity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#203871] animate-pulse" />
        </div>
        <p className="mt-6 text-[#203871] font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">
          Syncing Live Feed...
        </p>
      </div>
    );

  return (
    <div className="ta-page min-h-screen bg-[#F8FAFC] p-4 md:p-10 ta-fade">

      <div className="max-w-7xl mx-auto space-y-10">

        {/* HEADER */}

        <header className="ta-header flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">

          <div className="space-y-3">

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>

              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                Live Operations Center
              </span>
            </div>

            <h1 className="text-5xl font-black text-[#203871] tracking-tighter">
              Today's <span className="text-blue-500">Timeline</span>
            </h1>

            <p className="text-slate-400 font-medium italic text-sm">
              Real-time monitoring of academic sessions and faculty engagement.
            </p>

          </div>


          {/* SEARCH */}

          <div className="ta-search relative group w-full lg:max-w-md">

            <input
              type="text"
              placeholder="Search Subject, Faculty or Room..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-6 pr-14 py-5 bg-white border-2 border-slate-50 rounded-[2rem] shadow-xl shadow-blue-900/5 focus:border-[#203871] outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
            />

            <div className="absolute right-3 -mt-10 -translate-y-1/2 p-2 bg-slate-50 rounded-xl group-focus-within:bg-[#203871] group-focus-within:text-white transition-all text-slate-400">
              <FiSearch size={20} />
            </div>

          </div>

        </header>


        {/* STATS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <SummaryCard
            title="Total Sessions"
            value={list.length}
            icon={<FiLayout />}
            color="blue"
            trend="Daily Load"
          />

          <SummaryCard
            title="Archived / Taken"
            value={list.filter(i => i.status === "Taken").length}
            icon={<FiCheckCircle />}
            color="emerald"
            trend="Completed"
          />

          <SummaryCard
            title="In Queue / Pending"
            value={list.filter(i => i.status === "Pending").length}
            icon={<FiClock />}
            color="amber"
            trend="Upcoming"
          />

        </div>


        {/* TABLE */}

        <div className="ta-table bg-white rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-slate-50 overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-left border-collapse">

              <thead>

                <tr className="bg-slate-50/50 border-b border-slate-100">

                  <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Session Details
                  </th>

                  <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Deployment
                  </th>

                  <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Schedule
                  </th>

                  <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                    Protocol Status
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-50">

                {paginated.length === 0 ? (

                  <tr>
                    <td colSpan="4" className="px-8 py-32 text-center">

                      <div className="flex flex-col items-center space-y-4 grayscale opacity-20">
                        <FiCalendar size={60} />
                        <p className="font-black uppercase tracking-[0.3em] text-sm text-[#203871]">
                          No Intel Found
                        </p>
                      </div>

                    </td>
                  </tr>

                ) : (

                  paginated.map((item, i) => (

                    <tr key={i} className="hover:bg-slate-50/80 transition-all">

                      <td className="px-10 py-7 font-black text-[#203871]">
                        {item.subject}
                      </td>

                      <td className="px-8 py-7 font-semibold text-slate-600">
                        {item.teacherName}
                      </td>

                      <td className="px-8 py-7 font-bold text-[#203871]">
                        {item.time}
                      </td>

                      <td className="px-10 py-7 text-center">

                        <span className={`
                          px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-wider
                          ${item.status === "Taken"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"}
                        `}>

                          {item.status === "Taken"
                            ? "Synchronized"
                            : "Awaiting"}

                        </span>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>


        {/* PAGINATION */}

        {totalPages > 1 && (

          <div className="flex items-center justify-center gap-2 pt-6">

            <button
              onClick={() => changePage(currentPage - 1)}
              className="px-4 py-2 rounded-xl border bg-white hover:bg-slate-50"
            >
              <FiChevronLeft />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {

              const page = i + 1;

              return (
                <button
                  key={page}
                  onClick={() => changePage(page)}
                  className={`px-4 py-2 rounded-xl font-bold
                    ${currentPage === page
                      ? "bg-[#203871] text-white"
                      : "bg-white border hover:bg-slate-50"}
                  `}
                >
                  {page}
                </button>
              );

            })}

            <button
              onClick={() => changePage(currentPage + 1)}
              className="px-4 py-2 rounded-xl border bg-white hover:bg-slate-50"
            >
              <FiChevronRight />
            </button>

          </div>

        )}

      </div>

    </div>
  );
}



function SummaryCard({ title, value, icon, color, trend }) {

  const themes = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
  };

  return (

    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-xl shadow-blue-900/5 flex items-center gap-8 hover:scale-[1.02] transition-all relative">

      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl shadow-lg border-2 ${themes[color]}`}>
        {icon}
      </div>

      <div>

        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
          {title}
        </p>

        <h3 className="text-4xl font-black text-[#203871]">
          {value}
        </h3>

      </div>

    </div>

  );

}