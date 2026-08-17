import jwt from "jsonwebtoken";
import User from "../models/adminModels/User.js";


// 🔐 Verify JWT token
export const verifyToken = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 Fetch full user from DB
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach full user
    req.user = user;

    next();

  } catch (err) {

    console.error("Auth Error:", err);

    return res.status(401).json({ message: "Invalid token" });
  }
};


// 👑 Admin-only access
export const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};


export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};


export default verifyToken;
