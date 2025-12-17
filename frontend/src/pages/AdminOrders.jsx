import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import '../styles/AdminOrders.css';

const STATUS_OPTIONS = ['Pending', 'Preparing', 'Ready', 'PickedUp', 'Delivered', 'Cancelled'];
const DELIVERY_STATUS_MAP = {
  pending: 'Pending',
  processing: 'Processing',
  on_the_way: 'On the way',
  arriving: 'Arriving',
  delivered: 'Delivered'
};

export default function AdminOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [deliveryTracking, setDeliveryTracking] = useState({});

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
      navigate('/unauthorized');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('http://localhost:3000/api/orders/', {
        withCredentials: true,
      });
      setOrders(res.data.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      setError('');
      await axios.put(
        `http://localhost:3000/api/orders/${orderId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      await fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status');
      console.error('Update status error:', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleStartDelivery = async (order) => {
    if (!order.isDelivery) {
      alert('This order is not a delivery order');
      return;
    }
    if (order.deliveryStatus && order.deliveryStatus !== 'pending') {
      alert('Delivery already started');
      return;
    }

    try {
      setError('');
      const res = await axios.post(
        'http://localhost:3000/api/orders/delivery',
        {
          userId: order.user._id,
          orderId: order._id,
        },
        { withCredentials: true }
      );
      
      alert(`Delivery started! Delivery ID: ${res.data.deliveryId}`);
      
      // Store delivery ID for tracking
      setDeliveryTracking(prev => ({
        ...prev,
        [order._id]: res.data.deliveryId
      }));
      
      await fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start delivery');
      console.error('Start delivery error:', err);
    }
  };

  const handleTrackDelivery = async (order) => {
    const deliveryId = deliveryTracking[order._id];
    if (!deliveryId) {
      alert('No delivery ID found for this order');
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:3000/api/orders/delivery/${deliveryId}`,
        { withCredentials: true }
      );
      
      const delivery = res.data;
      alert(`Delivery Status:\nStatus: ${delivery.status}\nProgress: ${delivery.progress}%`);
    } catch (err) {
      alert('Failed to fetch delivery status');
      console.error('Track delivery error:', err);
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
    <div className="admin-orders-page">
      <div className="admin-orders-header">
        <div>
          <h1>Order Management</h1>
          <p>View and manage all customer orders</p>
        </div>
        <button className="refresh-btn" onClick={fetchOrders} disabled={loading}>
          Refresh
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <p>Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-container">
          <p>No orders found.</p>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-card-header">
                <div>
                  <h3>Order #{order.orderNumber}</h3>
                  <p className="order-date">{formatDate(order.createdAt)}</p>
                </div>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status}
                </span>
              </div>

              <div className="order-details">
                <div className="detail-row">
                  <span className="label">Customer:</span>
                  <span className="value">
                    {order.user?.name || 'Unknown'} ({order.user?.email || 'N/A'})
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Total:</span>
                  <span className="value">${order.totalPrice?.toFixed(2)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Payment:</span>
                  <span className="value">{order.paymentMethod}</span>
                </div>
                {order.estimatedReadyTime && (
                  <div className="detail-row">
                    <span className="label">Est. Time:</span>
                    <span className="value">{order.estimatedReadyTime} mins</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="label">Delivery:</span>
                  <span className="value">{order.isDelivery ? 'Yes' : 'No'}</span>
                </div>
                {order.isDelivery && (
                  <div className="detail-row">
                    <span className="label">Delivery Status:</span>
                    <span className="value delivery-status">
                      {DELIVERY_STATUS_MAP[order.deliveryStatus] || order.deliveryStatus || 'Pending'}
                      {order.progress !== null && order.progress !== undefined && ` (${order.progress}%)`}
                    </span>
                  </div>
                )}
              </div>

              <div className="order-items">
                <h4>Items:</h4>
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <span>{item.menuItem?.name || 'Unknown Item'}</span>
                    <span>x{item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="order-actions">
                <div className="status-selector">
                  <label>Update Status:</label>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    disabled={updatingOrderId === order._id}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {order.isDelivery && (
                  <div className="delivery-actions">
                    {(!order.deliveryStatus || order.deliveryStatus === 'pending') && (
                      <button
                        className="btn-primary"
                        onClick={() => handleStartDelivery(order)}
                      >
                        Start Delivery
                      </button>
                    )}
                    {deliveryTracking[order._id] && (
                      <button
                        className="btn-secondary"
                        onClick={() => handleTrackDelivery(order)}
                      >
                        Track Delivery
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
