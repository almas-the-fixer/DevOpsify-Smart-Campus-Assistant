import "../styles/layout.css";

export default function Topbar({ title }) {
  return (
    <header className="topbar">
      <h3>{title}</h3>
    </header>
  );
}
