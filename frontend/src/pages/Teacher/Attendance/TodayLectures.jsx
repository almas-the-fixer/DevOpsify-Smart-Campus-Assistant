import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";

import {
  FiClock,
  FiUserCheck,
  FiLock,
  FiBook,
  FiUsers,
  FiChevronRight,
  FiCalendar,
} from "react-icons/fi";

export default function TodayLectures() {

  const [list, setList] = useState([]);
  const navigate = useNavigate();

  /* ============================
     Convert "02:25" → Date
  ============================ */

  const toDate = (time, extraMin = 0) => {

    if (!time) return new Date("invalid");

    const now = new Date();

    let [hour, minute] = time.split(":").map(Number);

    if (hour < 7) {
      hour += 12;
    }

    const result = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hour,
      minute,
      0,
      0
    );

    result.setMinutes(result.getMinutes() + extraMin);

    return result;
  };

  /* ============================
     Attendance Window
  ============================ */
  const canTakeAttendance = (item) => {

    const now = new Date();

    const start = toDate(item.startTime,10);
    const end = toDate(item.endTime, 60);

    if (isNaN(start) || isNaN(end)) return false;

    return now >= start && now <= end;
  };

  /* ============================
     Load Lectures
  ============================ */
  useEffect(() => {

    const load = async () => {
      try {
        const res = await api.get("/teacher/attendance/today");
        const sorted = res.data.sort((a, b) => {

  const toMinutes = (t) => {
    let [h, m] = t.split(":").map(Number);

    if (h < 7) h += 12;

    return h * 60 + m;
  };

  return toMinutes(a.startTime) - toMinutes(b.startTime);

});

setList(sorted);
      } catch (err) {
        console.error(err);
      }
    };

    load();

  }, []);

  /* ============================
     UI
  ============================ */

  return (

    <div className="min-h-screen bg-[#F0F4FF] p-4 md:p-8">

      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">

          <div>
            <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] mb-2">
              <FiCalendar /> Live Schedule
            </div>

            <h2 className="text-3xl font-black text-[#1E3A8A]">
              Today's Lectures
            </h2>
          </div>

          <div className="hidden md:block text-right">
            <p className="text-blue-400 font-bold text-xs uppercase">
              Date
            </p>
            <p className="text-lg font-black text-[#1E3A8A]">
              {new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>

        </div>

        {/* LIST */}
        <div className="grid grid-cols-1 gap-6">

          {list.length === 0 ? (

            <div className="bg-white p-20 rounded-3xl text-center">
              <FiBook className="mx-auto text-blue-200" size={40} />
              <h3 className="text-xl font-bold text-slate-400 mt-4">
                No lectures today
              </h3>
            </div>

          ) : (

            list.map((item) => {

              const taken = item.taken;
              const allowed = !item.isCancelled && canTakeAttendance(item);

              return (

                <div
                  key={item._id}
                  className={`bg-white rounded-3xl p-6 md:p-8 border flex flex-col md:flex-row gap-6
                  ${taken
                      ? "border-emerald-200 bg-emerald-50/30"
                      : "border-blue-100"
                    }`}
                >

                  {/* TIME */}
                  <div className="md:w-40">

                    <div className="flex items-center gap-2 text-blue-400 mb-1">
                      <FiClock size={14} />
                      <span className="text-[10px] font-black uppercase">
                        Timing
                      </span>
                    </div>

                  <p className={`text-xl font-black ${item.isModified ? "text-[#0E3A8A]" : "text-[#1E3A8A]"}`}>
  {item.startTime}
</p>

                    <p className="text-sm text-blue-300">
                      to {item.endTime}
                    </p>

                  </div>

                  {/* INFO */}
                  <div className="flex-1">

                   <h3 className="text-2xl font-black text-[#1E3A8A] mb-2 flex items-center gap-2">
  {item.subject}

  {item.isModified && (
    <span className="bg-[#0E3A8A] text-white text-[9px] px-2 py-1 rounded font-black uppercase">
      UPDATED
    </span>
  )}

  {item.isCancelled && (
    <span className="bg-rose-500 text-white text-[9px] px-2 py-1 rounded font-black uppercase">
      CANCELLED
    </span>
  )}
</h3>

                    <div className="flex gap-4 text-slate-400 text-sm items-center">

                      <span>Sem {item.semester}</span>

                      <span>
                        <FiUsers className="inline mr-1" />
                        {item.division}
                      </span>

                      {/* ✅ BATCH TYPE ADDED */}
                      {item.batchType && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-600 text-[11px] font-bold rounded-lg uppercase">
                          {item.batchType}
                        </span>
                      )}

                    </div>

                  </div>

                  {/* ACTION */}
                  <div className="md:w-56 flex justify-end items-center">

                    {taken ? (

                      <div className="px-6 py-3 bg-emerald-100 text-emerald-600 rounded-xl font-bold text-xs">
                        <FiUserCheck className="inline mr-2" />
                        Done
                      </div>

                    ) : allowed ? (

                      <button
                        onClick={() =>
                          navigate(`/teacher/attendance/take/${item._id}`, {
                            state: { lecture: item },
                          })
                        }
                        className="px-8 py-4 bg-[#1E3A8A] text-white rounded-xl font-bold text-xs hover:bg-blue-700"
                      >
                        Take Now
                        <FiChevronRight className="inline ml-2" />
                      </button>

                    ) : (

                      <div className="px-6 py-3 bg-slate-100 text-slate-400 rounded-xl font-bold text-xs">
                        <FiLock className="inline mr-2" />
                        Locked
                      </div>

                    )}

                  </div>

                </div>
              );
            })

          )}

        </div>

      </div>

    </div>
  );
}