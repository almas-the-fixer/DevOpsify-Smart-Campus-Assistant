import Topbar from "../../ui/Topbar";

export default function AdminSubjects() {
  return (
    <>
      <Topbar title="Subjects Management" />

      <div className="page admin-page">
        <p className="page-subtitle">
          Create, assign, and manage subjects across departments
        </p>

        <div className="management-grid">
          <div className="action-card">
            <h4>Add Subject</h4>
            <p>Create a new subject manually</p>
          </div>

          <div className="action-card">
            <h4>Assign Teachers</h4>
            <p>Link subjects with faculty members</p>
          </div>

          <div className="action-card" 
          onClick={() => navigate("/admin/classes")}>
            <h4>Department Subjects</h4>
            <p>View subjects by department & semester</p>
          </div>

          <div className="action-card">
            <h4>Bulk Upload</h4>
            <p>Upload CSV to create subjects in bulk</p>
          </div>
        </div>
      </div>
    </>
  );
}
