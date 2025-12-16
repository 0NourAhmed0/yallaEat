import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const res = await api.get("/api/orders");
      setOrders(res.data?.orders || []);
    } catch (e) {
      setError(e.response?.data || e.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (orderId, status) => {
    setError("");
    try {
      await api.put(`/api/orders/${orderId}`, { status });
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="page">
      <nav className="navbar">
        <div className="brand" onClick={() => navigate("/")}>YallaEat</div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate("/admin")}>Dashboard</button>
          <button className="nav-link active" onClick={() => navigate("/admin/orders")}>Orders</button>
          <button className="nav-link" onClick={() => navigate("/admin/reservations")}>Reservations</button>
          <button className="nav-link" onClick={() => navigate("/admin/menu")}>Menu</button>
          <button className="cta" onClick={load}>Refresh</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">Staff/Admin</span>
          <h1>Orders</h1>
          <p className="sub">Update order status for customers.</p>
        </div>
      </section>

      <div style={{ padding: "0 28px 60px", maxWidth: 1100, margin: "0 auto" }}>
        {error && <div className="error-message">{String(error)}</div>}
        {loading ? (
          <p>Loading...</p>
        ) : orders.length === 0 ? (
          <p>No orders.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {orders.map((o) => (
              <div
                key={o._id}
                style={{
                  padding: 14,
                  border: "1px solid #eee",
                  borderRadius: 14,
                  background: "#fff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>
                      {o.orderNumber} • {o.user?.email || "customer"}
                    </div>
                    <div style={{ color: "#666" }}>
                      Total: ${Number(o.totalPrice || 0).toFixed(2)} • Payment: {o.paymentMethod}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700 }}>{o.status}</div>
                </div>

                <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {["Pending", "Preparing", "Ready", "Cancelled"].map((s) => (
                    <button
                      key={s}
                      className="nav-link"
                      onClick={() => updateStatus(o._id, s)}
                      disabled={o.status === s}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


