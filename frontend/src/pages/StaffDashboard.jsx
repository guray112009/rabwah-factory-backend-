// src/pages/StaffDashboard.jsx
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import "../styles/StaffDashboard.css"; // ✅ new style file
import api from "../api/index";

const StaffDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("rabwah_token");
        if (!token) return;

        // 👤 Fetch user info
        const userRes = await api.get("/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);

        // 🧾 Fetch tasks
        const taskRes = await api.get("/tasks/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(taskRes.data || []);
      } catch (err) {
        console.error("❌ Error fetching staff dashboard:", err);
        showAlert("Failed to load your tasks. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleComplete = async (id) => {
    if (!window.confirm("Mark this task as completed?")) return;
    try {
      const token = localStorage.getItem("rabwah_token");
      await api.patch(
        `/tasks/${id}`,
        { status: "completed" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status: "completed" } : t))
      );
      showAlert("✅ Task marked as completed!");
    } catch (err) {
      console.error(err);
      showAlert("Failed to update task status.", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const token = localStorage.getItem("rabwah_token");
      await api.delete(`/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.filter((t) => t._id !== id));
      showAlert("🗑️ Task deleted successfully.");
    } catch (err) {
      console.error(err);
      showAlert("Failed to delete task.", "error");
    }
  };

  const showAlert = (message, type = "success") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
  };

  return (
    <Layout>
      <div className="staff-dashboard">
        {alert.show && (
          <div
            className={`alert-banner ${
              alert.type === "error" ? "error" : "success"
            }`}
          >
            {alert.message}
          </div>
        )}

        <div className="staff-header">
          <h1>👷 Welcome, {user?.fullName || "Staff Member"}!</h1>
          <p>Your assigned tasks from your manager are listed below.</p>
        </div>

        {loading ? (
          <p className="loading-text">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks assigned yet.</p>
          </div>
        ) : (
          <div className="task-container">
            <table className="task-table">
              <thead>
                <tr>
                  <th>🧾 Task</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id}>
                    <td>{task.title}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          task.status === "completed" ? "done" : "pending"
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td>
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="action-buttons">
                      {task.status !== "completed" && (
                        <button
                          className="btn complete-btn"
                          onClick={() => handleComplete(task._id)}
                        >
                          ✅ Complete
                        </button>
                      )}
                      <button
                        className="btn delete-btn"
                        onClick={() => handleDelete(task._id)}
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StaffDashboard;
