import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/CreateOrder.css';

const CreateOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const menuItem = location.state?.menuItem; // Get the menu item passed from Menu page

  const [formData, setFormData] = useState({
    items: menuItem ? [{ menuItem: menuItem._id, quantity: 1 }] : [],
    paymentMethod: 'Cash',
    isDelivery: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuantityChange = (e) => {
    const quantity = parseInt(e.target.value) || 1;
    setFormData(prev => ({
      ...prev,
      items: [{ ...prev.items[0], quantity }]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:3000/api/orders',
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        alert(`Order placed successfully! Order Number: ${response.data.order.orderNumber}`);
        navigate('/orders'); // Redirect to orders page
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
      console.error('Order creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!menuItem) {
    return (
      <div className="order-container">
        <div className="order-card">
          <h2>No Item Selected</h2>
          <p className="order-subtitle">Please select an item from the menu first.</p>
          <button 
            className="order-btn" 
            onClick={() => navigate('/menu')}
          >
            Go to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-container">
      <div className="order-card">
        <h2>Create Order</h2>
        <p className="order-subtitle">Review your order details below</p>

        {/* Order Item Summary */}
        <div className="order-item-summary">
          <div className="order-item-details">
            <h3>{menuItem.name}</h3>
            <p>{menuItem.description}</p>
            <p className="order-item-price">${menuItem.price?.toFixed(2)}</p>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="1"
              value={formData.items[0]?.quantity || 1}
              onChange={handleQuantityChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="paymentMethod">Payment Method</label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              required
            >
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isDelivery"
                checked={formData.isDelivery}
                onChange={handleChange}
              />
              <span>Request Delivery</span>
            </label>
          </div>

          <div className="order-total">
            <span>Total:</span>
            <span className="total-price">
              ${((menuItem.price || 0) * (formData.items[0]?.quantity || 1)).toFixed(2)}
            </span>
          </div>

          <button 
            type="submit" 
            className="order-btn" 
            disabled={loading}
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>

        <div className="back-link">
          <a onClick={() => navigate('/menu')}>← Back to Menu</a>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;