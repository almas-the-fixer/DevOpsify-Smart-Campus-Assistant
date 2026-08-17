import { Routes, Route } from "react-router-dom";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminSubjects from "../pages/admin/AdminSubjects";
import AdminAttendance from "../pages/admin/AdminAttendance";
import AddUser from "../pages/admin/AddUser";
import ManageUsers from "../pages/admin/ManageUsers";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/users" element={<ManageUsers />} />
      <Route path="/subjects" element={<AdminSubjects />} />
      <Route path="/attendance" element={<AdminAttendance />} />
      <Route path="/add-user" element={<AddUser />} />
    </Routes>
  );
}
