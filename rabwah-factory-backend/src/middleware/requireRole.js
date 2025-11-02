// src/middleware/requireRole.js
import { ROLES } from "../constants/roles.js";

/**
 * ✅ Role-based access control middleware
 * Usage: requireRole(ROLES.ADMIN, ROLES.MANAGER)
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure user is authenticated
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized: no user context" });
    }

    const userRole = req.user.role.toLowerCase(); // normalize
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());

    // Debugging
    console.log("🔐 Checking role:", userRole, "→ allowed:", normalizedAllowed);

    if (!normalizedAllowed.includes(userRole)) {
      return res
        .status(403)
        .json({ message: "You don't have permission to perform this action." });
    }

    next();
  };
};
