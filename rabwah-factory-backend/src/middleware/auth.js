import jwt from "jsonwebtoken";

/* ===========================================================
   🔐 Verify Token Middleware
   -----------------------------------------------------------
   Ensures only authenticated users can access protected routes.
   Works for Admin, Manager, Staff, Customer, etc.
   =========================================================== */
export const verifyToken = (req, res, next) => {
  // 🧩 Log incoming token for debugging
  console.log("🔐 Incoming Auth Header:", req.headers.authorization);

  // ✅ Extract Bearer token
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  // 🚫 If token missing
  if (!token) {
    console.warn("⚠️ No token provided.");
    return res.status(401).json({ message: "Unauthorized: missing token" });
  }

  try {
    // ✅ Verify JWT using your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔍 Normalize role (prevent 'Admin' vs 'admin' mismatch)
    if (decoded.role) {
      decoded.role = decoded.role.toLowerCase();
    }

    // ✅ Attach decoded user info to request
    req.user = decoded;

    // 🧠 Log who is authenticated
    console.log("✅ Token verified successfully:", decoded);

    // ✅ Continue to next middleware or route
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    return res.status(401).json({ message: "Unauthorized: invalid token" });
  }
};
