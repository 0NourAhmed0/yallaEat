import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";

export default function AdminMenu() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", description: "", price: 0, category: "" });

  const load = async () => {
    setError("");
    try {
      const res = await api.get("/api/menu-items", { withCredentials: false });
      setItems(res.data?.items || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load menu");
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

  const add = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/api/menu-items", {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
      });
      setForm({ name: "", description: "", price: 0, category: "" });
      await load();
    } catch (e2) {
      setError(e2.response?.data?.message || "Failed to add item");
    }
  };

  const remove = async (id) => {
    setError("");
    try {
      await api.delete(`/api/menu-items/${id}`);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to delete item");
    }
  };

  return (
    <div className="page">
      <nav className="navbar">
        <div className="brand" onClick={() => navigate("/")}>YallaEat</div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate("/admin")}>Dashboard</button>
          <button className="nav-link" onClick={() => navigate("/admin/orders")}>Orders</button>
          <button className="nav-link" onClick={() => navigate("/admin/reservations")}>Reservations</button>
          <button className="nav-link active" onClick={() => navigate("/admin/menu")}>Menu</button>
          <button className="cta" onClick={load}>Refresh</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">Staff/Admin</span>
          <h1>Menu Management</h1>
          <p className="sub">Add and delete menu items.</p>
        </div>
      </section>

      <div style={{ padding: "0 28px 60px", maxWidth: 1100, margin: "0 auto" }}>
        {error && <div className="error-message">{error}</div>}

        <div style={{ padding: 16, border: "1px solid #eee", borderRadius: 14, background: "#fff", marginBottom: 18 }}>
          <h3 style={{ marginTop: 0 }}>Add menu item</h3>
          <form onSubmit={add} style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Name"
              required
              style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
            />
            <input
              name="category"
              value={form.category}
              onChange={onChange}
              placeholder="Category"
              style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
            />
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={onChange}
              placeholder="Price"
              required
              style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
            />
            <input
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Description"
              style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
            />
            <div style={{ gridColumn: "1 / -1" }}>
              <button className="cta" type="submit">Add</button>
            </div>
          </form>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <p>No menu items.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {items.map((it) => (
              <div
                key={it._id}
                style={{ padding: 14, border: "1px solid #eee", borderRadius: 14, background: "#fff" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>
                      {it.name} • ${Number(it.price || 0).toFixed(2)}
                    </div>
                    <div style={{ color: "#666" }}>{it.category || "—"}</div>
                  </div>
                  <button className="nav-link" onClick={() => remove(it._id)}>
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


