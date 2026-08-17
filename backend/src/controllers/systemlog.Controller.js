import SystemLog from "../models/adminModels/SystemLog.js";

export const getSystemLogs = async (req, res) => {
  try {

    const logs = await SystemLog
      .find()
      .populate("performedBy", "name email role")
      .sort({ createdAt: -1 });

    res.json(logs);

  } catch (err) {
    res.status(500).json({
      message: "Failed to load logs",
    });
  }
};
