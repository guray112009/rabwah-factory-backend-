import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import "../styles/AdminDashboard.css";
import api from "../api/index";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [newExpense, setNewExpense] = useState({
    category: "Daily",
    title: "",
    amount: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  /* 🌿 Load user info from localStorage */
  useEffect(() => {
    const storedUser = localStorage.getItem("rabwah_user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  /* ⚙️ Fetch admin statistics */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/users/admin-stats");
        setStats(res.data);
      } catch (err) {
        console.error("❌ Error fetching admin stats:", err);
        setError("Failed to load dashboard stats. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  /* 👥 Fetch all users */
  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data.users || res.data.staff || []);
    } catch (err) {
      console.error("❌ Error loading users:", err);
      showAlert("Failed to load users.", "error");
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  /* 💰 Fetch all expenses */
  const fetchExpenses = async () => {
    try {
      const res = await api.get("/expenses");
      setExpenses(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching expenses:", err);
    }
  };
  useEffect(() => {
    fetchExpenses();
  }, []);

  /* 👷 Fetch all employees (used by Manager only) */
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get("/employees");
        setEmployees(res.data || []);
      } catch (err) {
        console.error("❌ Error fetching employees:", err);
      }
    };
    fetchEmployees();
  }, []);

  /* 💵 Add new expense */
  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post("/expenses", newExpense);
      showAlert("✅ Expense added successfully!");
      setNewExpense({ category: "Daily", title: "", amount: "", description: "" });
      fetchExpenses();
    } catch (err) {
      console.error("❌ Failed to add expense:", err);
      showAlert("Failed to add expense.", "error");
    }
  };

  /* 🗑️ Delete Expense */
  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses((prev) => prev.filter((exp) => exp._id !== id));
      showAlert("🗑️ Expense deleted successfully!");
    } catch (err) {
      console.error("❌ Failed to delete expense:", err);
      showAlert("Failed to delete expense.", "error");
    }
  };

  /* 📤 Export monthly CSV */
  const handleExportCSV = async () => {
    try {
      const res = await api.get("/expenses/export", { responseType: "blob" });
      const blob = new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "monthly_expenses.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("❌ Error exporting CSV:", err);
      showAlert("Failed to export CSV.", "error");
    }
  };

  /* 🗑️ Delete user */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/users/staff/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      showAlert("🗑️ User deleted successfully.", "success");
    } catch (err) {
      console.error("❌ Error deleting user:", err);
      showAlert("Failed to delete user.", "error");
    }
  };

  /* 🔄 Toggle user active/inactive */
  const toggleUser = async (id) => {
    try {
      const res = await api.patch(`/users/staff/${id}/toggle`);
      const updated = res.data.staff || res.data.user;
      setUsers((prev) =>
        prev.map((u) =>
          u._id === id ? { ...u, isActive: updated?.isActive ?? !u.isActive } : u
        )
      );
      showAlert(
        updated?.isActive
          ? "✅ User activated successfully!"
          : "⚠️ User deactivated.",
        "success"
      );
    } catch (err) {
      console.error("❌ Error toggling user:", err);
      showAlert("Failed to update user status.", "error");
    }
  };

  /* ✏️ Edit user */
  const handleEdit = (user) => {
    setEditUser(user);
    setShowModal(true);
  };

  /* ➕ Add / Edit user */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const newUser = {
      fullName: form.name.value.trim(),
      email: form.email.value.trim().toLowerCase(),
      role: form.role.value.toLowerCase(),
      phone: form.phone?.value || "",
      password: form.password?.value || "",
    };

    try {
      if (editUser) {
        await api.patch(`/users/staff/${editUser._id}`, newUser);
        setUsers((prev) =>
          prev.map((u) => (u._id === editUser._id ? { ...u, ...newUser } : u))
        );
        showAlert("✏️ User updated successfully!");
      } else {
        await api.post("/users", { ...newUser, password: "password123" });
        await fetchUsers();
        showAlert("✅ New user added successfully!");
      }
      setShowModal(false);
      setEditUser(null);
    } catch (err) {
      console.error("❌ Error saving user:", err.response?.data || err);
      showAlert(err.response?.data?.message || "Failed to save user.", "error");
    }
  };

  /* 🔔 Alert helper */
  const showAlert = (message, type = "success") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
  };

  /* 🧭 Render Dashboard */
  if (loading)
    return (
      <Layout>
        <div className="admin-dashboard">
          <p className="loading-text">Loading your admin dashboard...</p>
        </div>
      </Layout>
    );

  if (error)
    return (
      <Layout>
        <div className="admin-dashboard">
          <p className="error-text">{error}</p>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="admin-dashboard">
        {/* 🌿 Header */}
        <div className="admin-card">
          <h1>👋 Welcome, {user?.fullName || "Rabwah Admin"}!</h1>
          <p>
            You are logged in as <strong>{user?.role || "Administrator"}</strong>.
          </p>

          <div className="admin-stats">
            <h3>📈 Live System Statistics</h3>
            <ul>
              <li><strong>Total Users:</strong> {stats.totalUsers ?? "—"}</li>
              <li><strong>Managers:</strong> {stats.managers ?? "—"}</li>
              <li><strong>Staff:</strong> {stats.staff ?? "—"}</li>
              <li><strong>Customers:</strong> {stats.customers ?? "—"}</li>
              <li><strong>System Uptime:</strong> {stats.uptime ?? "—"}</li>
            </ul>
          </div>
        </div>

        {/* 👥 User Management */}
        <div className="staff-section">
          <div className="staff-header">
            <h2>👥 User Management</h2>
            <button
              className="add-btn"
              onClick={() => {
                setEditUser(null);
                setShowModal(true);
              }}
            >
              + Add New User
            </button>
          </div>

          {alert.show && (
            <div className={`alert-banner ${alert.type === "error" ? "error" : "success"}`}>
              {alert.message}
            </div>
          )}

          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <table className="staff-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td className={`role-badge ${user.role}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          user.isActive ? "active" : "inactive"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button className="edit-btn" onClick={() => handleEdit(user)}>
                        ✏️ Edit
                      </button>
                      <button
                        className={`toggle-btn ${
                          user.isActive ? "deactivate" : "activate"
                        }`}
                        onClick={() => toggleUser(user._id)}
                      >
                        {user.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(user._id)}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 💰 Expense Section */}
        <div className="expense-section">
          <h2>💰 Business Expenses</h2>
          <form className="expense-form" onSubmit={handleAddExpense}>
            <select
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
            <input
              type="text"
              placeholder="Expense Title"
              value={newExpense.title}
              onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Amount"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
            />
            <button type="submit" className="add-btn">
              ➕ Add Expense
            </button>
          </form>

          <table className="expense-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Title</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr><td colSpan="5">No expenses added yet.</td></tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp._id}>
                    <td>{exp.category}</td>
                    <td>{exp.title}</td>
                    <td>${exp.amount}</td>
                    <td>{new Date(exp.date).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="delete-expense-btn"
                        onClick={() => handleDeleteExpense(exp._id)}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {expenses.length > 0 && (
            <div className="expense-total">
              <strong>
                💵 Total Monthly Expense: $
                {expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0).toFixed(2)}
              </strong>
            </div>
          )}

          <button onClick={handleExportCSV} className="export-btn">
            📤 Export Monthly CSV
          </button>
        </div>

        {/* 👷 Employee Management Section — MANAGER ONLY */}
        {user?.role === "manager" && (
          <div className="employee-section">
            <h2>👷 Employee Management</h2>
            {/* ✅ Your full employee form and table goes here exactly as before */}
          </div>
        )}

        {/* 🪄 Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>{editUser ? "Edit User" : "Add New User"}</h3>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  defaultValue={editUser?.fullName || ""}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  defaultValue={editUser?.email || ""}
                  required
                />
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone (optional)"
                  defaultValue={editUser?.phone || ""}
                />
                <input
                  type="password"
                  name="password"
                  placeholder="New Password (optional)"
                />
                <select name="role" defaultValue={editUser?.role || "staff"}>
                  <option value="staff">Staff</option>
                  <option value="customer">Customer</option>
                </select>

                <div className="modal-actions">
                  <button type="submit" className="save-btn">Save</button>
                  <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
