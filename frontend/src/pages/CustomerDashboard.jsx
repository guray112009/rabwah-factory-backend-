// src/pages/CustomerDashboard.jsx
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import "../styles/CustomerDashboard.css";
import api from "../api/index";

const CustomerDashboard = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [newOrder, setNewOrder] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const token = localStorage.getItem("rabwah_token");
        const profileRes = await api.get("/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(profileRes.data);

        const orderRes = await api.get("/tasks/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(orderRes.data || []);
      } catch (err) {
        console.error("❌ Failed to load orders:", err);
        showAlert("Failed to load your requests.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchUserOrders();
  }, []);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!newOrder.title || !newOrder.description || !newOrder.dueDate) {
      return showAlert("⚠️ Please fill in all fields.", "error");
    }

    try {
      const token = localStorage.getItem("rabwah_token");
      await api.post(
        "/tasks",
        {
          customerId: user._id,
          title: newOrder.title,
          description: newOrder.description,
          dueDate: newOrder.dueDate,
          roleType: "customer",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showAlert("✅ Request sent to manager successfully!");
      setNewOrder({ title: "", description: "", dueDate: "" });

      // refresh order list
      const res = await api.get("/tasks/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data || []);
    } catch (err) {
      console.error("❌ Error submitting request:", err);
      showAlert("Failed to send request.", "error");
    }
  };

  const showAlert = (message, type = "success") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
  };

  return (
    <Layout>
      <div className="customer-dashboard">
        {alert.show && (
          <div
            className={`alert-banner ${
              alert.type === "error" ? "error" : "success"
            }`}
          >
            {alert.message}
          </div>
        )}

        <div className="customer-header">
          <h1>📦 Welcome, {user?.fullName || "Customer"}!</h1>
          <p>Submit a service request or order directly to your manager.</p>
        </div>

        {/* 🧾 Request Form */}
        <div className="order-form-container">
          <h2>📝 Submit a Request</h2>
          <form onSubmit={handleSubmitOrder} className="order-form">
            <input
              type="text"
              placeholder="Request Title (e.g. Order new eco bags)"
              value={newOrder.title}
              onChange={(e) =>
                setNewOrder({ ...newOrder, title: e.target.value })
              }
            />
            <textarea
              placeholder="Describe your request..."
              value={newOrder.description}
              onChange={(e) =>
                setNewOrder({ ...newOrder, description: e.target.value })
              }
            />
            <input
              type="date"
              value={newOrder.dueDate}
              onChange={(e) =>
                setNewOrder({ ...newOrder, dueDate: e.target.value })
              }
            />
            <button type="submit" className="btn submit-btn">
              🚀 Send Request
            </button>
          </form>
        </div>

        {/* 📋 Order History */}
        <div className="task-container">
          <h2>📋 My Requests</h2>
          {loading ? (
            <p className="loading-text">Loading your requests...</p>
          ) : orders.length === 0 ? (
            <p className="empty-state">No requests submitted yet.</p>
          ) : (
            <table className="task-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.title}</td>
                    <td>{order.description}</td>
                    <td>
                      {order.dueDate
                        ? new Date(order.dueDate).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          order.status === "completed" ? "done" : "pending"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CustomerDashboard;
