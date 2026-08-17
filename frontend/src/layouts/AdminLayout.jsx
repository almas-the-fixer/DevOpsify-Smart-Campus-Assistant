import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../ui/Sidebar";
import "../styles/layout.css";

export default function AdminLayout() {

  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="dashboard-layout">
      <Sidebar
        role="admin"
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className={`content ${collapsed ? "collapsed" : ""}`}>
        <div className="page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
