import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from "../api/client";
import '../styles/GetOrders.css';

const GetOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/orders/my-orders');

      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffa500',
      confirmed: '#4a90e2',
      preparing: '#ff7767',
      ready: '#28a745',
      completed: '#6c757d',
      cancelled: '#dc3545'
    };
    return colors[status] || '#666';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">My Orders</span>
          <h1>Order History</h1>
          <p className="sub">
            Track your current and past orders
          </p>
        </div>
      </section>

      <div style={{ padding: '0 28px 60px' }}>
        {loading && (
          <div className="loading-container">
            <p>Loading your orders...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button className="retry-button" onClick={fetchOrders}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="empty-container">
            <p>You haven't placed any orders yet.</p>
            <button className="order-now-btn" onClick={() => navigate('/menu')}>
              Browse Menu
            </button>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-number">
                    <strong>Order #{order.orderNumber}</strong>
                    <span className="order-date">{formatDate(order.createdAt)}</span>
                  </div>
                  <span 
                    className="order-status"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-info">
                        <span className="item-name">
                          {item.menuItem?.name || 'Unknown Item'}
                        </span>
                        <span className="item-quantity">x{item.quantity}</span>
                      </div>
                      <span className="item-price">${item.price?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-details">
                    <div className="detail-row">
                      <span>Payment Method:</span>
                      <strong>{order.paymentMethod}</strong>
                    </div>
                    {order.isDelivery && (
                      <div className="detail-row">
                        <span>Delivery Status:</span>
                        <strong>{order.deliveryStatus || 'N/A'}</strong>
                      </div>
                    )}
                    {order.estimatedReadyTime && (
                      <div className="detail-row">
                        <span>Estimated Time:</span>
                        <strong>{order.estimatedReadyTime} mins</strong>
                      </div>
                    )}
                  </div>
                  <div className="order-total-section">
                    <span className="total-label">Total:</span>
                    <span className="total-amount">${order.totalPrice?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GetOrders;