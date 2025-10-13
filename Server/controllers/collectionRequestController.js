const CollectionRequest = require("../models/CollectionRequest");
const User = require("../models/User"); // assuming you have this

/**
 * Schedule a special waste collection
 */
exports.scheduleCollection = async (req, res) => {
  try {
    const {
      userId,
      requestType = "special",
      wasteCategory,
      scheduledDate,
      quantity,
      scheduledTime,
      pickupLocation,
      notes,
      weight,
    } = req.body;

    // Validate required fields
    if (!userId || !wasteCategory || !scheduledDate || !scheduledTime) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Step 4: Check if the slot is available
    const existing = await CollectionRequest.findOne({
      scheduledDate,
      scheduledTime,
      status: { $ne: "cancelled" },
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Preferred date/time not available. Please choose another slot." });
    }

    // Create new collection request
    const newRequest = new CollectionRequest({
      userId,
      requestType,
      wasteCategory,
      scheduledDate,
      quantity,
      scheduledTime,
      pickupLocation,
      notes,
      weight,
    });

    // Step 5: Calculate estimated cost
    newRequest.calculateCost();

    await newRequest.save();

    // Step 7: Notify assigned collector (simulated)
    console.log(
      `Collector notified for ${wasteCategory} pickup on ${scheduledDate} at ${scheduledTime}`
    );

    res.status(201).json({
      message: "Special waste collection scheduled successfully!",
      request: newRequest,
    });
  } catch (error) {
    console.error("Error scheduling collection:", error);
    res.status(500).json({
      message: "Server error while scheduling collection. Please try again later.",
      error: error.message,
    });
  }
};

/**
 * Get all collection requests for a specific user
 */
exports.getUserCollections = async (req, res) => {
  try {
    const { userId } = req.params;
    const requests = await CollectionRequest.find({ userId }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user collections", error: error.message });
  }
};

/**
 * Cancel a collection request
 */
exports.cancelCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const request = await CollectionRequest.findById(id);
    if (!request) return res.status(404).json({ message: "Collection request not found." });

    request.status = "cancelled";
    request.cancellationReason = reason || "User cancelled.";
    request.cancelledAt = new Date();

    await request.save();

    res.json({ message: "Collection request cancelled successfully.", request });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling collection", error: error.message });
  }
};

/**
 * (Optional) Admin or Collector confirms the request
 */
exports.confirmCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { collectorId } = req.body;

    const request = await CollectionRequest.findById(id);
    if (!request) return res.status(404).json({ message: "Request not found." });

    request.status = "confirmed";
    request.assignedCollector = collectorId;
    await request.save();

    res.json({ message: "Collection confirmed and collector assigned.", request });
  } catch (error) {
    res.status(500).json({ message: "Error confirming collection", error: error.message });
  }
};

/**
 * Update collection request status
 */
exports.updateCollectionStatus = async (req, res) => {
  try {
    const { id } = req.params; // request ID
    const { status } = req.body; // new status value from frontend

    // Validate status input
    const validStatuses = [
      "pending",
      "confirmed",
      "assigned",
      "in-progress",
      "completed",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Find and update the request
    const request = await CollectionRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Collection request not found." });
    }

    // Update status
    request.status = status;

    // Optional: update timestamps for certain statuses
    if (status === "completed") request.completedAt = new Date();
    if (status === "in-progress") request.startedAt = new Date();
    if (status === "cancelled") request.cancelledAt = new Date();

    await request.save();

    res.json({
      message: `Collection request status updated to '${status}'.`,
      request,
    });
  } catch (error) {
    console.error("Error updating collection status:", error);
    res.status(500).json({
      message: "Server error while updating collection status.",
      error: error.message,
    });
  }
};
