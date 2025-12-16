import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const res = await api.get("/api/users/users");
      setUsers(res.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const disableCustomer = async (id) => {
    setError("");
    try {
      await api.put(`/api/users/disable-customer/${id}`);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to disable customer");
    }
  };

  return (
    <div className="page">
      <nav className="navbar">
        <div className="brand" onClick={() => navigate("/")}>YallaEat</div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate("/admin")}>Dashboard</button>
          <button className="nav-link active" onClick={() => navigate("/admin/users")}>Users</button>
          <button className="nav-link" onClick={() => navigate("/admin/staff")}>Staff</button>
          <button className="cta" onClick={load}>Refresh</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">Admin</span>
          <h1>Users</h1>
          <p className="sub">View users and disable customer accounts.</p>
        </div>
      </section>

      <div style={{ padding: "0 28px 60px", maxWidth: 1100, margin: "0 auto" }}>
        {error && <div className="error-message">{error}</div>}
        {loading ? (
          <p>Loading...</p>
        ) : users.length === 0 ? (
          <p>No users.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {users.map((u) => (
              <div
                key={u._id}
                style={{ padding: 14, border: "1px solid #eee", borderRadius: 14, background: "#fff" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>
                      {u.name} • {u.email}
                    </div>
                    <div style={{ color: "#666" }}>
                      Role: {u.role} {u.disabled ? "• DISABLED" : ""}
                    </div>
                  </div>
                  {u.role === "customer" && !u.disabled && (
                    <button className="nav-link" onClick={() => disableCustomer(u._id)}>
                      Disable
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


