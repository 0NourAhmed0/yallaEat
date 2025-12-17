import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/AdminUsers.css";

const emptyStaffForm = { name: "", email: "", password: "" };
const emptyEditForm = { id: null, name: "", email: "" };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [staffForm, setStaffForm] = useState(emptyStaffForm);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("http://localhost:3000/api/users/users", {
        withCredentials: true,
      });
      setUsers(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.email || !staffForm.password) {
      setError("Name, email, and password are required to add staff");
      return;
    }
    try {
      setSaving(true);
      setError("");
      await axios.post("http://localhost:3000/api/users/staff", staffForm, {
        withCredentials: true,
      });
      setStaffForm(emptyStaffForm);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add staff");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (user) => {
    setEditForm({ id: user._id, name: user.name || "", email: user.email || "" });
  };

  const cancelEdit = () => setEditForm(emptyEditForm);

  const handleUpdateStaff = async () => {
    if (!editForm.id) return;
    if (!editForm.name || !editForm.email) {
      setError("Name and email are required to update staff");
      return;
    }
    try {
      setSaving(true);
      setError("");
      await axios.put(
        `http://localhost:3000/api/users/staff/${editForm.id}`,
        { name: editForm.name, email: editForm.email },
        { withCredentials: true }
      );
      setEditForm(emptyEditForm);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update staff");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm("Delete this staff account?")) return;
    try {
      setSaving(true);
      setError("");
      await axios.delete(`http://localhost:3000/api/users/staff/${id}`, {
        withCredentials: true,
      });
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete staff");
    } finally {
      setSaving(false);
    }
  };

  const handleDisableCustomer = async (id) => {
    if (!window.confirm("Disable this customer account?")) return;
    try {
      setSaving(true);
      setError("");
      await axios.put(`http://localhost:3000/api/users/disable-customer/${id}`, {}, {
        withCredentials: true,
      });
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to disable customer");
    } finally {
      setSaving(false);
    }
  };

  const handleEnableCustomer = async (id) => {
    if (!window.confirm("Enable this customer account?")) return;
    try {
      setSaving(true);
      setError("");
      await axios.put(`http://localhost:3000/api/users/enable-customer/${id}`, {}, {
        withCredentials: true,
      });
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to enable customer");
    } finally {
      setSaving(false);
    }
  };

  const staff = users.filter((u) => u.role === "staff");
  const customers = users.filter((u) => u.role === "customer");

  return (
    <div className="admin-users-page">
      <div className="admin-users-header">
        <div>
          <h1>User Management</h1>
          <p>Admin-only: manage staff accounts and disable customer accounts.</p>
        </div>
        <button className="refresh-btn" onClick={fetchUsers} disabled={loading}>
          Refresh
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      <section className="panel">
        <h2>Add Staff</h2>
        <form className="inline-form" onSubmit={handleAddStaff}>
          <input
            type="text"
            placeholder="Name"
            value={staffForm.name}
            onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            value={staffForm.email}
            onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={staffForm.password}
            onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
          />
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Add Staff"}
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>Staff Accounts</h2>
        {loading ? (
          <p>Loading staff...</p>
        ) : staff.length === 0 ? (
          <p>No staff accounts found.</p>
        ) : (
          <div className="list">
            {staff.map((user) => (
              <div key={user._id} className="list-row">
                {editForm.id === user._id ? (
                  <>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                    <div className="actions">
                      <button onClick={handleUpdateStaff} disabled={saving}>
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button className="secondary" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="primary-text">{user.name || "(no name)"}</div>
                      <div className="muted">{user.email}</div>
                    </div>
                    <div className="actions">
                      <button onClick={() => startEdit(user)}>Edit</button>
                      <button className="danger" onClick={() => handleDeleteStaff(user._id)} disabled={saving}>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <h2>Customers</h2>
        {loading ? (
          <p>Loading customers...</p>
        ) : customers.length === 0 ? (
          <p>No customers found.</p>
        ) : (
          <div className="list">
            {customers.map((user) => (
              <div key={user._id} className="list-row">
                <div>
                  <div className="primary-text">{user.name || "(no name)"}</div>
                  <div className="muted">{user.email}</div>
                  <div className="tag">{user.disabled ? "Disabled" : "Active"}</div>
                </div>
                <div className="actions">
                  {user.disabled ? (
                    <button
                      className="success"
                      onClick={() => handleEnableCustomer(user._id)}
                      disabled={saving}
                    >
                      Enable
                    </button>
                  ) : (
                    <button
                      className="danger"
                      onClick={() => handleDisableCustomer(user._id)}
                      disabled={saving}
                    >
                      Disable
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
