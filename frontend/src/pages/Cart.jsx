import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

const CART_KEY = "yallaeat_cart";

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [isDelivery, setIsDelivery] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    setItems(stored);
  }, []);

  const total = useMemo(() => {
    return items.reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0);
  }, [items]);

  const updateQuantity = (id, quantity) => {
    const q = Math.max(1, Number(quantity) || 1);
    const next = items.map((it) => (it._id === id ? { ...it, quantity: q } : it));
    setItems(next);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
  };

  const removeItem = (id) => {
    const next = items.filter((it) => it._id !== id);
    setItems(next);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(CART_KEY);
  };

  const checkout = async () => {
    setError("");
    if (!items.length) return;
    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        items: items.map((it) => ({ menuItem: it._id, quantity: it.quantity })),
        paymentMethod,
        isDelivery,
      };
      const res = await api.post("/api/orders", payload);
      if (res.data?.success) {
        clearCart();
        navigate("/orders");
      } else {
        setError("Checkout failed");
      }
    } catch (e) {
      setError(e.response?.data?.message || "Checkout failed");
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
          <button className="nav-link active" onClick={() => navigate("/cart")}>Cart</button>
          <button className="cta" onClick={() => navigate("/orders")}>My Orders</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">Cart</span>
          <h1>Your items</h1>
          <p className="sub">Review quantities and checkout.</p>
        </div>
      </section>

      <div style={{ padding: "0 28px 60px", maxWidth: 900, margin: "0 auto" }}>
        {error && <div className="error-message">{error}</div>}

        {items.length === 0 ? (
          <div className="empty-container">
            <p>Your cart is empty.</p>
            <button className="cta" onClick={() => navigate("/menu")}>Browse menu</button>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gap: 12 }}>
              {items.map((it) => (
                <div
                  key={it._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: 14,
                    border: "1px solid #eee",
                    borderRadius: 12,
                    background: "#fff",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{it.name}</div>
                    <div style={{ color: "#666" }}>${Number(it.price || 0).toFixed(2)}</div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input
                      type="number"
                      min="1"
                      value={it.quantity || 1}
                      onChange={(e) => updateQuantity(it._id, e.target.value)}
                      style={{ width: 72, padding: 8, borderRadius: 10, border: "1px solid #ddd" }}
                    />
                    <button className="nav-link" onClick={() => removeItem(it._id)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>Total</strong>
                <strong>${total.toFixed(2)}</strong>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontWeight: 600 }}>Payment method</span>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                  </select>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 28 }}>
                  <input
                    type="checkbox"
                    checked={isDelivery}
                    onChange={(e) => setIsDelivery(e.target.checked)}
                  />
                  <span>Request delivery</span>
                </label>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button className="nav-link" onClick={clearCart} disabled={loading}>
                  Clear cart
                </button>
                <button className="cta" onClick={checkout} disabled={loading || items.length === 0}>
                  {loading ? "Checking out..." : "Checkout"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


