import jwt from "jsonwebtoken"; // Add this import at the top
import User from "../models/user.model.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Corrected the JWT verification logic
    const isDecoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!isDecoded) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(isDecoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in authMiddleware:", error.message);
    
    // Handle specific error codes
    if (error.code === "ECONNRESET") {
      return res.status(503).json({ message: "Service Unavailable - Connection Reset" });
    }
    
    res.status(500).json({ message: "Internal Server Error" });
  }
};

