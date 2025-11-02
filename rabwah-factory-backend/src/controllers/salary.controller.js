import Salary from "../models/salary.model.js";

/* ============================================================
   ➕ Add a New Salary Record
   ------------------------------------------------------------
   - Validates manager from JWT (req.user.id)
   - Creates a new salary record in MongoDB
   - Returns saved salary with success message
   ============================================================ */
export const addSalary = async (req, res) => {
  try {
    // ✅ Create a new salary entry associated with the logged-in manager
    const newSalary = new Salary({
      ...req.body,
      managerId: req.user.id, // From verifyToken middleware
    });

    await newSalary.save();

    res.status(201).json({
      success: true,
      message: "✅ Salary record added successfully!",
      salary: newSalary,
    });
  } catch (error) {
    console.error("❌ Error adding salary:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding salary record.",
      error: error.message,
    });
  }
};

/* ============================================================
   📋 Get All Salaries (Only for Logged-In Manager)
   ------------------------------------------------------------
   - Finds salary records linked to the manager ID in JWT
   - Sorted by newest first
   ============================================================ */
export const getSalaries = async (req, res) => {
  try {
    const managerId = req.user.id; // Extracted from JWT

    const salaries = await Salary.find({ managerId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: salaries.length,
      salaries,
    });
  } catch (error) {
    console.error("❌ Error fetching salaries:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching salary records.",
      error: error.message,
    });
  }
};

/* ============================================================
   🗑️ Delete Salary Record
   ------------------------------------------------------------
   - Deletes a salary record by ID
   - Ensures only existing records are removed
   ============================================================ */
export const deleteSalary = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Salary.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Salary record not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "🗑️ Salary record deleted successfully!",
    });
  } catch (error) {
    console.error("❌ Error deleting salary:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting salary record.",
      error: error.message,
    });
  }
};
