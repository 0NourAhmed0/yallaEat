import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function Reservations() {
  const navigate = useNavigate();
  const [myReservations, setMyReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    reservation_date: "",
    reservation_time: "",
    party_size: 2,
    table_number: 1,
  });

  const loadMyReservations = async () => {
    setError("");
    try {
      const res = await api.get("/api/reservations/my-reservations");
      setMyReservations(res.data?.reservations || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const createReservation = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/api/reservations", {
        reservation_date: form.reservation_date,
        reservation_time: form.reservation_time,
        party_size: Number(form.party_size),
        table_number: Number(form.table_number),
      });
      await loadMyReservations();
      setForm((p) => ({ ...p, reservation_time: "" }));
    } catch (e2) {
      setError(e2.response?.data?.message || "Failed to create reservation");
    }
  };

  const cancelReservation = async (reservationId) => {
    setError("");
    try {
      await api.patch(`/api/reservations/${reservationId}/cancel`);
      await loadMyReservations();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to cancel reservation");
    }
  };

  return (
    <div className="page">
      <nav className="navbar">
        <div className="brand" onClick={() => navigate("/")}>YallaEat</div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate("/menu")}>Menu</button>
          <button className="nav-link" onClick={() => navigate("/orders")}>Orders</button>
          <button className="nav-link active" onClick={() => navigate("/reservations")}>
            Reservations
          </button>
          <button className="cta" onClick={() => navigate("/profile")}>Profile</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">Reservations</span>
          <h1>Book a table</h1>
          <p className="sub">Create, view, and cancel your reservations.</p>
        </div>
      </section>

      <div style={{ padding: "0 28px 60px", maxWidth: 900, margin: "0 auto" }}>
        {error && <div className="error-message">{error}</div>}

        <div
          style={{
            padding: 16,
            border: "1px solid #eee",
            borderRadius: 14,
            background: "#fff",
            marginBottom: 18,
          }}
        >
          <h3 style={{ marginTop: 0 }}>Create reservation</h3>
          <form onSubmit={createReservation} style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Date</span>
              <input
                type="date"
                name="reservation_date"
                value={form.reservation_date}
                onChange={onChange}
                required
                style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span>Time</span>
              <input
                type="time"
                name="reservation_time"
                value={form.reservation_time}
                onChange={onChange}
                required
                style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span>Party size</span>
              <input
                type="number"
                min="1"
                name="party_size"
                value={form.party_size}
                onChange={onChange}
                required
                style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span>Table number (1-10)</span>
              <input
                type="number"
                min="1"
                max="10"
                name="table_number"
                value={form.table_number}
                onChange={onChange}
                required
                style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              />
            </label>

            <button className="cta" type="submit">Create</button>
          </form>
        </div>

        <h3>My reservations</h3>
        {loading ? (
          <p>Loading...</p>
        ) : myReservations.length === 0 ? (
          <p>No reservations yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {myReservations.map((r) => (
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
                    <div style={{ fontWeight: 700 }}>
                      {r.reservation_date} {r.reservation_time}
                    </div>
                    <div style={{ color: "#666" }}>
                      Party: {r.party_size} • Table: {r.table_number}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700 }}>{r.status}</div>
                </div>

                <div style={{ marginTop: 10 }}>
                  <button
                    className="nav-link"
                    onClick={() => cancelReservation(r.reservation_id || r._id)}
                    disabled={r.status === "cancelled"}
                  >
                    Cancel
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


