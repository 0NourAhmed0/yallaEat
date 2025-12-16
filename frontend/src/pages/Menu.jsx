import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from "../api/client";
import '../styles/Menu.css';

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
      const response = await api.get('/api/menu-items', { withCredentials: false });
      
      if (response.data.success) {
        setMenuItems(response.data.items);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch menu items');
      console.error('Error fetching menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const key = "yallaeat_cart";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const idx = existing.findIndex((x) => x._id === item._id);
    if (idx >= 0) {
      existing[idx].quantity = (existing[idx].quantity || 1) + 1;
    } else {
      existing.push({ _id: item._id, name: item.name, price: item.price, quantity: 1 });
    }
    localStorage.setItem(key, JSON.stringify(existing));
    navigate("/cart");
  };

  const handleOrderClick = async (item) => {
    try {
      // Check if user is logged in by calling your auth endpoint
      const response = await api.get('/api/auth/check');

      if (response.data.success && response.data.isAuthenticated) {
        // User is logged in, add to cart (multi-item ordering) then go to cart
        addToCart(item);
      } else {
        // User is not logged in, redirect to register
        navigate('/register');
      }
    } catch (err) {
      // If error (401, 403, or network error), assume not logged in
      console.log('User not authenticated:', err);
      navigate('/register');
    }
  };

  return (
    <div className="page">
      <nav className="navbar">
        <div className="brand" onClick={() => navigate('/')}>
          YallaEat
        </div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate('/')}>
            Home
          </button>
          <button className="nav-link active" onClick={() => navigate('/menu')}>
            Menu
          </button>
          <button className="cta" onClick={() => navigate('/cart')}>
            Cart
          </button>
        </div>
      </nav>

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

      {/* Menu items section */}
      <div style={{ padding: '0 28px 60px' }}>
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
                    src={item.image || './public/images/OIP.jpg'} 
                    alt={item.name} 
                    className="menu-card-thumbnail"
                  />
                  <div className="rating-stars">
                    {'★'.repeat(5)}
                  </div>
                </div>
                
                <div className="menu-card-right">
                  <h3 className="menu-item-name"> Dish Name : {item.name}</h3>
                  <p className="menu-item-description">Description : Supreme {item.description}</p>
                    <p className="menu-item-price">price: ${item.price?.toFixed(2)}</p>
                    <p className="menu-item-category">Category : {item.category}</p>
                  </div>
                  <label className="add-topping-label">
                  </label>
                  <button className="order-button" onClick={() => handleOrderClick(item)}>
                    Add to cart
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