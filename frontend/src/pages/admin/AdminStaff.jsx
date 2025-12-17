import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";

export default function AdminStaff() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "123456" });

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

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const addStaff = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/api/users/staff", form);
      setForm({ name: "", email: "", password: "123456" });
      await load();
    } catch (e2) {
      setError(e2.response?.data?.message || "Failed to add staff");
    }
  };

  const deleteStaff = async (id) => {
    setError("");
    try {
      await api.delete(`/api/users/staff/${id}`);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to delete staff");
    }
  };

  const staff = users.filter((u) => u.role === "staff");

  return (
    <div className="page">
      <nav className="navbar">
        <div className="brand" onClick={() => navigate("/")}>YallaEat</div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate("/admin")}>Dashboard</button>
          <button className="nav-link" onClick={() => navigate("/admin/users")}>Users</button>
          <button className="nav-link active" onClick={() => navigate("/admin/staff")}>Staff</button>
          <button className="cta" onClick={load}>Refresh</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">Admin</span>
          <h1>Staff Management</h1>
          <p className="sub">Add and remove staff accounts.</p>
        </div>
      </section>

      <div style={{ padding: "0 28px 60px", maxWidth: 1100, margin: "0 auto" }}>
        {error && <div className="error-message">{error}</div>}

        <div style={{ padding: 16, border: "1px solid #eee", borderRadius: 14, background: "#fff", marginBottom: 18 }}>
          <h3 style={{ marginTop: 0 }}>Add staff</h3>
          <form onSubmit={addStaff} style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr 1fr" }}>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Name"
              required
              style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
            />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="Email"
              required
              style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
            />
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              placeholder="Password"
              required
              style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
            />
            <div style={{ gridColumn: "1 / -1" }}>
              <button className="cta" type="submit">Create staff</button>
            </div>
          </form>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : staff.length === 0 ? (
          <p>No staff accounts.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {staff.map((u) => (
              <div
                key={u._id}
                style={{ padding: 14, border: "1px solid #eee", borderRadius: 14, background: "#fff" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>
                      {u.name} • {u.email}
                    </div>
                    <div style={{ color: "#666" }}>Role: {u.role}</div>
                  </div>
                  <button className="nav-link" onClick={() => deleteStaff(u._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


