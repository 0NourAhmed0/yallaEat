import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import "../styles/Menu.css";
import { addItem } from "../utils/cart";

const Menu = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/menu-items");
      if (response.data?.success) setMenuItems(response.data.items || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch menu items");
      console.error("Error fetching menu items:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    addItem({
      id: item._id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      imageUrl: item.imageUrl
    });
    alert(`${item.name} added to cart!`);
  };

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">Our Menu</span>
          <h1>Delicious Dishes Await</h1>
          <p className="sub">
            Explore our carefully crafted menu featuring authentic flavors and fresh ingredients.
            From appetizers to desserts, we have something for everyone.
          </p>
        </div>
      </section>

      <div style={{ padding: "0 28px 60px" }}>
        {loading && (
          <div className="loading-container">
            <p>Loading menu items...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button className="retry-button" onClick={fetchMenuItems}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && menuItems.length === 0 && (
          <div className="empty-container">
            <p>No menu items available at the moment.</p>
          </div>
        )}

        {!loading && !error && menuItems.length > 0 && (
          <div className="menu-grid">
            {menuItems.map((item) => (
              <div key={item._id} className="menu-card-compact">
                <div className="menu-card-left">
                  <img
                    src={item.imageUrl || "/images/OIP.jpg"}
                    alt={item.name}
                    className="menu-card-thumbnail"
                  />
                  <div className="rating-stars">{"★".repeat(5)}</div>
                </div>

                <div className="menu-card-right">
                  <h3 className="menu-item-name">Dish Name : {item.name}</h3>
                  <p className="menu-item-description">
                    Description : Supreme {item.description}
                  </p>
                  <p className="menu-item-price">
                    price: ${item.price?.toFixed(2)}
                  </p>
                  <p className="menu-item-category">Category : {item.category}</p>
                </div>

                <button className="order-button" onClick={() => handleAddToCart(item)}>
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
