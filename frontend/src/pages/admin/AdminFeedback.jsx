import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";

export default function AdminFeedback() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const res = await api.get("/api/feedback");
      setFeedback(res.data?.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hide = async (id) => {
    setError("");
    try {
      await api.put(`/api/feedback/${id}/hide`);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to hide feedback");
    }
  };

  return (
    <div className="page">
      <nav className="navbar">
        <div className="brand" onClick={() => navigate("/")}>YallaEat</div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate("/admin")}>Dashboard</button>
          <button className="nav-link" onClick={() => navigate("/admin/orders")}>Orders</button>
          <button className="nav-link" onClick={() => navigate("/admin/menu")}>Menu</button>
          <button className="nav-link active" onClick={() => navigate("/admin/feedback")}>Feedback</button>
          <button className="cta" onClick={load}>Refresh</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">Admin</span>
          <h1>Feedback</h1>
          <p className="sub">View customer feedback and hide inappropriate entries.</p>
        </div>
      </section>

      <div style={{ padding: "0 28px 60px", maxWidth: 1100, margin: "0 auto" }}>
        {error && <div className="error-message">{error}</div>}
        {loading ? (
          <p>Loading...</p>
        ) : feedback.length === 0 ? (
          <p>No feedback.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {feedback.map((f) => (
              <div
                key={f._id}
                style={{ padding: 14, border: "1px solid #eee", borderRadius: 14, background: "#fff" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>
                      Rating: {f.rating} • {f.userId?.email || "user"}
                    </div>
                    {f.comment && <div style={{ color: "#333" }}>{f.comment}</div>}
                    <div style={{ color: "#666", marginTop: 6 }}>
                      {f.createdAt ? new Date(f.createdAt).toLocaleString() : ""}
                    </div>
                  </div>
                  <button className="nav-link" onClick={() => hide(f._id)}>
                    Hide
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


