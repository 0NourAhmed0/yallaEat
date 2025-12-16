import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  return (
    <div className="page">
      <nav className="navbar">
        <div className="brand" onClick={() => navigate("/")}>YallaEat</div>
        <div className="nav-links">
          <button className="nav-link active" onClick={() => navigate("/admin")}>Dashboard</button>
          <button className="nav-link" onClick={() => navigate("/admin/orders")}>Orders</button>
          <button className="nav-link" onClick={() => navigate("/admin/reservations")}>Reservations</button>
          <button className="nav-link" onClick={() => navigate("/admin/menu")}>Menu</button>
          <button className="nav-link" onClick={() => navigate("/admin/users")}>Users</button>
          <button className="nav-link" onClick={() => navigate("/admin/staff")}>Staff</button>
          <button className="cta" onClick={() => navigate("/admin/feedback")}>Feedback</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">Admin</span>
          <h1>Dashboard</h1>
          <p className="sub">Use the navigation to manage the restaurant.</p>
        </div>
      </section>
    </div>
  );
}


