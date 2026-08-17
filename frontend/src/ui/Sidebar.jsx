import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiGrid, FiHome, FiBook, FiUsers, FiClipboard,
  FiUser, FiLogOut, FiFolder, FiClock, FiChevronRight,FiCalendar,FiInbox
} from "react-icons/fi";
import "../styles/sidebar.css";
import { 
LayoutDashboard
} from 'lucide-react';
export default function Sidebar({ role, collapsed, setCollapsed }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const basePath = `/${role}`;

  const menus = {
    admin: [
      { label: "Dashboard", path: "", icon: FiHome },
      { label: "Manage Users", path: "users", icon: FiUsers },
      { label: "Classes", path: "classes", icon: FiBook },
      { label: "Attendance", path: "attendance", icon: FiClipboard },
      { label: "Ojt Management", path: "ojt/ojtdashboard", icon: FiUsers },
      { label: "Profile", path: "profile", icon: FiUser },
    ],

teacher: [
  { label: "Dashboard", path: "", icon: FiHome },
  { label: "Classes", path: "classes", icon: FiCalendar }, // ✅ NEW
  { label: "Subjects", path: "subjects", icon: FiBook },
  { label: "Materials", path: "materials", icon: FiFolder },
  { label: "Attendance", path: "attendance", icon: FiClipboard },
  { label: "Profile", path: "profile", icon: FiUser },
],
    student: [
      { label: "Dashboard", path: "", icon: FiHome },
      { label: "Subjects", path: "subjects", icon: FiBook },
      { label: "Attendance", path: "attendance", icon: FiClipboard },
      { label: "Timetable", path: "timetable", icon: FiClock },
      { label: "Profile", path: "profile", icon: FiUser },
    ],
  };

  const menuList = menus[role] || [];

  return (
    <aside
      className={`sidebar-v2 ${collapsed ? "collapsed" : ""}`}
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
    >
      {/* BRANDING */}
      <div className="sidebar-brand">
        <div className="brand-logo">
           <LayoutDashboard size={20} />
        </div>
        {!collapsed && (
          <div className="brand-text">
            <span className="brand-name">Smart Campus</span>
            <span className="brand-tagline">Assistant</span>
          </div>
        )}
      </div>

      <div className="sidebar-divider"></div>

      {/* NAVIGATION */}
      <nav className="sidebar-nav">
        {menuList.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={label}
            to={path ? `${basePath}/${path}` : basePath}
            end={path === ""}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <div className="nav-icon-box">
              <Icon />
            </div>
            {!collapsed && <span className="nav-text">{label}</span>}
            {!collapsed && <FiChevronRight className="nav-arrow" />}
          </NavLink>
        ))}
      </nav>

      {/* USER FOOTER */}
      <div className="sidebar-footer">
        <button
          className="logout-action"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          <div className="logout-icon-box">
            <FiLogOut />
          </div>
          {!collapsed && <span className="logout-text">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}