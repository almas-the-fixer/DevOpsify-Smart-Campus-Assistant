import { useNavigate } from "react-router-dom";
import "../styles/upload.css";

const AdminPageHeader = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="admin-header">
      <button
        className="back-btn"
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        ← Back
      </button>

      <h2 className="admin-title">{title}</h2>
    </div>
  );
};

export default AdminPageHeader;
