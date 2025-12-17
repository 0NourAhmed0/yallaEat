import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createFeedback } from "../api/feedbackApi";

export default function FeedbackForm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const reservationId = useMemo(() => params.get("reservationId") || "", [params]);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    try {
      setLoading(true);
      await createFeedback({
        rating: Number(rating),
        comment,
        reservationId: reservationId || undefined,
      });
      setOk("Feedback submitted successfully ✅");
      setComment("");
      // optional: go to my feedback after 1s
      setTimeout(() => navigate("/my-feedback"), 700);
    } catch (error) {
      setErr(error.response?.data?.message || "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 520 }}>
      <h2>Leave Feedback</h2>

      {reservationId && (
        <p style={{ opacity: 0.8 }}>
          Reservation: <code>{reservationId}</code>
        </p>
      )}

      <form onSubmit={submit}>
        <label style={{ display: "block", marginBottom: 8 }}>
          Rating (1–5)
        </label>
        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 14 }}
        >
          <option value={5}>5 - Excellent</option>
          <option value={4}>4 - Good</option>
          <option value={3}>3 - Ok</option>
          <option value={2}>2 - Bad</option>
          <option value={1}>1 - Very Bad</option>
        </select>

        <label style={{ display: "block", marginBottom: 8 }}>Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          rows={5}
          placeholder="Write your comment (optional)…"
          style={{ width: "100%", padding: 10, marginBottom: 14 }}
        />

        {err && <p style={{ color: "crimson" }}>{err}</p>}
        {ok && <p style={{ color: "green" }}>{ok}</p>}

        <button disabled={loading} style={{ padding: "10px 16px" }}>
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
}
