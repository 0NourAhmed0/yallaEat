import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminReservations.css';
import { useAuth } from '../auth/AuthContext';

const STATUS_OPTIONS = ['pending', 'confirmed', 'rejected', 'cancelled'];

const AdminReservations = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    status: '',
    reservation_date: '',
    table_number: '',
  });

  const [tableInputs, setTableInputs] = useState({});
  const [availability, setAvailability] = useState({ available: [], reserved: [] });
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchReservations();
  }, [user]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.reservation_date) params.reservation_date = filters.reservation_date;
      if (filters.table_number) params.table_number = filters.table_number;

      const res = await axios.get('http://localhost:3000/api/reservations/all', {
        params,
        withCredentials: true,
      });
      setReservations(res.data.reservations || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reservations.');
      console.error('Fetch reservations error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchReservations();
  };

  const handleClearFilters = () => {
    setFilters({ status: '', reservation_date: '', table_number: '' });
  };

  const updateStatus = async (reservation, action) => {
    const endpointMap = {
      confirm: `/api/reservations/${reservation.reservation_id}/confirm`,
      reject: `/api/reservations/${reservation.reservation_id}/reject`,
      cancel: `/api/reservations/${reservation.reservation_id}/cancel`,
    };
    const url = endpointMap[action];
    if (!url) return;

    try {
      await axios.patch(`http://localhost:3000${url}`, {}, { withCredentials: true });
      await fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} reservation.`);
      console.error(`${action} reservation error:`, err);
    }
  };

  const handleAssignTable = async (reservation) => {
    const tableNum = Number(tableInputs[reservation.reservation_id]);
    if (!tableNum || tableNum < 1 || tableNum > 10) {
      alert('Please enter a table number between 1 and 10.');
      return;
    }
    try {
      await axios.patch(
        `http://localhost:3000/api/reservations/${reservation.reservation_id}/update-table`,
        { table_number: tableNum },
        { withCredentials: true }
      );
      await fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update table.');
      console.error('Update table error:', err);
    }
  };

  const checkAvailability = async (reservation) => {
    setAvailabilityError('');
    setAvailability({ available: [], reserved: [] });
    const { reservation_date, reservation_time } = reservation;
    if (!reservation_date || !reservation_time) {
      setAvailabilityError('Missing reservation date/time for this entry.');
      return;
    }
    try {
      setCheckingAvailability(true);
      const res = await axios.get(
        'http://localhost:3000/api/reservations/available-tables',
        {
          params: {
            reservation_date,
            reservation_time,
          },
          withCredentials: true,
        }
      );
      setAvailability({
        available: res.data.availableTables || [],
        reserved: res.data.reservedTables || [],
      });
    } catch (err) {
      setAvailabilityError(
        err.response?.data?.message || 'Failed to check table availability.'
      );
      console.error('Availability check error:', err);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const statusClass = (status) =>
    ['pending', 'confirmed', 'rejected', 'cancelled'].includes(status)
      ? status
      : 'pending';

  const sortedReservations = useMemo(
    () =>
      [...reservations].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      ),
    [reservations]
  );

  return (
    <div className="page">

      <div className="admin-reservations-page">
        <section className="filters-card">
          <h2>Reservation Management</h2>
          <p className="subtitle">
            View, approve, reject, or update table assignments for reservations.
          </p>
          <form className="filters-form" onSubmit={handleApplyFilters}>
            <div className="filters-row">
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">All</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="reservation_date"
                  value={filters.reservation_date}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="form-group">
                <label>Table #</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  name="table_number"
                  value={filters.table_number}
                  onChange={handleFilterChange}
                  placeholder="Any"
                />
              </div>
            </div>
            <div className="filters-actions">
              <button type="submit" className="primary-btn">
                Apply Filters
              </button>
              <button
                type="button"
                className="ghost-btn"
                onClick={handleClearFilters}
              >
                Clear
              </button>
            </div>
          </form>
        </section>

        <section className="reservations-section">
          {loading ? (
            <div className="loading-container">
              <p>Loading reservations...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p className="error-message">{error}</p>
            </div>
          ) : sortedReservations.length === 0 ? (
            <div className="empty-container">
              <p>No reservations found.</p>
            </div>
          ) : (
            <div className="reservations-grid">
              {sortedReservations.map((reservation) => (
                <div key={reservation._id} className="reservation-admin-card">
                  <div className="card-header">
                    <div>
                      <p className="eyebrow">#{reservation.reservation_id}</p>
                      <h3>
                        {reservation.reservation_date} • {reservation.reservation_time}
                      </h3>
                    </div>
                    <span className={['status-badge', statusClass(reservation.status)].join(' ')}>
                      {reservation.status}
                    </span>
                  </div>

                  <div className="card-body">
                    <div className="row">
                      <span className="label">Customer</span>
                      <span className="value">
                        {reservation.customer_id?.name} ({reservation.customer_id?.email})
                      </span>
                    </div>
                    <div className="row">
                      <span className="label">Party Size</span>
                      <span className="value">{reservation.party_size}</span>
                    </div>
                    <div className="row">
                      <span className="label">Table</span>
                      <span className="value">{reservation.table_number ?? 'Unassigned'}</span>
                    </div>
                    <div className="row">
                      <span className="label">Staff</span>
                      <span className="value">
                        {reservation.staff_id?.name || 'Not set'}
                      </span>
                    </div>
                  </div>

                  <div className="table-actions">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      placeholder="Table #"
                      value={tableInputs[reservation.reservation_id] || ''}
                      onChange={(e) =>
                        setTableInputs((prev) => ({
                          ...prev,
                          [reservation.reservation_id]: e.target.value,
                        }))
                      }
                    />
                    <button
                      className="ghost-btn"
                      onClick={() => handleAssignTable(reservation)}
                    >
                      Save Table
                    </button>
                    <button
                      className="ghost-btn"
                      onClick={() => checkAvailability(reservation)}
                    >
                      {checkingAvailability ? 'Checking...' : 'Check Availability'}
                    </button>
                  </div>

                    {availabilityError && (
                      <div className="error-message compact">{availabilityError}</div>
                    )}

                    {availability.available.length > 0 && (
                      <div className="availability-row">
                        <div>
                          <span className="label">Available:</span>
                          <span className="value">
                            {availability.available.join(', ')}
                          </span>
                        </div>
                        <div>
                          <span className="label">Reserved:</span>
                          <span className="value">
                            {availability.reserved.join(', ')}
                          </span>
                        </div>
                      </div>
                    )}

                  <div className="card-actions">
                    {reservation.status === 'pending' && (
                      <>
                        <button
                          className="primary-btn"
                          onClick={() => updateStatus(reservation, 'confirm')}
                        >
                          Approve
                        </button>
                        <button
                          className="danger-btn"
                          onClick={() => updateStatus(reservation, 'reject')}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {reservation.status === 'confirmed' && (
                      <button
                        className="ghost-btn"
                        onClick={() => updateStatus(reservation, 'cancel')}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminReservations;


