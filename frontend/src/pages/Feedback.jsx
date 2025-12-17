import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function Feedback() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [myFeedback, setMyFeedback] = useState([]);

  const loadMyFeedback = async () => {
    try {
      const res = await api.get("/api/feedback/my");
      setMyFeedback(res.data?.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load feedback");
    }
  };

  useEffect(() => {
    loadMyFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/api/feedback", { rating: Number(rating), comment });
      setComment("");
      await loadMyFeedback();
    } catch (e2) {
      setError(e2.response?.data?.message || "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <nav className="navbar">
        <div className="brand" onClick={() => navigate("/")}>YallaEat</div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate("/menu")}>Menu</button>
          <button className="nav-link" onClick={() => navigate("/orders")}>Orders</button>
          <button className="nav-link" onClick={() => navigate("/reservations")}>Reservations</button>
          <button className="nav-link active" onClick={() => navigate("/feedback")}>Feedback</button>
          <button className="cta" onClick={() => navigate("/profile")}>Profile</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">Feedback</span>
          <h1>Rate your experience</h1>
          <p className="sub">Submit a rating and comment.</p>
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
          <h3 style={{ marginTop: 0 }}>Submit feedback</h3>
          <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Rating (1-5)</span>
              <input
                type="number"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                required
                style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span>Comment</span>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              />
            </label>

            <button className="cta" type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>

        <h3>My feedback</h3>
        {myFeedback.length === 0 ? (
          <p>No feedback yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {myFeedback.map((f) => (
              <div
                key={f._id}
                style={{
                  padding: 14,
                  border: "1px solid #eee",
                  borderRadius: 14,
                  background: "#fff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>Rating: {f.rating}</strong>
                  <span style={{ color: "#666" }}>
                    {f.createdAt ? new Date(f.createdAt).toLocaleString() : ""}
                  </span>
                </div>
                {f.comment && <p style={{ marginBottom: 0 }}>{f.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


