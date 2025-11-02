import api from "./index";

// 🧾 Get all tasks (Admin/Manager)
export const getAllTasks = async () => {
  const res = await api.get("/tasks");
  return res.data;
};

// 👤 Get customer’s own tasks
export const getMyTasks = async () => {
  const res = await api.get("/tasks/my");
  return res.data;
};

// ➕ Assign new task (Admin/Manager)
export const assignTask = async (taskData) => {
  const res = await api.post("/tasks", taskData);
  return res.data;
};

// ✏️ Update task (status or description)
export const updateTask = async (id, updates) => {
  const res = await api.patch(`/tasks/${id}`, updates);
  return res.data;
};

// 🗑️ Delete task (Admin/Manager)
export const deleteTask = async (id) => {
  const res = await api.delete(`/tasks/${id}`);
  return res.data;
};
