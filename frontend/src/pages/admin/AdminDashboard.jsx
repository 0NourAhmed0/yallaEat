import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../auth/AuthContext';
import '../../styles/AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCustomers: 0,
    totalStaff: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    todayOrders: 0,
    activeDeliveries: 0,
    totalFeedback: 0,
    totalReservations: 0,
    pendingReservations: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
      navigate('/unauthorized');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch data from multiple endpoints in parallel
      const [usersRes, ordersRes, feedbackRes, reservationsRes] = await Promise.all([
        axios.get('http://localhost:3000/api/users/users', { withCredentials: true }).catch(() => ({ data: [] })),
        axios.get('http://localhost:3000/api/orders/', { withCredentials: true }).catch(() => ({ data: { orders: [] } })),
        axios.get('http://localhost:3000/api/feedback/', { withCredentials: true }).catch(() => ({ data: [] })),
        axios.get('http://localhost:3000/api/reservations/all', { withCredentials: true }).catch(() => ({ data: { reservations: [] } }))
      ]);

      const users = usersRes.data || [];
      const orders = ordersRes.data.orders || [];
      const feedback = feedbackRes.data || [];
      const reservations = reservationsRes.data.reservations || [];

      // Calculate statistics
      const customers = users.filter(u => u.role === 'customer');
      const staff = users.filter(u => u.role === 'staff');
      const pendingOrders = orders.filter(o => o.status === 'Pending');
      const completedOrders = orders.filter(o => o.status === 'Delivered' || o.status === 'PickedUp');
      const totalRevenue = orders
        .filter(o => o.status !== 'Cancelled')
        .reduce((sum, order) => sum + (order.totalPrice || 0), 0);
      
      // Today's orders
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });

      // Active deliveries
      const activeDeliveries = orders.filter(o => 
        o.isDelivery && 
        o.deliveryStatus && 
        o.deliveryStatus !== 'delivered' && 
        o.status !== 'Cancelled'
      );

      // Pending reservations
      const pendingReservations = reservations.filter(r => r.status === 'pending');

      setStats({
        totalUsers: users.length,
        totalCustomers: customers.length,
        totalStaff: staff.length,
        totalOrders: orders.length,
        pendingOrders: pendingOrders.length,
        completedOrders: completedOrders.length,
        totalRevenue: totalRevenue,
        todayOrders: todayOrders.length,
        activeDeliveries: activeDeliveries.length,
        totalFeedback: feedback.length,
        totalReservations: reservations.length,
        pendingReservations: pendingReservations.length
      });

      // Set recent orders (last 5)
      setRecentOrders(orders.slice(0, 5));
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-dashboard-loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="admin-dashboard-error">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p className="dashboard-subtitle">Overview of restaurant operations</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.totalOrders}</h3>
            <p>Total Orders</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>${stats.totalRevenue.toFixed(2)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pendingOrders}</h3>
            <p>Pending Orders</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.completedOrders}</h3>
            <p>Completed Orders</p>
          </div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.todayOrders}</h3>
            <p>Today's Orders</p>
          </div>
        </div>

        <div className="stat-card delivery">
          <div className="stat-icon">🚚</div>
          <div className="stat-content">
            <h3>{stats.activeDeliveries}</h3>
            <p>Active Deliveries</p>
          </div>
        </div>

        <div className="stat-card users">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalCustomers}</h3>
            <p>Total Customers</p>
          </div>
        </div>

        <div className="stat-card staff">
          <div className="stat-icon">👨‍💼</div>
          <div className="stat-content">
            <h3>{stats.totalStaff}</h3>
            <p>Staff Members</p>
          </div>
        </div>

        <div className="stat-card reservation">
          <div className="stat-icon">🪑</div>
          <div className="stat-content">
            <h3>{stats.totalReservations}</h3>
            <p>Total Reservations</p>
          </div>
        </div>

        <div className="stat-card reservation-pending">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <h3>{stats.pendingReservations}</h3>
            <p>Pending Reservations</p>
          </div>
        </div>

        <div className="stat-card feedback">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <h3>{stats.totalFeedback}</h3>
            <p>Customer Feedback</p>
          </div>
        </div>

        <div className="stat-card total-users">
          <div className="stat-icon">🌐</div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="recent-orders-section">
        <h2>Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="no-data">No orders yet</p>
        ) : (
          <div className="recent-orders-list">
            {recentOrders.map((order) => (
              <div key={order._id} className="recent-order-item">
                <div className="order-info">
                  <span className="order-number">{order.orderNumber}</span>
                  <span className="order-customer">
                    {order.user?.name || 'Unknown Customer'}
                  </span>
                </div>
                <div className="order-details">
                  <span className="order-price">${order.totalPrice.toFixed(2)}</span>
                  <span className={`order-status status-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                  {order.isDelivery && (
                    <span className="delivery-badge">🚚 Delivery</span>
                  )}
                </div>
                <div className="order-time">
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button onClick={() => navigate('/admin/orders')} className="action-btn orders">
            <span className="btn-icon">📋</span>
            Manage Orders
          </button>
          <button onClick={() => navigate('/admin/reservations')} className="action-btn reservations">
            <span className="btn-icon">📅</span>
            Manage Reservations
          </button>
          <button onClick={() => navigate('/admin/menu')} className="action-btn menu">
            <span className="btn-icon">🍽️</span>
            Manage Menu
          </button>
          <button onClick={() => navigate('/admin/staff')} className="action-btn users">
            <span className="btn-icon">👥</span>
            Manage Users
          </button>
        </div>
      </div>
    </div>
  );
}
