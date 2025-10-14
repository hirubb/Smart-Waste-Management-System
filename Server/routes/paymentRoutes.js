const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const auth = require("../middleware/auth");

// All payment routes require authentication (no specific role required)
router.use(auth());

// Initiate a new payment
router.post("/initiate", paymentController.initiatePayment);

// Process payment
router.post("/:paymentId/process", paymentController.processPayment);

// Get payment details
router.get("/:paymentId", paymentController.getPayment);

// Get all payments for authenticated user
router.get("/user/all", paymentController.getUserPayments);

// Get payment by collection request ID
router.get("/collection/:collectionId", paymentController.getPaymentByCollection);

// Cancel payment
router.patch("/:paymentId/cancel", paymentController.cancelPayment);

module.exports = router;

