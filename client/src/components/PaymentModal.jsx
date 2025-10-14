import React, { useState } from "react";
import { Modal, Button, Form, Alert, Spinner, Card, Row, Col } from "react-bootstrap";
import { 
  FaCreditCard, 
  FaMobileAlt, 
  FaMoneyBillWave, 
  FaUniversity,
  FaLock 
} from "react-icons/fa";

const PaymentModal = ({ 
  show, 
  handleClose, 
  amount, 
  collectionRequestId, 
  onPaymentSuccess 
}) => {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Card payment fields
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardHolderName: "",
    expiryDate: "",
    cvv: "",
    cardType: "visa"
  });

  // Mobile money fields
  const [mobileMoneyData, setMobileMoneyData] = useState({
    provider: "JazzCash",
    phoneNumber: ""
  });

  // Billing address
  const [billingAddress, setBillingAddress] = useState({
    street: "",
    city: "",
    postalCode: "",
    country: "Pakistan"
  });

  const paymentMethods = [
    { value: "card", label: "Credit/Debit Card", icon: <FaCreditCard /> },
    { value: "mobile-money", label: "Mobile Money", icon: <FaMobileAlt /> },
    { value: "cash", label: "Cash on Collection", icon: <FaMoneyBillWave /> },
    { value: "bank-transfer", label: "Bank Transfer", icon: <FaUniversity /> }
  ];

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setCardData(prev => ({ ...prev, [name]: value }));
  };

  const handleMobileMoneyChange = (e) => {
    const { name, value } = e.target;
    setMobileMoneyData(prev => ({ ...prev, [name]: value }));
  };

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingAddress(prev => ({ ...prev, [name]: value }));
  };

  const validateCardNumber = (number) => {
    const regex = /^[0-9]{16}$/;
    return regex.test(number.replace(/\s/g, ''));
  };

  const validateExpiry = (expiry) => {
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    return regex.test(expiry);
  };

  const validateCVV = (cvv) => {
    const regex = /^[0-9]{3,4}$/;
    return regex.test(cvv);
  };

  const handlePayment = async () => {
    setError("");
    setLoading(true);

    try {
      // Import api dynamically
      const api = (await import("../services/api")).default;

      // Step 1: Initiate payment
      const initiateResponse = await api.post("/payments/initiate", {
        collectionRequestId,
        amount,
        paymentMethod
      });

      const paymentId = initiateResponse.data.payment._id;

      // Step 2: Process payment based on method
      if (paymentMethod === "card") {
        // Validate card details
        if (!validateCardNumber(cardData.cardNumber)) {
          throw new Error("Invalid card number. Must be 16 digits.");
        }
        if (!validateExpiry(cardData.expiryDate)) {
          throw new Error("Invalid expiry date. Format: MM/YY");
        }
        if (!validateCVV(cardData.cvv)) {
          throw new Error("Invalid CVV. Must be 3-4 digits.");
        }
        if (!cardData.cardHolderName.trim()) {
          throw new Error("Card holder name is required.");
        }

        const processResponse = await api.post(`/payments/${paymentId}/process`, {
          cardDetails: cardData,
          billingAddress
        });

        if (processResponse.data.success) {
          setSuccess(true);
          setTimeout(() => {
            if (onPaymentSuccess) {
              onPaymentSuccess(processResponse.data);
            }
          }, 2000);
        } else {
          throw new Error(processResponse.data.message || "Payment failed");
        }
      } else if (paymentMethod === "mobile-money") {
        // Validate mobile money details
        if (!mobileMoneyData.phoneNumber.match(/^[0-9]{11}$/)) {
          throw new Error("Invalid phone number. Must be 11 digits.");
        }

        const processResponse = await api.post(`/payments/${paymentId}/process`, {
          mobileMoneyDetails: mobileMoneyData,
          billingAddress
        });

        if (processResponse.data.success) {
          setSuccess(true);
          setTimeout(() => {
            if (onPaymentSuccess) {
              onPaymentSuccess(processResponse.data);
            }
          }, 2000);
        } else {
          throw new Error(processResponse.data.message || "Payment failed");
        }
      } else if (paymentMethod === "cash" || paymentMethod === "bank-transfer") {
        // For cash and bank transfer, just initiate and mark as pending
        setSuccess(true);
        setTimeout(() => {
          if (onPaymentSuccess) {
            onPaymentSuccess({
              success: true,
              message: `${paymentMethod === 'cash' ? 'Cash' : 'Bank Transfer'} payment recorded. Please complete payment as instructed.`,
              payment: initiateResponse.data.payment
            });
          }
        }, 2000);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.response?.data?.message || err.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case "card":
        return (
          <div className="mt-3">
            <Form.Group className="mb-3">
              <Form.Label>Card Number</Form.Label>
              <Form.Control
                type="text"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardData.cardNumber}
                onChange={handleCardInputChange}
                maxLength="19"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Card Holder Name</Form.Label>
              <Form.Control
                type="text"
                name="cardHolderName"
                placeholder="John Doe"
                value={cardData.cardHolderName}
                onChange={handleCardInputChange}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Expiry Date</Form.Label>
                  <Form.Control
                    type="text"
                    name="expiryDate"
                    placeholder="MM/YY"
                    value={cardData.expiryDate}
                    onChange={handleCardInputChange}
                    maxLength="5"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>CVV</Form.Label>
                  <Form.Control
                    type="password"
                    name="cvv"
                    placeholder="123"
                    value={cardData.cvv}
                    onChange={handleCardInputChange}
                    maxLength="4"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Card Type</Form.Label>
              <Form.Select
                name="cardType"
                value={cardData.cardType}
                onChange={handleCardInputChange}
              >
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
                <option value="amex">American Express</option>
              </Form.Select>
            </Form.Group>

            <hr />
            <h6 className="mb-3">Billing Address</h6>
            
            <Form.Group className="mb-3">
              <Form.Label>Street Address</Form.Label>
              <Form.Control
                type="text"
                name="street"
                placeholder="123 Main Street"
                value={billingAddress.street}
                onChange={handleBillingChange}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    placeholder="Lahore"
                    value={billingAddress.city}
                    onChange={handleBillingChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Postal Code</Form.Label>
                  <Form.Control
                    type="text"
                    name="postalCode"
                    placeholder="54000"
                    value={billingAddress.postalCode}
                    onChange={handleBillingChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
        );

      case "mobile-money":
        return (
          <div className="mt-3">
            <Form.Group className="mb-3">
              <Form.Label>Mobile Money Provider</Form.Label>
              <Form.Select
                name="provider"
                value={mobileMoneyData.provider}
                onChange={handleMobileMoneyChange}
              >
                <option value="JazzCash">JazzCash</option>
                <option value="Easypaisa">Easypaisa</option>
                <option value="UPaisa">UPaisa</option>
                <option value="SimSim">SimSim</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                name="phoneNumber"
                placeholder="03001234567"
                value={mobileMoneyData.phoneNumber}
                onChange={handleMobileMoneyChange}
                maxLength="11"
                required
              />
              <Form.Text className="text-muted">
                Enter 11-digit mobile number without spaces or dashes
              </Form.Text>
            </Form.Group>

            <Alert variant="info" className="mt-3">
              <small>
                <FaLock /> You will receive a payment request on your mobile.
                Please approve it to complete the transaction.
              </small>
            </Alert>
          </div>
        );

      case "cash":
        return (
          <Alert variant="warning" className="mt-3">
            <h6>Cash Payment Instructions:</h6>
            <ul className="mb-0">
              <li>Please keep exact cash amount ready</li>
              <li>Payment will be collected during waste pickup</li>
              <li>Request receipt from collector</li>
              <li>Amount: <strong>Rs. {amount}</strong></li>
            </ul>
          </Alert>
        );

      case "bank-transfer":
        return (
          <Alert variant="info" className="mt-3">
            <h6>Bank Transfer Details:</h6>
            <p><strong>Bank:</strong> HBL</p>
            <p><strong>Account Title:</strong> Smart Waste Management</p>
            <p><strong>Account Number:</strong> 12345678901234</p>
            <p><strong>IBAN:</strong> PK36HABB0012345678901234</p>
            <p className="mb-0"><strong>Amount:</strong> Rs. {amount}</p>
            <hr />
            <small className="text-muted">
              Please transfer the amount and upload payment proof in your account dashboard.
            </small>
          </Alert>
        );

      default:
        return null;
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <FaLock /> Secure Payment
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {success ? (
          <Alert variant="success" className="text-center">
            <h5>✅ Payment Successful!</h5>
            <p>Your booking has been confirmed. Redirecting...</p>
            <Spinner animation="border" size="sm" />
          </Alert>
        ) : (
          <>
            {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}

            <Card className="mb-3 border-success">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0 text-muted">Total Amount</h6>
                    <h3 className="mb-0 text-success">Rs. {amount}</h3>
                  </div>
                  <div className="text-end">
                    <small className="text-muted">Collection ID</small>
                    <p className="mb-0 font-monospace">{collectionRequestId?.slice(-8)}</p>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Form.Group className="mb-3">
              <Form.Label><strong>Select Payment Method</strong></Form.Label>
              <div className="d-grid gap-2">
                {paymentMethods.map((method) => (
                  <Button
                    key={method.value}
                    variant={paymentMethod === method.value ? "primary" : "outline-primary"}
                    onClick={() => setPaymentMethod(method.value)}
                    className="text-start d-flex align-items-center"
                  >
                    <span className="me-2" style={{ fontSize: "1.2rem" }}>
                      {method.icon}
                    </span>
                    {method.label}
                  </Button>
                ))}
              </div>
            </Form.Group>

            {renderPaymentForm()}

            <div className="mt-4 d-flex gap-2">
              <Button 
                variant="secondary" 
                onClick={handleClose} 
                disabled={loading}
                className="flex-grow-1"
              >
                Cancel
              </Button>
              <Button 
                variant="success" 
                onClick={handlePayment} 
                disabled={loading}
                className="flex-grow-1"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Processing...
                  </>
                ) : (
                  `Pay Rs. ${amount}`
                )}
              </Button>
            </div>

            <div className="text-center mt-3">
              <small className="text-muted">
                <FaLock /> Your payment information is secure and encrypted
              </small>
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default PaymentModal;

