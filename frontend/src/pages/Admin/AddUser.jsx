import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { FiArrowLeft, FiLayers } from "react-icons/fi";

export default function AddUser() {

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Student");
  const [loading, setLoading] = useState(false);

  const ALL_SUBJECTS = [
    "ADA", "AML", "WAS", "React Native", "MERN", "Flutter",
    "SEQA", "MC", "UDP/IDP", "RM", "AWS"
  ];

  const [teacherSubjects, setTeacherSubjects] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    semester: "",
    division: "",
    rollNo: "",
  });

  const [errors, setErrors] = useState({});
  const [rollLoading, setRollLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: "" }));
  };

  useEffect(() => {

    const fetchRoll = async () => {

      if (!form.semester || !form.division || activeTab !== "Student") return;

      setRollLoading(true);

      try {

        const res = await api.get(`/users/next-roll`, {
          params: {
            semester: form.semester,
            division: form.division
          }
        });

        setForm(p => ({ ...p, rollNo: res.data.rollNo }));

      } catch {

        setErrors(p => ({ ...p, rollNo: "Error generating ID" }));

      } finally {

        setRollLoading(false);

      }

    };

    fetchRoll();

  }, [form.semester, form.division, activeTab]);

  const validate = () => {

    const e = {};

    if (!form.name.trim()) {
      e.name = "Full name is required";
    } else if (form.name.length < 3) {
      e.name = "Name must be at least 3 characters";
    }

    if (!form.email.trim()) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Enter a valid email address";
    }

    if (activeTab === "Student") {

      if (!form.semester) e.semester = "Please select semester";

      if (!form.division) e.division = "Please select division";

    }

    if (activeTab === "Teacher" && teacherSubjects.length === 0) {

      e.subjects = "Select at least one specialization";

    }

    setErrors(e);

    return Object.keys(e).length === 0;

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {

      await api.post("/users/create", {
        ...form,
        role: activeTab.toLowerCase(),
        subjects: activeTab === "Teacher" ? teacherSubjects : undefined,
      });

      navigate("/admin/users");

    } catch {

      alert("Failed to create user");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10">

      <div className="max-w-3xl mx-auto">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-[#203871] font-black text-[11px] uppercase tracking-[0.2em] mb-8"
        >
          <FiArrowLeft /> Back to Directory
        </button>

        <main className="bg-white rounded-[2.5rem] shadow-xl border border-slate-50 overflow-hidden">

          <header className="bg-[#203871] p-10 text-white">

            <h1 className="text-3xl font-black tracking-tight">
              Register <span className="text-blue-400">Identity</span>
            </h1>

            <p className="text-blue-200 text-sm mt-1">
              Provisioning new access credentials for the academic portal.
            </p>

          </header>

          <form onSubmit={handleSubmit} noValidate className="p-10 space-y-8">

            <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit">

              {["Student", "Teacher"].map(role => (

                <button
                  key={role}
                  type="button"
                  onClick={() => setActiveTab(role)}
                  className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest ${
                    activeTab === role
                      ? "bg-white text-[#203871] shadow"
                      : "text-slate-400"
                  }`}
                >
                  {role}
                </button>

              ))}

            </div>

            <div className="grid md:grid-cols-2 gap-6">

              <div>

                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Full Name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g Rahul Sharma"
                  className="w-full mt-1 px-4 py-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-[#203871]"
                />

                {errors.name && (
                  <p className="text-red-500 text-[9px] font-black mt-1">
                    {errors.name}
                  </p>
                )}

              </div>

              <div>

                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Email Address
                </label>

                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="rahul@university.edu"
                  className="w-full mt-1 px-4 py-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-[#203871]"
                />

                {errors.email && (
                  <p className="text-red-500 text-[9px] font-black mt-1">
                    {errors.email}
                  </p>
                )}

              </div>

            </div>

            {activeTab === "Student" && (

              <div className="space-y-6">

                <div className="grid md:grid-cols-2 gap-6">

                  <FormSelect
                    label="Academic Semester"
                    name="semester"
                    value={form.semester}
                    onChange={handleChange}
                    options={[
                      { v: "6", l: "Semester 6" },
                      { v: "8", l: "Semester 8" }
                    ]}
                    error={errors.semester}
                  />

                  <FormSelect
                    label="Division"
                    name="division"
                    value={form.division}
                    onChange={handleChange}
                    options={[
                      { v: "A", l: "Division A" },
                      { v: "B", l: "Division B" },
                      { v: "C", l: "Division C" }
                    ]}
                    error={errors.division}
                  />

                </div>

                <div className="bg-blue-50 p-6 rounded-xl flex justify-between">

                  <div>

                    <label className="text-[9px] font-black text-blue-400 uppercase">
                      Auto Generated Enrollment ID
                    </label>

                    <p className="text-xl font-black text-[#203871] mt-1">
                      {rollLoading
                        ? "Generating..."
                        : form.rollNo || "Select semester & division"}
                    </p>

                  </div>

                  <FiLayers className="text-blue-200 text-3xl" />

                </div>

              </div>

            )}

            {activeTab === "Teacher" && (

              <div>

                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Assigned Specializations
                </label>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">

                  {ALL_SUBJECTS.map(sub => {

                    const isSelected = teacherSubjects.includes(sub);

                    return (

                      <label
                        key={sub}
                        className={`p-3 text-center rounded-xl border-2 cursor-pointer font-black text-[10px] ${
                          isSelected
                            ? "bg-[#203871] border-[#203871] text-white"
                            : "border-slate-200 text-slate-400"
                        }`}
                      >

                        <input
                          type="checkbox"
                          className="hidden"
                          onChange={(e) => {

                            setTeacherSubjects(p =>
                              e.target.checked
                                ? [...p, sub]
                                : p.filter(s => s !== sub)
                            );

                          }}
                        />

                        {sub}

                      </label>

                    );

                  })}

                </div>

                {errors.subjects && (
                  <p className="text-red-500 text-[9px] font-black mt-2">
                    {errors.subjects}
                  </p>
                )}

              </div>

            )}

            <button
              type="submit"
              disabled={loading || (activeTab === "Student" && !form.rollNo)}
              className="w-full bg-[#203871] text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg disabled:opacity-50"
            >
              {loading
                ? "CREATING USER..."
                : `Create ${activeTab}`}
            </button>

          </form>

        </main>

      </div>

    </div>

  );

}

function FormSelect({ label, name, value, onChange, options, error }) {

  return (

    <div>

      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full mt-1 px-4 py-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-[#203871]"
      >

        <option value="">Select Option</option>

        {options.map(opt => (
          <option key={opt.v} value={opt.v}>
            {opt.l}
          </option>
        ))}

      </select>

      {error && (
        <p className="text-red-500 text-[9px] font-black mt-1">
          {error}
        </p>
      )}

    </div>

  );

}