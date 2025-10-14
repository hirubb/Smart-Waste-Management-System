const express = require("express");
const router = express.Router();
const {
  createAlert,
  getAllAlerts,
  getAlertById,
  updateAlert,
  updateAlertStatus,
  deleteAlert,
  getAlertStatistics,
} = require("../controllers/alertController");

// Public routes (or add auth middleware as needed)
router.post("/", createAlert);
router.get("/", getAllAlerts);
router.get("/statistics", getAlertStatistics);
router.get("/:id", getAlertById);
router.put("/:id", updateAlert);
router.patch("/:id/status", updateAlertStatus);
router.delete("/:id", deleteAlert);

module.exports = router;

