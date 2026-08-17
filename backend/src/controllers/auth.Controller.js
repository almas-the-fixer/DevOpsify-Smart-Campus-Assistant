import User from "../models/adminModels/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {

  const { email, password } = req.body;

  const user = await User.findOne({ email });

  const isMatch = await bcrypt.compare(password, user.password);
 
  if (!user) return res.status(404).json({ message: "User not found" });

  if (!user.isActive)
    return res.status(403).json({ message: "User blocked" });

  if (!isMatch)
    return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isFirstLogin: user.isFirstLogin, // 🔥 REQUIRED
      isActive: user.isActive,
    },
  });
};

