import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";

export default function AdminReservations() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const res = await api.get("/api/reservations/all");
      setReservations(res.data?.reservations || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const act = async (id, action) => {
    setError("");
    try {
      await api.patch(`/api/reservations/${id}/${action}`);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to update reservation");
    }
  };

  const assignTable = async (id, table_number) => {
    setError("");
    try {
      await api.post(`/api/reservations/${id}/select-table`, { table_number: Number(table_number) });
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to assign table");
    }
  };

  return (
    <div className="page">
      <nav className="navbar">
        <div className="brand" onClick={() => navigate("/")}>YallaEat</div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate("/admin")}>Dashboard</button>
          <button className="nav-link" onClick={() => navigate("/admin/orders")}>Orders</button>
          <button className="nav-link active" onClick={() => navigate("/admin/reservations")}>Reservations</button>
          <button className="nav-link" onClick={() => navigate("/admin/menu")}>Menu</button>
          <button className="cta" onClick={load}>Refresh</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">Staff/Admin</span>
          <h1>Reservations</h1>
          <p className="sub">Confirm, reject, cancel, and assign tables.</p>
        </div>
      </section>

      <div style={{ padding: "0 28px 60px", maxWidth: 1100, margin: "0 auto" }}>
        {error && <div className="error-message">{error}</div>}
        {loading ? (
          <p>Loading...</p>
        ) : reservations.length === 0 ? (
          <p>No reservations.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {reservations.map((r) => (
              <div
                key={r._id}
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
                      {r.reservation_date} {r.reservation_time} • Table {r.table_number}
                    </div>
                    <div style={{ color: "#666" }}>
                      Party: {r.party_size} • Customer: {r.customer_id?.email || "N/A"}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700 }}>{r.status}</div>
                </div>

                <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button className="nav-link" onClick={() => act(r.reservation_id || r._id, "confirm")}>
                    Confirm
                  </button>
                  <button className="nav-link" onClick={() => act(r.reservation_id || r._id, "reject")}>
                    Reject
                  </button>
                  <button className="nav-link" onClick={() => act(r.reservation_id || r._id, "cancel")}>
                    Cancel
                  </button>
                  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>Assign table:</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      defaultValue={r.table_number || 1}
                      style={{ width: 72, padding: 8, borderRadius: 10, border: "1px solid #ddd" }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          assignTable(r.reservation_id || r._id, e.currentTarget.value);
                        }
                      }}
                    />
                    <button
                      className="nav-link"
                      onClick={(e) => {
                        const input = e.currentTarget.parentElement.querySelector("input");
                        assignTable(r.reservation_id || r._id, input.value);
                      }}
                    >
                      Save
                    </button>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


