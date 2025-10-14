const express = require("express");
const router = express.Router();
const {
  scheduleCollection,
  getUserCollections,
  cancelCollection,
  confirmCollection,
  updateCollectionStatus
} = require("../controllers/collectionRequestController");

// POST - schedule new collection
router.post("/schedule", scheduleCollection);

// GET - all collections for a user
router.get("/user/:userId", getUserCollections);

// PUT - cancel a collection
router.put("/cancel/:id", cancelCollection);

// PUT - confirm collection (admin/collector)
router.put("/confirm/:id", confirmCollection);

//change status
router.patch("/:id/status",updateCollectionStatus);
module.exports = router;
