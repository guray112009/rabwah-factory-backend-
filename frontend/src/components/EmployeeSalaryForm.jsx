import React, { useState, useEffect } from "react";
import "../styles/EmployeeSalaryForm.css";

const API_BASE = "http://localhost:5000/api/salaries";

const EmployeeSalaryForm = () => {
  const [employeeForm, setEmployeeForm] = useState({
    name: "",
    jobTitle: "",
    salary: "",
    month: "",
    contact: "",
  });

  const [employees, setEmployees] = useState([]);

  /* ============================================================
     📦 Load salary records from backend (Manager’s data only)
  ============================================================ */
  useEffect(() => {
    const fetchSalaries = async () => {
      try {
        const token =
          localStorage.getItem("rabwah_token") ||
          localStorage.getItem("token") ||
          localStorage.getItem("authToken");

        if (!token) {
          console.warn("⚠️ No token found in localStorage!");
          return;
        }

        const res = await fetch(API_BASE, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("❌ Failed to load salaries:", res.statusText);
          return;
        }

        const data = await res.json();

        // ✅ Handle either an array or an object response
        if (Array.isArray(data)) {
          setEmployees(data);
        } else if (data.salaries) {
          setEmployees(data.salaries);
        } else {
          setEmployees([]);
        }
      } catch (error) {
        console.error("❌ Error fetching salaries:", error);
      }
    };

    fetchSalaries();
  }, []);

  /* ============================================================
     ➕ Add new salary record to backend
  ============================================================ */
  const handleAddEmployee = async (e) => {
    e.preventDefault();

    if (
      !employeeForm.name ||
      !employeeForm.jobTitle ||
      !employeeForm.salary ||
      !employeeForm.month
    ) {
      alert("⚠️ Please fill all required fields.");
      return;
    }

    try {
      const token =
        localStorage.getItem("rabwah_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("authToken");

      if (!token) {
        alert("⚠️ Missing authentication token!");
        return;
      }

      const res = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(employeeForm),
      });

      const data = await res.json();

      if (res.ok) {
        const newSalary =
          data.salary || data.newSalary || data || employeeForm;
        setEmployees((prev) => [newSalary, ...prev]);
        setEmployeeForm({
          name: "",
          jobTitle: "",
          salary: "",
          month: "",
          contact: "",
        });
        alert("✅ Salary record added successfully!");
      } else {
        alert(`❌ Failed to save salary record: ${data.message || "Error"}`);
      }
    } catch (error) {
      console.error("❌ Error adding salary:", error);
      alert("❌ Failed to connect to the server.");
    }
  };

  /* ============================================================
     🗑️ Delete salary record
  ============================================================ */
  const handleDelete = async (id) => {
    if (!window.confirm("🗑️ Delete this salary record?")) return;

    try {
      const token =
        localStorage.getItem("rabwah_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("authToken");

      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setEmployees((prev) => prev.filter((emp) => emp._id !== id));
      } else {
        alert(`❌ Failed to delete record: ${data.message}`);
      }
    } catch (error) {
      console.error("❌ Error deleting record:", error);
      alert("❌ Server error while deleting record.");
    }
  };

  /* ============================================================
     📥 Download CSV file of employee records
  ============================================================ */
  const handleDownloadCSV = () => {
    if (employees.length === 0)
      return alert("⚠️ No records available to export.");

    const csv = [
      ["Name", "Job Title", "Salary", "Month", "Contact"],
      ...employees.map((emp) => [
        emp.name,
        emp.jobTitle,
        `$${emp.salary}`,
        emp.month,
        emp.contact,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "employee_salaries.csv";
    link.click();
  };

  /* ============================================================
     🎨 Render UI
  ============================================================ */
  return (
    <div className="employee-section">
      <h2>👷 Employee Monthly Salary Management</h2>
      <p>Record and track employee salary details for each month.</p>

      <form className="employee-form" onSubmit={handleAddEmployee}>
        <input
          type="text"
          placeholder="Full Name"
          value={employeeForm.name}
          onChange={(e) =>
            setEmployeeForm({ ...employeeForm, name: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Job Title"
          value={employeeForm.jobTitle}
          onChange={(e) =>
            setEmployeeForm({ ...employeeForm, jobTitle: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Salary Amount ($)"
          value={employeeForm.salary}
          onChange={(e) =>
            setEmployeeForm({ ...employeeForm, salary: e.target.value })
          }
        />
        <input
          type="month"
          value={employeeForm.month}
          onChange={(e) =>
            setEmployeeForm({ ...employeeForm, month: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Contact Info (optional)"
          value={employeeForm.contact}
          onChange={(e) =>
            setEmployeeForm({ ...employeeForm, contact: e.target.value })
          }
        />

        <button type="submit" className="add-btn">
          ➕ Add Employee
        </button>
      </form>

      <button className="download-btn" onClick={handleDownloadCSV}>
        ⬇️ Download CSV
      </button>

      <div className="employee-list">
        <h3>📋 Employee Records</h3>
        {employees.length === 0 ? (
          <p style={{ color: "#555", textAlign: "center" }}>
            No employee records yet.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Job Title</th>
                <th>Salary</th>
                <th>Month</th>
                <th>Contact</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp._id}>
                  <td>{emp.name}</td>
                  <td>{emp.jobTitle}</td>
                  <td>${emp.salary}</td>
                  <td>{emp.month}</td>
                  <td>{emp.contact}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(emp._id)}
                      className="delete-btn"
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
    </div>
  );
};

export default EmployeeSalaryForm;
