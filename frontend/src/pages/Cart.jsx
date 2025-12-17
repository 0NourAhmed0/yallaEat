import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, removeItem, updateQty } from "../utils/cart";
import { useAuth } from "../auth/AuthContext";
import "../styles/Cart.css";

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState(() => getCart());

  const total = cart.reduce((sum, x) => sum + x.price * x.qty, 0);

  const goCheckout = () => {
    if (!user) return navigate("/login", { state: { from: "/cart" } });
    navigate("/createOrder");
  };

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">Your Cart</span>
          <h1>Shopping Cart</h1>
          <p className="sub">
            Review and manage your items before checkout
          </p>
        </div>
      </section>

      <div style={{ padding: "0 28px 60px" }}>
        {cart.length === 0 ? (
          <div className="empty-container">
            <p>Your cart is empty. Start shopping!</p>
            <button 
              className="primary-btn"
              onClick={() => navigate("/menu")}
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items-container">
              <div className="cart-items-list">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item-card">
                    <div className="cart-item-left">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="cart-item-image"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <div className="cart-item-details">
                        <h3>{item.name}</h3>
                        <p className="cart-item-category">{item.category}</p>
                      </div>
                    </div>

                    <div className="cart-item-right">
                      <div className="quantity-control">
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => {
                            const qty = Number(e.target.value);
                            const next = updateQty(item.id, qty);
                            setCart(next);
                          }}
                          className="qty-input"
                        />
                      </div>

                      <div className="cart-item-pricing">
                        <p className="item-unit-price">${item.price?.toFixed(2)}</p>
                        <p className="item-total">${(item.price * item.qty)?.toFixed(2)}</p>
                      </div>

                      <button
                        className="remove-btn"
                        onClick={() => {
                          const next = removeItem(item.id);
                          setCart(next);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="cart-summary">
              <div className="summary-card">
                <h3>Order Summary</h3>
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-total">
                  <span>Total:</span>
                  <span className="total-price">${total.toFixed(2)}</span>
                </div>

                <button 
                  className="checkout-btn"
                  onClick={goCheckout}
                >
                  Proceed to Checkout
                </button>

                <button 
                  className="continue-shopping-btn"
                  onClick={() => navigate("/menu")}
                >
                  Continue Shopping
                </button>

                {!user && (
                  <p className="login-warning">
                    ⚠️ Please log in to complete your checkout
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
