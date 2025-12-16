import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, removeItem, updateQty } from "../utils/cart";
import { isLoggedIn } from "../auth/auth";

export default function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(() => getCart());

  const total = cart.reduce((sum, x) => sum + x.price * x.qty, 0);

  const goCheckout = () => {
    if (!isLoggedIn()) return navigate("/login", { state: { from: "/cart" } });
    navigate("/checkout");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Cart</h2>

      {cart.length === 0 ? (
        <p>No items yet.</p>
      ) : (
        <>
          {cart.map((x) => (
            <div
              key={x.id}
              style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}
            >
              <div style={{ width: 220 }}>
                <b>{x.name}</b> — {x.price} EGP
              </div>

              <input
                type="number"
                min={1}
                value={x.qty}
                onChange={(e) => {
                  const qty = Number(e.target.value);
                  const next = updateQty(x.id, qty);
                  setCart(next);
                }}
                style={{ width: 60 }}
              />

              <button
                onClick={() => {
                  const next = removeItem(x.id);
                  setCart(next);
                }}
              >
                Remove
              </button>
            </div>
          ))}

          <h3>Total: {total} EGP</h3>
          <button onClick={goCheckout}>Checkout</button>

          {!isLoggedIn() && (
            <p style={{ marginTop: 10 }}>
              ⚠️ You are a guest. Login is required to checkout.
            </p>
          )}
        </>
      )}
    </div>
  );
}
