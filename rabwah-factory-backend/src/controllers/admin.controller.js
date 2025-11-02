import User from "../models/User.js";
import Customer from "../models/Customer.js";

export const getAdminStats = async (req, res) => {
  try {
    // 🧮 Collect system statistics
    const totalStaff = await User.countDocuments();
    const totalCustomers = await Customer.countDocuments();

    const totalBags = 10450; // You can later make this dynamic
    const ecoImpact = 3280;  // Example static metric

    // 🕒 Calculate system uptime
    const uptimeSeconds = process.uptime();
    const uptimeHours = Math.floor(uptimeSeconds / 3600);
    const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);
    const formattedUptime = `${uptimeHours}h ${uptimeMinutes}m`;

    // ✅ Send response
    res.status(200).json({
      success: true,
      data: {
        totalBags,
        totalStaff,
        totalOrders: totalCustomers,
        ecoImpact,
        systemUptime: formattedUptime, // ✅ Added field
      },
    });
  } catch (error) {
    console.error("❌ Error fetching admin stats:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching admin stats",
    });
  }
};
