import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/breadcrumbs.css";

export default function Breadcrumbs() {
  const location = useLocation();
  const navigate = useNavigate();

  const paths = location.pathname.split("/").filter(Boolean);

  return (
    <div className="breadcrumbs">

      <button
        className="back-btn"
        onClick={() => navigate(-1)}
      >
        ←
      </button>

      {paths.map((item, index) => {
        const route =
          "/" + paths.slice(0, index + 1).join("/");

        return (
          <span key={index}>
            <span className="sep"> / </span>

            <Link to={route}>
              {formatText(item)}
            </Link>
          </span>
        );
      })}
    </div>
  );
}

function formatText(text) {
  return text
    .replace("-", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
