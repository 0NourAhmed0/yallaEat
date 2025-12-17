import { useEffect, useState } from "react";
import { getMyFeedback } from "../api/feedbackApi";

export default function MyFeedback() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    try {
      setLoading(true);
      const res = await getMyFeedback();
      setItems(res.data?.data || []);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>My Feedback</h2>

      {loading && <p>Loading...</p>}
      {err && (
        <>
          <p style={{ color: "crimson" }}>{err}</p>
          <button onClick={load}>Try Again</button>
        </>
      )}

      {!loading && !err && items.length === 0 && <p>No feedback yet.</p>}

      {!loading && !err && items.length > 0 && (
        <div style={{ display: "grid", gap: 12, maxWidth: 720 }}>
          {items.map((f) => (
            <div
              key={f._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 14,
                background: "white",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <b>{"★".repeat(f.rating)}</b>
                <small style={{ opacity: 0.7 }}>
                  {new Date(f.createdAt).toLocaleString()}
                </small>
              </div>

              {f.comment ? <p style={{ marginTop: 8 }}>{f.comment}</p> : <p style={{ opacity: 0.7 }}>No comment</p>}

              {f.reservationId && (
                <p style={{ marginTop: 8, opacity: 0.75 }}>
                  Reservation: <code>{String(f.reservationId)}</code>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
