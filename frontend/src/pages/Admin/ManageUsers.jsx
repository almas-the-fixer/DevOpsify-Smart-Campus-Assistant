import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { FiFilter, FiUserPlus, FiSearch, FiRefreshCcw, FiShieldOff, FiTrash2, FiChevronDown, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import OjtFormModal from "./OjtFormModal";
import "../../styles/manageUsers.css";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [batchTypeFilter, setBatchTypeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showOjtModal, setShowOjtModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  const filterRef = useRef(null);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.filter(u => u.role !== "admin"));
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, semesterFilter, divisionFilter, batchTypeFilter]);

  const resetFilters = () => {
    setRoleFilter("all");
    setSemesterFilter("all");
    setDivisionFilter("all");
    setBatchTypeFilter("all");
    setSortOrder("asc");
    setCurrentPage(1);
  };

  // Helper to handle role filter change and clear student-specific filters
  const handleRoleFilterChange = (val) => {
    setRoleFilter(val);
    if (val === "teacher") {
      setSemesterFilter("all");
      setDivisionFilter("all");
      setBatchTypeFilter("all");
    }
  };

  const handleBatchChange = async (userId, newBatch, currentBatch) => {

  setLoadingId(userId);

  try{

   if(newBatch === "OJT" && currentBatch !== "OJT"){
    setSelectedStudent(userId);
    setShowOjtModal(true);
    setLoadingId(null);
    return;
}

    if(newBatch === "NORMAL" && currentBatch === "OJT"){

        if(!window.confirm("End OJT for this student?")){
          setLoadingId(null);
          return;
        }

        await api.put("/admin/ojt/end",{ studentId:userId });

        fetchUsers();
    }

  }catch(err){
    alert("Batch update failed");
  }

  setLoadingId(null);

};

  const handleRoleChange = async (userId, newRole) => {
    setLoadingId(userId);
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert("Role update failed.");
    } finally {
      setLoadingId(null);
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilters(false);
    };
    if (showFilters) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showFilters]);

  const handleConfirm = async () => {
    const { type, user } = confirm;
    setLoadingId(user._id);
    try {
      if (type === "block") await api.put(`/admin/users/${user._id}/block`, { isActive: !user.isActive });
      if (type === "reset") await api.put(`/admin/users/${user._id}/reset-password`);
      if (type === "delete") await api.delete(`/admin/users/${user._id}`);
      fetchUsers();
    } catch {
      alert("Action failed");
    } finally {
      setLoadingId(null);
      setConfirm(null);
    }
  };

  const filteredUsers = useMemo(() => {
    let data = [...users];
    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter(u => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
    }
    if (roleFilter !== "all") data = data.filter(u => u.role === roleFilter);
    
    // Only apply student filters if role is not teacher
    if (roleFilter !== "teacher") {
        if (batchTypeFilter !== "all") data = data.filter(u => u.role === "student" && u.batchType === batchTypeFilter);
        if (semesterFilter !== "all") {
          data = data.filter(u => u.role === "student" && String(u.semester) === semesterFilter);
          if (divisionFilter !== "all") data = data.filter(u => u.division === divisionFilter);
        }
    }
    
    data.sort((a, b) => sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    return data;
  }, [users, search, roleFilter, semesterFilter, divisionFilter, batchTypeFilter, sortOrder]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  return (
    <div className="manage-users-wrapper">
      <div className="mu-container">
        <header className="flex flex-col mb-10 lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-[#203871] tracking-tight">
              User <span className="text-blue-500">Directory</span>
            </h1>
            <p className="text-slate-500 font-medium italic">Command center for personnel and student access control.</p>
          </div>
          <button 
            onClick={() => navigate("/admin/add-user")} 
            className="group flex items-center gap-3 bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 hover:scale-105 transition-all"
          >
            <FiUserPlus className="text-blue-200" /> Register New Identity
          </button>
        </header>

        <div className="mu-toolbar-v2">
          <div className="mu-search-box">
            <FiSearch className="search-icon" />
            <input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="mu-filter-wrapper" ref={filterRef}>
            <button className={`mu-filter-trigger ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
              <FiFilter /> Filters {(roleFilter !== "all" || semesterFilter !== "all" || batchTypeFilter !== "all") && <span className="filter-dot"></span>}
            </button>

            {showFilters && (
              <div className="mu-dropdown-card">
                <FilterSelect label="User Role" value={roleFilter} onChange={handleRoleFilterChange}>
                  <option value="all">All Roles</option>
                  <option value="student">Student Only</option>
                  <option value="teacher">Teacher Only</option>
                </FilterSelect>

                {/* Batch Filter: Disabled if Teacher is selected */}
                <FilterSelect 
                    label="Batch Type" 
                    value={batchTypeFilter} 
                    onChange={setBatchTypeFilter}
                    disabled={roleFilter === "teacher"}
                >
                  <option value="all">All Batches</option>
                  <option value="NORMAL">Normal Students</option>
                  <option value="OJT">OJT Students</option>
                </FilterSelect>
                
                {/* Semester Filter: Disabled if Teacher is selected */}
                <FilterSelect 
                    label="Semester" 
                    value={semesterFilter} 
                    onChange={(val) => {setSemesterFilter(val); setDivisionFilter("all");}}
                    disabled={roleFilter === "teacher"}
                >
                  <option value="all">All Semesters</option>
                  {[6, 8].map(s => <option key={s} value={String(s)}>Semester {s}</option>)}
                </FilterSelect>

                {/* Division Filter: Disabled if Semester is "all" OR Role is "teacher" */}
                <div className={`mu-dropdown-item ${(semesterFilter === "all" || roleFilter === "teacher") ? "is-disabled" : ""}`}>
                  <label>Division</label>
                  <div className="select-wrapper">
                    <select 
                      disabled={semesterFilter === "all" || roleFilter === "teacher"} 
                      value={divisionFilter} 
                      onChange={(e) => setDivisionFilter(e.target.value)}
                    >
                      <option value="all">All Divisions</option>
                      <option value="A">Division A</option>
                      <option value="B">Division B</option>
                      <option value="C">Division C</option>
                    </select>
                    <FiChevronDown className="select-arrow" />
                  </div>
                </div>

                <button className="mu-reset-v2" onClick={resetFilters}>Clear All Filters</button>
              </div>
            )}
          </div>
        </div>

        <div className="mu-table-card-v2">
          <div className="table-responsive">
            <table className="mu-modern-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Academic / Batch</th>
                  <th>Div / Roll</th>
                  <th>Status</th>
                  <th style={{textAlign: 'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map(u => (
                  <tr key={u._id} className={!u.isActive ? "row-blocked" : ""}>
                    <td>
                      <div className="user-profile-cell">
                        <div className={`user-avatar ${loadingId === u._id ? 'loading-spin' : ''}`}>
                          {u.name.charAt(0)}
                        </div>
                        <div className="user-details">
                          <span className="user-name">{u.name}</span>
                          <span className="user-email">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="role-select-wrapper">
                        <select 
                          className={`mu-role-dropdown-v2 ${u.role}`}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          disabled={loadingId === u._id}
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                        </select>
                      </div>
                    </td>
                    <td>
                      {u.role === "student" ? (
                        <div className="mu-batch-info">
                          <span className="info-sub">SEM {u.semester}</span>
                          <div className="batch-switch-container">
                             <select 
                               className={`batch-dropdown-v3 ${u.batchType}`}
                               value={u.batchType || "NORMAL"}
                               onChange={(e)=>handleBatchChange(u._id,e.target.value,u.batchType)}
                               disabled={loadingId === u._id}
                             >
                               <option value="NORMAL">NORMAL</option>
                               <option value="OJT">OJT</option>
                             </select>
                          </div>
                        </div>
                      ) : <span className="text-muted-dash">—</span>}
                    </td>
                    <td>
                      {u.role === "student" ? (
                        <div className="div-roll-box"><strong>{u.division}</strong> <span className="divider">/</span> {u.rollNo}</div>
                      ) : <span className="text-muted-dash">—</span>}
                    </td>
                    <td>
                      <span className={`status-pill ${u.isActive ? "active" : "blocked"}`}>
                        {u.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td>
                      <div className="mu-action-group">
                        <button className="act-btn reset" title="Reset Password" onClick={() => setConfirm({ type: "reset", user: u })}><FiRefreshCcw /></button>
                        <button className={`act-btn ${u.isActive ? 'block' : 'unblock'}`} onClick={() => setConfirm({ type: "block", user: u })}><FiShieldOff /></button>
                        <button className="act-btn delete" onClick={() => setConfirm({ type: "delete", user: u })}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
              <div className="mu-empty-state">
                <p>No users found matching your criteria.</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mu-pagination">
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="pag-btn"
              >
                <FiChevronLeft />
              </button>
              
              <span className="pag-info">
                Page <strong>{currentPage}</strong> of {totalPages}
              </span>

              <button 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="pag-btn"
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </div>
        {showOjtModal && (
  <OjtFormModal
    userId={selectedStudent}
    onClose={()=>setShowOjtModal(false)}
    onSuccess={fetchUsers}
  />
)}
      </div>

      {confirm && (
        <div className="mu-modal-overlay">
          <div className="mu-modal-v2">
            <div className={`modal-icon icon-${confirm.type}`}><FiShieldOff /></div>
            <h3>Confirm {confirm.type.charAt(0).toUpperCase() + confirm.type.slice(1)}</h3>
            <p>Are you sure you want to {confirm.type} <strong>{confirm.user.name}</strong>?</p>
            <div className="modal-btns">
              <button className="m-btn-cancel" onClick={() => setConfirm(null)}>Cancel</button>
              <button className={`m-btn-confirm btn-${confirm.type}`} onClick={handleConfirm}>Proceed</button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

function FilterSelect({ label, value, onChange, children, disabled }) {
  return (
    <div className={`mu-dropdown-item ${disabled ? 'is-disabled' : ''}`}>
      <label>{label}</label>
      <div className="select-wrapper">
        <select disabled={disabled} value={value} onChange={(e) => onChange(e.target.value)}>{children}</select>
        <FiChevronDown className="select-arrow" />
      </div>
    </div>
  );
}