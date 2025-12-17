import { useEffect, useState } from "react";
import { getAllFeedback, hideFeedback } from "../api/feedbackApi";

export default function AdminFeedback() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    try {
      setLoading(true);
      const res = await getAllFeedback();
      setItems(res.data?.data || []);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  const hide = async (id) => {
    try {
      await hideFeedback(id);
      setItems((prev) => prev.filter((x) => x._id !== id));
    } catch (e) {
      alert(e.response?.data?.message || "Failed to hide feedback");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>All Feedback (Admin/Staff)</h2>

      {loading && <p>Loading...</p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      {!loading && !err && (
        <div style={{ display: "grid", gap: 12, maxWidth: 820 }}>
          {items.map((f) => (
            <div key={f._id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 14 }}>
              <b>{"★".repeat(f.rating)}</b>
              <p style={{ marginTop: 8 }}>{f.comment || <span style={{ opacity: 0.7 }}>No comment</span>}</p>

              <small style={{ opacity: 0.7 }}>
                User: {f.userId?.name || "Unknown"} ({f.userId?.email || "no email"})
              </small>

              <div style={{ marginTop: 10 }}>
                <button onClick={() => hide(f._id)}>Hide</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
