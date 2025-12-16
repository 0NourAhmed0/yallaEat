import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import '../styles/Reservations.css';

const Reservations = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    reservation_date: '',
    reservation_time: '',
    party_size: '',
  });

  const [checkingTables, setCheckingTables] = useState(false);
  const [availableTables, setAvailableTables] = useState([]);
  const [reservedTables, setReservedTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [availabilityError, setAvailabilityError] = useState('');

  const [creatingReservation, setCreatingReservation] = useState(false);
  const [createMessage, setCreateMessage] = useState('');

  const [myReservations, setMyReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [reservationsError, setReservationsError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMyReservations();
  }, [user]);

  const fetchMyReservations = async () => {
    try {
      setLoadingReservations(true);
      const res = await axios.get('http://localhost:3000/api/reservations/my-reservations', {
        withCredentials: true,
      });
      setMyReservations(res.data.reservations || []);
      setReservationsError('');
    } catch (err) {
      setReservationsError(
        err.response?.data?.message || 'Failed to load your reservations.'
      );
      console.error('Error fetching reservations:', err);
    } finally {
      setLoadingReservations(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setAvailabilityError('');
    setAvailableTables([]);
    setReservedTables([]);
    setSelectedTable(null);
    setCreateMessage('');
  };

  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    setAvailabilityError('');
    setCreateMessage('');

    const { reservation_date, reservation_time } = formData;

    if (!reservation_date || !reservation_time) {
      setAvailabilityError('Please select both date and time.');
      return;
    }

    try {
      setCheckingTables(true);
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

      setAvailableTables(res.data.availableTables || []);
      setReservedTables(res.data.reservedTables || []);

      if (!res.data.availableTables || res.data.availableTables.length === 0) {
        setAvailabilityError('No tables are available for this date and time.');
      }
    } catch (err) {
      setAvailabilityError(
        err.response?.data?.message || 'Failed to check table availability.'
      );
      console.error('Error checking availability:', err);
    } finally {
      setCheckingTables(false);
    }
  };

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    setCreateMessage('');

    const { reservation_date, reservation_time, party_size } = formData;

    if (!reservation_date || !reservation_time || !party_size) {
      setCreateMessage('Please fill in all fields.');
      return;
    }

    if (!selectedTable) {
      setCreateMessage('Please select a table from the available ones.');
      return;
    }

    try {
      setCreatingReservation(true);
      const res = await axios.post(
        'http://localhost:3000/api/reservations',
        {
          reservation_date,
          reservation_time,
          party_size: Number(party_size),
          table_number: selectedTable,
        },
        { withCredentials: true }
      );

      setCreateMessage('Reservation created successfully!');
      setFormData({
        reservation_date: '',
        reservation_time: '',
        party_size: '',
      });
      setAvailableTables([]);
      setReservedTables([]);
      setSelectedTable(null);
      await fetchMyReservations();
    } catch (err) {
      setCreateMessage(
        err.response?.data?.message || 'Failed to create reservation.'
      );
      console.error('Error creating reservation:', err);
    } finally {
      setCreatingReservation(false);
    }
  };

  const handleCancelReservation = async (reservation) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      await axios.patch(
        `http://localhost:3000/api/reservations/${reservation.reservation_id}/cancel`,
        {},
        { withCredentials: true }
      );
      await fetchMyReservations();
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      alert(
        err.response?.data?.message || 'Failed to cancel reservation. Please try again.'
      );
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
          <button className="nav-link" onClick={() => navigate('/menu')}>
            Menu
          </button>
          <button className="nav-link" onClick={() => navigate('/orders')}>
            My Orders
          </button>
          <button className="nav-link active" onClick={() => navigate('/reservations')}>
            Reservations
          </button>
          <button className="nav-link" onClick={() => navigate('/profile')}>
            Profile
          </button>
        </div>
      </nav>

      <div className="reservations-page">
        <section className="reservation-form-section">
          <h2>Create a Reservation</h2>
          <p className="reservation-subtitle">
            Choose your preferred date and time, check available tables, and confirm your booking.
          </p>

          <form className="reservation-form" onSubmit={handleCreateReservation}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reservation_date">Date</label>
                <input
                  type="date"
                  id="reservation_date"
                  name="reservation_date"
                  value={formData.reservation_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reservation_time">Time</label>
                <input
                  type="time"
                  id="reservation_time"
                  name="reservation_time"
                  value={formData.reservation_time}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="party_size">Party Size</label>
                <input
                  type="number"
                  id="party_size"
                  name="party_size"
                  min="1"
                  max="10"
                  value={formData.party_size}
                  onChange={handleInputChange}
                  placeholder="Number of guests"
                  required
                />
              </div>

              <div className="form-group">
                <label>Check Tables</label>
                <button
                  className="check-btn"
                  type="button"
                  onClick={handleCheckAvailability}
                  disabled={checkingTables}
                >
                  {checkingTables ? 'Checking...' : 'Check Availability'}
                </button>
              </div>
            </div>

            {availabilityError && (
              <div className="error-message reservation-error">
                {availabilityError}
              </div>
            )}

            {availableTables.length > 0 && (
              <div className="tables-section">
                <h3>Select a Table</h3>
                <p className="tables-subtitle">
                  Available tables for the selected date and time are highlighted.
                </p>
                <div className="tables-grid">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((table) => {
                    const isAvailable = availableTables.includes(table);
                    const isReserved = reservedTables.includes(table);
                    const isSelected = selectedTable === table;

                    return (
                      <button
                        key={table}
                        type="button"
                        className={[
                          'table-card',
                          isAvailable ? 'available' : '',
                          isReserved ? 'reserved' : '',
                          isSelected ? 'selected' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        disabled={!isAvailable}
                        onClick={() => setSelectedTable(table)}
                      >
                        <span className="table-number">Table {table}</span>
                        <span className="table-status">
                          {isAvailable
                            ? isSelected
                              ? 'Selected'
                              : 'Available'
                            : 'Unavailable'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {createMessage && (
              <div className="create-message">
                {createMessage}
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                className="save-btn"
                disabled={creatingReservation}
              >
                {creatingReservation ? 'Creating...' : 'Confirm Reservation'}
              </button>
            </div>
          </form>
        </section>

        <section className="my-reservations-section">
          <div className="section-header">
            <h2>My Reservations</h2>
          </div>

          {loadingReservations ? (
            <div className="loading-container">
              <p>Loading your reservations...</p>
            </div>
          ) : reservationsError ? (
            <div className="error-container">
              <p className="error-message">{reservationsError}</p>
            </div>
          ) : myReservations.length === 0 ? (
            <div className="empty-container">
              <p>You have no reservations yet.</p>
            </div>
          ) : (
            <div className="reservations-list">
              {myReservations.map((reservation) => (
                <div key={reservation._id} className="reservation-card">
                  <div className="reservation-main">
                    <div className="reservation-row">
                      <span className="reservation-label">Date</span>
                      <span className="reservation-value">
                        {reservation.reservation_date}
                      </span>
                    </div>
                    <div className="reservation-row">
                      <span className="reservation-label">Time</span>
                      <span className="reservation-value">
                        {reservation.reservation_time}
                      </span>
                    </div>
                    <div className="reservation-row">
                      <span className="reservation-label">Table</span>
                      <span className="reservation-value">
                        {reservation.table_number}
                      </span>
                    </div>
                    <div className="reservation-row">
                      <span className="reservation-label">Party Size</span>
                      <span className="reservation-value">
                        {reservation.party_size}
                      </span>
                    </div>
                  </div>

                  <div className="reservation-footer">
                    <span
                      className={[
                        'status-badge',
                        reservation.status,
                      ].join(' ')}
                    >
                      {reservation.status}
                    </span>

                    {reservation.status === 'pending' && (
                      <button
                        className="cancel-res-btn"
                        onClick={() => handleCancelReservation(reservation)}
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

export default Reservations;


