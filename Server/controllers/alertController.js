const Alert = require("../models/Alert");

// Create a new alert
exports.createAlert = async (req, res) => {
  try {
    const {
      binId,
      location,
      latitude,
      longitude,
      severity,
      type,
      description,
      assignedTo,
      assignedToId,
      notes,
      binCapacity,
    } = req.body;

    // Validation
    if (!binId || !location || !severity || !type || !description) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: binId, location, severity, type, and description",
      });
    }

    // Create new alert
    const alert = new Alert({
      binId,
      location,
      latitude,
      longitude,
      severity,
      type,
      description,
      assignedTo,
      assignedToId,
      createdBy: req.user?._id,
      notes,
      binCapacity,
      status: "Open",
    });

    await alert.save();

    res.status(201).json({
      success: true,
      message: "Alert created successfully",
      alert,
    });
  } catch (error) {
    console.error("Error creating alert:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create alert",
      error: error.message,
    });
  }
};

// Get all alerts with optional filtering
exports.getAllAlerts = async (req, res) => {
  try {
    const { severity, status, type, search, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = {};

    if (severity && severity !== "all") {
      filter.severity = severity;
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    if (type && type !== "all") {
      filter.type = type;
    }

    if (search) {
      filter.$or = [
        { alertId: { $regex: search, $options: "i" } },
        { binId: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { assignedTo: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get alerts with pagination
    const alerts = await Alert.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("createdBy", "name email")
      .populate("assignedToId", "name email")
      .populate("resolvedBy", "name email");

    // Get total count for pagination
    const total = await Alert.countDocuments(filter);

    res.status(200).json({
      success: true,
      alerts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch alerts",
      error: error.message,
    });
  }
};

// Get alert by ID
exports.getAlertById = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await Alert.findById(id)
      .populate("createdBy", "name email")
      .populate("assignedToId", "name email")
      .populate("resolvedBy", "name email");

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    res.status(200).json({
      success: true,
      alert,
    });
  } catch (error) {
    console.error("Error fetching alert:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch alert",
      error: error.message,
    });
  }
};

// Update alert
exports.updateAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const alert = await Alert.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Alert updated successfully",
      alert,
    });
  } catch (error) {
    console.error("Error updating alert:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update alert",
      error: error.message,
    });
  }
};

// Update alert status
exports.updateAlertStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const updateData = { status };

    if (notes) {
      updateData.notes = notes;
    }

    // If status is Resolved or Closed, set resolvedAt and resolvedBy
    if (status === "Resolved" || status === "Closed") {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = req.user?._id;
    }

    const alert = await Alert.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Alert status updated successfully",
      alert,
    });
  } catch (error) {
    console.error("Error updating alert status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update alert status",
      error: error.message,
    });
  }
};

// Delete alert
exports.deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await Alert.findByIdAndDelete(id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Alert deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting alert:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete alert",
      error: error.message,
    });
  }
};

// Get alert statistics
exports.getAlertStatistics = async (req, res) => {
  try {
    const stats = await Alert.aggregate([
      {
        $group: {
          _id: "$severity",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusStats = await Alert.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const typeStats = await Alert.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      statistics: {
        bySeverity: stats,
        byStatus: statusStats,
        byType: typeStats,
      },
    });
  } catch (error) {
    console.error("Error fetching alert statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch alert statistics",
      error: error.message,
    });
  }
};

