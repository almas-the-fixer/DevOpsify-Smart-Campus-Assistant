import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import { lazy } from "react";
import { Suspense } from "react";
import "react-toastify/dist/ReactToastify.css";

/* ---------- LAZY IMPORTS ---------- */

const Home = lazy(()=>import("./pages/Home"));
const Login = lazy(()=>import("./pages/auth/Login"));
const ChangePassword = lazy(()=>import("./pages/auth/ChangePassword"));

const ProtectedRoute = lazy(()=>import("./routes/ProtectedRoute"));
const RoleRoute = lazy(()=>import("./routes/RoleRoute"));

const AdminLayout = lazy(()=>import("./layouts/AdminLayout"));
const TeacherLayout = lazy(()=>import("./layouts/TeacherLayout"));
const StudentLayout = lazy(()=>import("./layouts/StudentLayout"));

const AdminDashboard = lazy(()=>import("./pages/Admin/Dashboard"));
const AdminSubjects = lazy(()=>import("./pages/Admin/AdminSubjects"));
const Notifications = lazy(()=>import("./pages/Admin/Notifications"));
const LectureDetail = lazy(()=>import("./pages/Admin/LectureDetail"));
const AdminAttendance = lazy(()=>import("./pages/Admin/AdminAttendance"));
const AttendanceLogs = lazy(()=>import("./pages/Admin/Attendance/AttendanceLogs"));
const AttendanceRecords = lazy(()=>import("./pages/Admin/Attendance/AttendanceRecords"));
const AttendanceSummary = lazy(()=>import("./pages/Admin/Attendance/AttendanceSummary"));
const CreateAnnouncement = lazy(()=>import("./pages/Admin/CreateAnnouncement"));
const Classes = lazy(()=>import("./pages/Admin/Classes"));
const AddUser = lazy(()=>import("./pages/Admin/AddUser"));
const ManageUsers = lazy(()=>import("./pages/Admin/ManageUsers"));
const BulkUpload = lazy(()=>import("./pages/Admin/BulkUpload"));
const UploadTimetable = lazy(()=>import("./pages/Admin/UploadTimetable"));
const TodayAttendance = lazy(()=>import("./pages/Admin/TodayAttendance"));
const AnnouncementDashboard = lazy(()=>import("./pages/Admin/AnnouncementDashboard"));

const AdminOjtDashboard = lazy(()=>import("./pages/Admin/AdminOjtDashboard"));
const AdminOjtHistory = lazy(()=>import("./pages/Admin/AdminOjtHistory"));
const AdminOjtDetail = lazy(()=>import("./pages/Admin/AdminOjtDetails"));

const TeacherDashboard = lazy(()=>import("./pages/Teacher/Dashboard"));
const TeacherSubjects = lazy(()=>import("./pages/Teacher/Subjects"));
const MyMaterials = lazy(()=>import("./pages/Teacher/MyMaterials"));
const UploadMaterial = lazy(()=>import("./pages/Teacher/UploadMaterial"));

const AttendanceDashboard = lazy(()=>import("./pages/Teacher/Attendance/Dashboard"));
const TodayLectures = lazy(()=>import("./pages/Teacher/Attendance/TodayLectures"));
const TakeAttendance = lazy(()=>import("./pages/Teacher/Attendance/TakeAttendance"));
const AttendanceHistory = lazy(()=>import("./pages/Teacher/Attendance/History"));
const AttendanceAnalysis = lazy(()=>import("./pages/Teacher/Attendance/Analysis"));

const TeacherDiscussion = lazy(()=>import("./pages/Teacher/TeacherDiscussion"));
const TeacherLectureDetail = lazy(()=>import("./pages/Teacher/TeacherLectureDetail"));
const TeacherClasses = lazy(()=>import("./pages/Teacher/Classes"));
const TeacherNotificationPage = lazy(()=>import("./pages/Teacher/TeacherNotificationPage"));
const NotificationBell = lazy(()=>import("./pages/Teacher/NotificationBell"));

const StudentDashboard = lazy(()=>import("./pages/Student/Dashboard"));
const StudentSubjects = lazy(()=>import("./pages/Student/StudentSubjects"));
const StudentAttendance = lazy(()=>import("./pages/Student/StudentAttendance"));
const StudentAttendanceDetail = lazy(()=>import("./pages/Student/StudentAttendanceDetail"));

const StudentTimetable = lazy(()=>import("./pages/Student/StudentTimetable"));
const StudentMaterials = lazy(()=>import("./pages/Student/StudentMaterials"));
const StudentDiscussion = lazy(()=>import("./pages/Student/StudentDiscussion"));
const StudentNotificationPage = lazy(()=>import("./pages/Student/StudentNotificationPage"));
const StudentNotificationBell = lazy(()=>import("./pages/Student/StudentNotificationBell"));

const Profile = lazy(()=>import("./pages/common/Profile"));
const EditProfile = lazy(()=>import("./pages/common/EditProfile"));

export default function App(){

 return (

<AuthProvider>

<BrowserRouter>

<ToastContainer
 position="top-right"
 autoClose={2500}
 hideProgressBar={false}
 newestOnTop
 closeOnClick
 pauseOnHover
 theme="light"
/>

<Suspense fallback={<div style={{padding:"20px"}}>Loading...</div>}>

<Routes>

<Route path="/" element={<Home/>}/>
<Route path="/login" element={<Login/>}/>
<Route path="/change-password" element={<ChangePassword/>}/>

{/* ADMIN */}

<Route path="/admin"
 element={
 <ProtectedRoute>
 <RoleRoute role="admin">
 <AdminLayout/>
 </RoleRoute>
 </ProtectedRoute>
 }
>

<Route index element={<AdminDashboard/>}/>
<Route path="users" element={<ManageUsers/>}/>
<Route path="subjects" element={<AdminSubjects/>}/>
<Route path="attendance" element={<AdminAttendance/>}/>
<Route path="today-attendance" element={<TodayAttendance/>}/>
<Route path="logs" element={<AttendanceLogs/>}/>
<Route path="attendance/records" element={<AttendanceRecords/>}/>
<Route path="attendance/attendance-summary" element={<AttendanceSummary/>}/>
<Route path="notifications" element={<Notifications/>}/>
<Route path="lecture/:id" element={<LectureDetail/>}/>
<Route path="classes" element={<Classes/>}/>
<Route path="add-user" element={<AddUser/>}/>
<Route path="bulk-upload" element={<BulkUpload/>}/>
<Route path="upload-timetable" element={<UploadTimetable/>}/>
<Route path="create-announcement" element={<CreateAnnouncement/>}/>
<Route path="announcementdashboard" element={<AnnouncementDashboard/>}/>
<Route path="ojt/ojtdashboard" element={<AdminOjtDashboard/>}/>
<Route path="ojt/ojthistory" element={<AdminOjtHistory/>}/>
<Route path="ojt/:id" element={<AdminOjtDetail/>}/>
<Route path="profile" element={<Profile/>}/>
<Route path="edit-profile" element={<EditProfile/>}/>

</Route>

{/* TEACHER */}

<Route path="/teacher"
 element={
 <ProtectedRoute>
 <RoleRoute role="teacher">
 <TeacherLayout/>
 </RoleRoute>
 </ProtectedRoute>
 }
>

<Route index element={<TeacherDashboard/>}/>
<Route path="subjects" element={<TeacherSubjects/>}/>
<Route path="upload" element={<UploadMaterial/>}/>
<Route path="materials" element={<MyMaterials/>}/>
<Route path="discussion" element={<TeacherDiscussion/>}/>
<Route path="attendance" element={<AttendanceDashboard/>}/>
<Route path="attendance/today" element={<TodayLectures/>}/>
<Route path="attendance/take/:id" element={<TakeAttendance/>}/>
<Route path="attendance/history" element={<AttendanceHistory/>}/>
<Route path="attendance/analysis" element={<AttendanceAnalysis/>}/>
<Route path="lecture/:id" element={<TeacherLectureDetail/>}/>
<Route path="classes" element={<TeacherClasses/>}/>
<Route path="notifications" element={<TeacherNotificationPage/>}/>
<Route path="notifications/msg" element={<NotificationBell/>}/>
<Route path="profile" element={<Profile/>}/>
<Route path="edit-profile" element={<EditProfile/>}/>

</Route>

{/* STUDENT */}

<Route path="/student"
 element={
 <ProtectedRoute>
 <RoleRoute role="student">
 <StudentLayout/>
 </RoleRoute>
 </ProtectedRoute>
 }
>

<Route index element={<StudentDashboard/>}/>
<Route path="subjects" element={<StudentSubjects/>}/>
<Route path="materials/:id" element={<StudentMaterials/>}/>
<Route path="attendance/:subject" element={<StudentAttendanceDetail/>}/>
<Route path="attendance" element={<StudentAttendance/>}/>
<Route path="timetable" element={<StudentTimetable/>}/>
<Route path="discussion" element={<StudentDiscussion/>}/>
<Route path="notifications" element={<StudentNotificationPage/>}/>
<Route path="notifications/msg" element={<StudentNotificationBell/>}/>
<Route path="profile" element={<Profile/>}/>
<Route path="edit-profile" element={<EditProfile/>}/>

</Route>

<Route path="*" element={<Navigate to="/"/>}/>

</Routes>

</Suspense>

</BrowserRouter>

</AuthProvider>

 );
}