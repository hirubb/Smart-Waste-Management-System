const Payment = require("../models/Payment");
const CollectionRequest = require("../models/CollectionRequest");
const mongoose = require("mongoose");

/**
 * Initiate a payment for a collection request
 */
exports.initiatePayment = async (req, res) => {
  try {
    const { collectionRequestId, amount, paymentMethod } = req.body;
    const userId = req.user.id; // from auth middleware

    // Validate required fields
    if (!collectionRequestId || !amount || !paymentMethod) {
      return res.status(400).json({ 
        message: "Missing required fields: collectionRequestId, amount, paymentMethod" 
      });
    }

    // Verify collection request exists
    const collectionRequest = await CollectionRequest.findById(collectionRequestId);
    if (!collectionRequest) {
      return res.status(404).json({ message: "Collection request not found." });
    }

    // Verify the collection belongs to the user
    if (collectionRequest.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized access to this collection." });
    }

    // Check if payment already exists for this collection
    const existingPayment = await Payment.findOne({ 
      collectionRequestId,
      paymentStatus: { $in: ['completed', 'processing'] }
    });

    if (existingPayment) {
      return res.status(400).json({ 
        message: "Payment already exists for this collection request.",
        payment: existingPayment
      });
    }

    // Create new payment
    const newPayment = new Payment({
      userId,
      collectionRequestId,
      amount,
      paymentMethod,
      paymentStatus: 'pending'
    });

    await newPayment.save();

    res.status(201).json({
      message: "Payment initiated successfully!",
      payment: newPayment
    });
  } catch (error) {
    console.error("Error initiating payment:", error);
    res.status(500).json({
      message: "Server error while initiating payment.",
      error: error.message
    });
  }
};

/**
 * Process payment (simulated for card/mobile money)
 */
exports.processPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { cardDetails, mobileMoneyDetails, billingAddress } = req.body;
    const userId = req.user.id;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    // Verify the payment belongs to the user
    if (payment.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized access to this payment." });
    }

    // Check if already processed
    if (payment.paymentStatus === 'completed') {
      return res.status(400).json({ 
        message: "Payment already completed.",
        payment 
      });
    }

    // Update payment status to processing
    payment.paymentStatus = 'processing';

    // Store payment details based on method
    if (payment.paymentMethod === 'card' && cardDetails) {
      payment.cardDetails = {
        lastFourDigits: cardDetails.cardNumber.slice(-4),
        cardType: cardDetails.cardType || 'visa',
        expiryDate: cardDetails.expiryDate
      };
    }

    if (payment.paymentMethod === 'mobile-money' && mobileMoneyDetails) {
      payment.mobileMoneyDetails = {
        provider: mobileMoneyDetails.provider,
        phoneNumber: mobileMoneyDetails.phoneNumber,
        referenceNumber: 'REF-' + Date.now()
      };
    }

    if (billingAddress) {
      payment.billingAddress = billingAddress;
    }

    // Simulate payment processing (in real app, integrate with payment gateway)
    // For demo purposes, we'll simulate success
    const paymentSuccess = Math.random() > 0.1; // 90% success rate

    if (paymentSuccess) {
      payment.paymentStatus = 'completed';
      payment.transactionId = 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
      payment.paidAt = new Date();

      // Update collection request status to confirmed
      const collectionRequest = await CollectionRequest.findById(payment.collectionRequestId);
      if (collectionRequest) {
        collectionRequest.status = 'confirmed';
        await collectionRequest.save();
      }

      await payment.save();

      return res.json({
        success: true,
        message: "Payment processed successfully!",
        payment,
        transactionId: payment.transactionId
      });
    } else {
      payment.paymentStatus = 'failed';
      payment.failureReason = 'Payment gateway declined the transaction.';
      await payment.save();

      return res.status(400).json({
        success: false,
        message: "Payment failed. Please try again.",
        payment
      });
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({
      message: "Server error while processing payment.",
      error: error.message
    });
  }
};

/**
 * Get payment details
 */
exports.getPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findById(paymentId)
      .populate('collectionRequestId')
      .populate('userId', 'name email');

    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    // Verify the payment belongs to the user
    if (payment.userId._id.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized access to this payment." });
    }

    res.json({ payment });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({
      message: "Error fetching payment details.",
      error: error.message
    });
  }
};

/**
 * Get all payments for a user
 */
exports.getUserPayments = async (req, res) => {
  try {
    const userId = req.user.id;

    const payments = await Payment.find({ userId })
      .populate('collectionRequestId')
      .sort({ createdAt: -1 });

    res.json({ payments });
  } catch (error) {
    console.error("Error fetching user payments:", error);
    res.status(500).json({
      message: "Error fetching payments.",
      error: error.message
    });
  }
};

/**
 * Get payment by collection request ID
 */
exports.getPaymentByCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({ collectionRequestId: collectionId })
      .populate('collectionRequestId');

    if (!payment) {
      return res.status(404).json({ message: "No payment found for this collection." });
    }

    // Verify the payment belongs to the user
    if (payment.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    res.json({ payment });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({
      message: "Error fetching payment.",
      error: error.message
    });
  }
};

/**
 * Cancel payment
 */
exports.cancelPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    // Verify the payment belongs to the user
    if (payment.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    // Can only cancel pending or processing payments
    if (!['pending', 'processing'].includes(payment.paymentStatus)) {
      return res.status(400).json({ 
        message: `Cannot cancel payment with status: ${payment.paymentStatus}` 
      });
    }

    payment.paymentStatus = 'cancelled';
    await payment.save();

    res.json({
      message: "Payment cancelled successfully.",
      payment
    });
  } catch (error) {
    console.error("Error cancelling payment:", error);
    res.status(500).json({
      message: "Error cancelling payment.",
      error: error.message
    });
  }
};

