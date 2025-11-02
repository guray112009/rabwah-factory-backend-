import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/index";
import "../styles/ManagerDashboard.css";
import EmployeeSalaryForm from "../components/EmployeeSalaryForm.jsx";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ManagerDashboard = () => {
  /* =========================
     👥 STATE MANAGEMENT
  ========================== */
  const [staff, setStaff] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  /* =========================
     🔔 ALERTS
  ========================== */
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const showAlert = (message, type = "success") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
  };

  /* =========================
     🧾 USER FORMS
  ========================== */
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "staff",
  });

  /* =========================
     📨 ASSIGN REQUESTS
  ========================== */
  const [assignModal, setAssignModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [assignStaffId, setAssignStaffId] = useState("");

  /* =========================
     🟢 FETCH USERS, TASKS, REQUESTS
  ========================== */
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("rabwah_token");
      try {
        // 🧩 Users
        const userRes = await api.get("/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        let users = [];
        if (Array.isArray(userRes.data)) users = userRes.data;
        else if (Array.isArray(userRes.data.users)) users = userRes.data.users;
        else if (Array.isArray(userRes.data.staff)) users = userRes.data.staff;
        setStaff(users);

        // 🧩 Tasks
        const taskRes = await api.get("/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        let allTasks = [];
        if (Array.isArray(taskRes.data)) allTasks = taskRes.data;
        else if (Array.isArray(taskRes.data.tasks)) allTasks = taskRes.data.tasks;
        setTasks(allTasks);

        // 🧩 Customer Requests
        const customerReqs = allTasks.filter((t) => t.roleType === "customer");
        setRequests(customerReqs);

        // 📊 Chart Data
        const monthlyStats = [
          { month: "Jan", active: 0, inactive: 0, completed: 0, pending: 0 },
          { month: "Feb", active: 0, inactive: 0, completed: 0, pending: 0 },
          { month: "Mar", active: 0, inactive: 0, completed: 0, pending: 0 },
          { month: "Apr", active: 0, inactive: 0, completed: 0, pending: 0 },
          { month: "May", active: 0, inactive: 0, completed: 0, pending: 0 },
          { month: "Jun", active: 0, inactive: 0, completed: 0, pending: 0 },
        ];

        users.forEach((u) => {
          if (u.isActive) monthlyStats[5].active++;
          else monthlyStats[5].inactive++;
        });

        allTasks.forEach((t) => {
          if (t.status === "completed") monthlyStats[5].completed++;
          else monthlyStats[5].pending++;
        });

        setChartData(monthlyStats);
      } catch (error) {
        console.error("Error fetching data:", error);
        showAlert("❌ Failed to load dashboard data.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* =========================
     ➕ ADD / EDIT / DELETE USERS
  ========================== */
  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) {
      showAlert("⚠️ Please fill all required fields.", "error");
      return;
    }

    try {
      const token = localStorage.getItem("rabwah_token");
      const res = await api.post("/users", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newUser = res.data?.user || res.data;
      setStaff((prev) => [...prev, newUser]);
      setShowModal(false);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        role: "staff",
      });
      showAlert("✅ User added successfully!");
    } catch (err) {
      console.error(err);
      showAlert("❌ Failed to add user.", "error");
    }
  };

  const openEditModal = (staffRow) => {
    setSelectedStaff(staffRow);
    setFormData({
      fullName: staffRow.fullName,
      email: staffRow.email,
      phone: staffRow.phone || "",
      password: "",
      role: staffRow.role || "staff",
    });
    setShowEditModal(true);
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    if (!selectedStaff?._id) return showAlert("⚠️ No user selected.", "error");

    try {
      const token = localStorage.getItem("rabwah_token");
      const res = await api.patch(`/users/staff/${selectedStaff._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = res.data?.staff || res.data?.user || formData;
      setStaff((prev) =>
        prev.map((s) => (s._id === selectedStaff._id ? { ...s, ...updated } : s))
      );
      setShowEditModal(false);
      showAlert("✅ User updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      showAlert("❌ Failed to update user.", "error");
    }
  };

  const handleToggle = async (id) => {
    if (!window.confirm("Toggle user status?")) return;
    try {
      const token = localStorage.getItem("rabwah_token");
      const res = await api.patch(
        `/users/staff/${id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = res.data?.staff || {};
      setStaff((prev) =>
        prev.map((s) =>
          s._id === id ? { ...s, isActive: updated.isActive ?? !s.isActive } : s
        )
      );
      showAlert("✅ User status updated!");
    } catch (err) {
      console.error(err);
      showAlert("❌ Failed to toggle user.", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      const token = localStorage.getItem("rabwah_token");
      await api.delete(`/users/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaff((prev) => prev.filter((s) => s._id !== id));
      showAlert("🗑️ User deleted successfully!");
    } catch (err) {
      console.error(err);
      showAlert("❌ Failed to delete user.", "error");
    }
  };

  /* =========================
     📤 ASSIGN CUSTOMER REQUEST → STAFF
  ========================== */
  const handleAssignFromRequest = async () => {
    if (!assignStaffId || !selectedRequest)
      return showAlert("⚠️ Select a staff member.", "error");

    const selectedUser = staff.find((u) => u._id === assignStaffId);
    if (!selectedUser) return showAlert("❌ Invalid staff.", "error");

    try {
      const token = localStorage.getItem("rabwah_token");
      const res = await api.post(
        "/tasks/assign",
        {
          requestId: selectedRequest._id,
          staffId: selectedUser._id,
          staffName: selectedUser.fullName,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data?.task;
      setRequests((prev) =>
        prev.map((r) => (r._id === updated._id ? updated : r))
      );
      setAssignModal(false);
      showAlert("✅ Request assigned successfully!");
    } catch (err) {
      console.error(err);
      showAlert("❌ Failed to assign request.", "error");
    }
  };

  const handleCompleteRequest = async (id) => {
    try {
      const token = localStorage.getItem("rabwah_token");
      await api.patch(
        `/tasks/${id}`,
        { status: "completed" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: "completed" } : r))
      );
      showAlert("✅ Request marked as completed!");
    } catch (err) {
      console.error(err);
      showAlert("❌ Failed to complete request.", "error");
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm("Delete this request?")) return;
    try {
      const token = localStorage.getItem("rabwah_token");
      await api.delete(`/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests((prev) => prev.filter((r) => r._id !== id));
      showAlert("🗑️ Request deleted successfully!");
    } catch (err) {
      console.error(err);
      showAlert("❌ Failed to delete request.", "error");
    }
  };

  /* =========================
     🧱 UI RENDER
  ========================== */
  return (
    <Layout>
      <div className="manager-dashboard">
        {alert.show && (
          <div
            className={`alert-banner ${
              alert.type === "error" ? "error" : "success"
            }`}
          >
            {alert.message}
          </div>
        )}

        {/* HEADER */}
        <div className="manager-header">
          <h1>👋 Welcome, Manager!</h1>
          <p>Manage staff, customer requests, and assigned tasks efficiently.</p>
        </div>

        {/* 📩 CUSTOMER REQUESTS */}
        <section className="manager-section">
          <h2>📩 Customer Requests</h2>
          {requests.length > 0 ? (
            <table className="task-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r._id}>
                    <td>{r.customerName}</td>
                    <td>{r.title}</td>
                    <td>{r.description || "—"}</td>
                    <td>
                      {r.dueDate
                        ? new Date(r.dueDate).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>{r.status}</td>
                    <td>
                      <button
                        className="assign-btn"
                        onClick={() => {
                          setSelectedRequest(r);
                          setAssignModal(true);
                        }}
                      >
                        📤 Assign to Staff
                      </button>
                      {r.status !== "completed" && (
                        <button
                          className="complete-btn"
                          onClick={() => handleCompleteRequest(r._id)}
                        >
                          ✅ Done
                        </button>
                      )}
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteRequest(r._id)}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No customer requests yet.</p>
          )}
        </section>

        {/* 🔄 ASSIGN REQUEST MODAL */}
        {assignModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>📤 Assign Request to Staff</h3>
              <p>
                <strong>Request:</strong> {selectedRequest?.title}
              </p>
              <select
                value={assignStaffId}
                onChange={(e) => setAssignStaffId(e.target.value)}
              >
                <option value="">Select Staff Member</option>
                {staff
                  .filter((u) => u.role === "staff" && (u.isActive ?? true))
                  .map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.fullName}
                    </option>
                  ))}
              </select>
              <div className="modal-buttons">
                <button className="save-btn" onClick={handleAssignFromRequest}>
                  💾 Assign
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setAssignModal(false)}
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 👥 USER LIST */}
        <div className="staff-section">
          <div className="staff-header">
            <h2>👥 User List</h2>
            <button
              className="add-btn"
              onClick={() => {
                setShowModal(true);
                setFormData({
                  fullName: "",
                  email: "",
                  phone: "",
                  password: "",
                  role: "staff",
                });
              }}
            >
              ➕ Add New User
            </button>
          </div>
          {loading ? (
            <p>Loading users...</p>
          ) : staff.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <table className="staff-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s._id}>
                    <td>{s.fullName}</td>
                    <td>{s.email}</td>
                    <td className={`role-badge ${s.role}`}>
                      {s.role.charAt(0).toUpperCase() + s.role.slice(1)}
                    </td>
                    <td>{s.phone || "—"}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          s.isActive ? "active" : "inactive"
                        }`}
                      >
                        {s.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => openEditModal(s)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="toggle-btn"
                        onClick={() => handleToggle(s._id)}
                      >
                        {s.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(s._id)}
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

        {/* ✏️ EDIT / ADD MODALS */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>➕ Add New User</h3>
              <form onSubmit={handleAddStaff}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="staff">Staff</option>
                  <option value="customer">Customer</option>
                </select>
                <div className="modal-buttons">
                  <button type="submit" className="save-btn">
                    💾 Save
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowModal(false)}
                  >
                    ❌ Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>✏️ Edit User</h3>
              <form onSubmit={handleUpdateStaff}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
                <input
                  type="password"
                  placeholder="New Password (optional)"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="staff">Staff</option>
                  <option value="customer">Customer</option>
                </select>
                <div className="modal-buttons">
                  <button type="submit" className="save-btn">
                    💾 Update
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowEditModal(false)}
                  >
                    ❌ Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 📊 CHARTS */}
        <section className="chart-section">
          <div className="chart-card">
            <h3>📈 Monthly Active vs Inactive</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="active" fill="#007a33" />
                <Bar dataKey="inactive" fill="#b50000" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>💼 Tasks Completed per Month</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#007a33" />
                <Bar dataKey="pending" fill="#f4c542" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 💰 EMPLOYEE SALARY FORM */}
        <div className="salary-section" style={{ marginTop: "40px" }}>
          <EmployeeSalaryForm />
        </div>
      </div>
    </Layout>
  );
};

export default ManagerDashboard;
