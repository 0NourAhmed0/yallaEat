import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setError("");
    setLoading(true);
    try {
      await api.put("/api/auth/forgetPassword", { email });
      setStatus("OTP sent. Check your email.");
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Forgot Password</h2>
        <p className="login-subtitle">We’ll email you an OTP to reset your password.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {status && <div style={{ color: "#2e7d32", marginBottom: 10 }}>{status}</div>}
          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>

        <p className="signup-link" style={{ marginTop: 12 }}>
          <button className="nav-link" type="button" onClick={() => navigate("/login")}>
            Back to login
          </button>
        </p>
      </div>
    </div>
  );
}
