import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/StaffMenuItemPage.css';

const StaffMenuItemPage = () => {
    const navigate = useNavigate();
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        category: '',
        imageUrl: '',
        isAvailable: true
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    // Initial Fetch
    useEffect(() => {
        fetchMenuItems();
    }, []);

    const fetchMenuItems = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:3000/api/menu-items');

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

    // Form Handlers
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentItem(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const openAddModal = () => {
        setIsEditing(false);
        setCurrentItem({
            name: '',
            description: '',
            price: '',
            category: '',
            category: '',
            imageUrl: '',
            isAvailable: true
        });
        setFormError('');
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setIsEditing(true);
        setCurrentItem({ ...item });
        setFormError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormError('');
    };

    // CRUD Operations
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');

        try {
            const config = { withCredentials: true };
            let response;

            if (isEditing) {
                response = await axios.put(
                    `http://localhost:3000/api/menu-items/${currentItem._id}`,
                    currentItem,
                    config
                );
            } else {
                response = await axios.post(
                    'http://localhost:3000/api/menu-items',
                    currentItem,
                    config
                );
            }

            if (response.data.success) {
                fetchMenuItems(); // Refresh list
                closeModal();
            }
        } catch (err) {
            console.error('Operation failed:', err);
            setFormError(err.response?.data?.message || 'Operation failed. Please try again.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await axios.delete(`http://localhost:3000/api/menu-items/${id}`, {
                withCredentials: true
            });

            if (response.data.success) {
                setMenuItems(prev => prev.filter(item => item._id !== id));
            }
        } catch (err) {
            console.error('Delete failed:', err);
            // Optional: show a toast or alert
            alert(err.response?.data?.message || 'Failed to delete item');
        }
    };

    return (
        <div className="page">
            <nav className="navbar">
                <div className="brand" onClick={() => navigate('/')}>
                    YallaEat Staff
                </div>
                <div className="nav-links">
                    <button className="nav-link" onClick={() => navigate('/')}>
                        Home
                    </button>
                    <button className="nav-link" onClick={() => navigate('/menu')}>
                        Public Menu
                    </button>
                    <button className="nav-link active">
                        Manage Menu
                    </button>
                </div>
            </nav>

            <div className="page-header">
                <div className="page-title">
                    <h1>Menu Management</h1>
                    <p>Add, edit, or remove items from the menu</p>
                </div>
                <button className="add-btn" onClick={openAddModal}>
                    <span>+</span> Add New Item
                </button>
            </div>

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
                    <p>No menu items found. Start by adding one!</p>
                </div>
            )}

            {!loading && !error && (
                <div className="menu-grid">
                    {menuItems.map((item) => (
                        <div key={item._id} className="menu-card">
                            <div className="card-content">
                                <img
                                    src={item.imageUrl || '/placeholder-food.jpg'}
                                    alt={item.name}
                                    className="card-image"
                                    onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=No+Image'; }}
                                />
                                <div className="card-details">
                                    <h3>{item.name}</h3>
                                    <span className="item-price">${Number(item.price).toFixed(2)}</span>
                                    <span className="item-category">{item.category}</span>
                                    <p className="item-desc">{item.description}</p>
                                </div>
                            </div>
                            <div className="card-actions">
                                <button
                                    className="action-btn edit-btn"
                                    onClick={() => openEditModal(item)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="action-btn delete-btn"
                                    onClick={() => handleDelete(item._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={(e) => {
                    if (e.target === e.currentTarget) closeModal();
                }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{isEditing ? 'Edit Item' : 'Add New Item'}</h2>
                            <button className="close-btn" onClick={closeModal}>&times;</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Item Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={currentItem.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., Margherita Pizza"
                                />
                            </div>

                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    name="category"
                                    value={currentItem.category}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select a category</option>
                                    <option value="Starters">Starters</option>
                                    <option value="Main Course">Main Course</option>
                                    <option value="Desserts">Desserts</option>
                                    <option value="Drinks">Drinks</option>
                                    <option value="Appetizers">Appetizers</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Price ($)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={currentItem.price}
                                    onChange={handleInputChange}
                                    required
                                    step="0.01"
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    className="form-textarea"
                                    name="description"
                                    value={currentItem.description}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Describe the dish..."
                                />
                            </div>

                            <div className="form-group">
                                <label>Image URL</label>
                                <input
                                    type="text"
                                    name="imageUrl"
                                    value={currentItem.imageUrl}
                                    onChange={handleInputChange}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="form-group">
                                <label className="add-topping-label">
                                    <input
                                        type="checkbox"
                                        name="isAvailable"
                                        checked={currentItem.isAvailable !== false} // Default to true if undefined
                                        onChange={handleInputChange}
                                    />
                                    Available for order
                                </label>
                            </div>

                            {formError && <div className="error-message" style={{ fontSize: '0.9rem' }}>{formError}</div>}

                            <div className="form-actions">
                                <button type="button" className="cancel-btn" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn" disabled={formLoading}>
                                    {formLoading ? 'Saving...' : (isEditing ? 'Update Item' : 'Create Item')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffMenuItemPage;
