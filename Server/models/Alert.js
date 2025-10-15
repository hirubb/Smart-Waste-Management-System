const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    alertId: {
      type: String,
      unique: true,
    },
    binId: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    severity: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    type: {
      type: String,
      enum: [
        "Bin Full",
        "Maintenance Required",
        "Odor Detection",
        "Fire Hazard",
        "Temperature Alert",
        "Contamination",
        "Sensor Malfunction",
        "Damage Reported",
        "Other",
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    assignedTo: {
      type: String,
    },
    assignedToId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    notes: {
      type: String,
    },
    binCapacity: {
      type: Number,
      min: 0,
      max: 100,
    },
    priority: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Generate alert ID before saving
alertSchema.pre("save", async function (next) {
  try {
    if (!this.alertId) {
      // Find the highest alert ID and increment
      const lastAlert = await mongoose.model("Alert").findOne().sort({ createdAt: -1 }).select('alertId');
      
      if (lastAlert && lastAlert.alertId) {
        // Extract number from last alert ID (e.g., "ALT-001" -> 1)
        const lastNumber = parseInt(lastAlert.alertId.split('-')[1]);
        this.alertId = `ALT-${String(lastNumber + 1).padStart(3, "0")}`;
      } else {
        // First alert
        this.alertId = "ALT-001";
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Alert", alertSchema);
