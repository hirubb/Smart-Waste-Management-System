import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Card,
  Button,
  Row,
  Col,
  Badge,
  Alert,
  Spinner,
  Modal,
  Form,
} from "react-bootstrap";
import {
  FaCreditCard,
  FaMobileAlt,
  FaUniversity,
  FaPlus,
  FaTrash,
  FaStar,
  FaRegStar,
  FaCheckCircle,
} from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";

const PaymentMethods = () => {
  const { user } = useContext(AuthContext);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Payment Method Form State
  const [methodType, setMethodType] = useState("card");
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardHolderName: "",
    expiryDate: "",
    cvv: "",
    cardType: "visa",
  });
  const [mobileMoneyData, setMobileMoneyData] = useState({
    provider: "JazzCash",
    phoneNumber: "",
    accountName: "",
  });
  const [bankData, setBankData] = useState({
    bankName: "",
    accountNumber: "",
    accountTitle: "",
    iban: "",
  });
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = () => {
    // Simulate loading saved payment methods from localStorage
    // In a real app, this would be an API call
    const savedMethods = JSON.parse(localStorage.getItem(`payment_methods_${user?.id || 'user'}`) || "[]");
    setPaymentMethods(savedMethods);
  };

  const handleAddPaymentMethod = () => {
    try {
      let newMethod = {
        id: Date.now().toString(),
        type: methodType,
        addedDate: new Date().toISOString(),
        isDefault: isDefault || paymentMethods.length === 0,
      };

      switch (methodType) {
        case "card":
          if (!cardData.cardNumber || !cardData.cardHolderName || !cardData.expiryDate || !cardData.cvv) {
            setError("Please fill in all card details");
            return;
          }
          if (cardData.cardNumber.replace(/\s/g, '').length !== 16) {
            setError("Card number must be 16 digits");
            return;
          }
          newMethod = {
            ...newMethod,
            cardHolderName: cardData.cardHolderName,
            lastFourDigits: cardData.cardNumber.slice(-4),
            expiryDate: cardData.expiryDate,
            cardType: cardData.cardType,
          };
          break;

        case "mobile-money":
          if (!mobileMoneyData.phoneNumber || !mobileMoneyData.accountName) {
            setError("Please fill in all mobile money details");
            return;
          }
          if (mobileMoneyData.phoneNumber.length !== 11) {
            setError("Phone number must be 11 digits");
            return;
          }
          newMethod = {
            ...newMethod,
            provider: mobileMoneyData.provider,
            phoneNumber: mobileMoneyData.phoneNumber,
            accountName: mobileMoneyData.accountName,
          };
          break;

        case "bank":
          if (!bankData.bankName || !bankData.accountNumber || !bankData.accountTitle) {
            setError("Please fill in all bank details");
            return;
          }
          newMethod = {
            ...newMethod,
            bankName: bankData.bankName,
            accountNumber: bankData.accountNumber,
            accountTitle: bankData.accountTitle,
            iban: bankData.iban,
          };
          break;

        default:
          break;
      }

      // If this is set as default, unset all others
      let updatedMethods = paymentMethods.map((method) => ({
        ...method,
        isDefault: false,
      }));

      updatedMethods.push(newMethod);
      setPaymentMethods(updatedMethods);
      
      // Save to localStorage (in real app, this would be API call)
      localStorage.setItem(`payment_methods_${user?.id || 'user'}`, JSON.stringify(updatedMethods));

      setSuccess("Payment method added successfully!");
      setShowAddModal(false);
      resetForm();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to add payment method. Please try again.");
    }
  };

  const handleDeleteMethod = (id) => {
    if (window.confirm("Are you sure you want to delete this payment method?")) {
      const updatedMethods = paymentMethods.filter((method) => method.id !== id);
      
      // If we deleted the default method and there are other methods, set the first one as default
      if (updatedMethods.length > 0 && !updatedMethods.some(m => m.isDefault)) {
        updatedMethods[0].isDefault = true;
      }
      
      setPaymentMethods(updatedMethods);
      localStorage.setItem(`payment_methods_${user?.id || 'user'}`, JSON.stringify(updatedMethods));
      setSuccess("Payment method deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleSetDefault = (id) => {
    const updatedMethods = paymentMethods.map((method) => ({
      ...method,
      isDefault: method.id === id,
    }));
    setPaymentMethods(updatedMethods);
    localStorage.setItem(`payment_methods_${user?.id || 'user'}`, JSON.stringify(updatedMethods));
    setSuccess("Default payment method updated!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const formatCardNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add spaces every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 19);
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardData({ ...cardData, cardNumber: formatted });
  };

  const resetForm = () => {
    setCardData({
      cardNumber: "",
      cardHolderName: "",
      expiryDate: "",
      cvv: "",
      cardType: "visa",
    });
    setMobileMoneyData({
      provider: "JazzCash",
      phoneNumber: "",
      accountName: "",
    });
    setBankData({
      bankName: "",
      accountNumber: "",
      accountTitle: "",
      iban: "",
    });
    setIsDefault(false);
    setMethodType("card");
    setError("");
  };

  const getMethodIcon = (type) => {
    switch (type) {
      case "card":
        return <FaCreditCard size={24} className="text-primary" />;
      case "mobile-money":
        return <FaMobileAlt size={24} className="text-success" />;
      case "bank":
        return <FaUniversity size={24} className="text-info" />;
      default:
        return <FaCreditCard size={24} />;
    }
  };

  const getMethodTitle = (method) => {
    switch (method.type) {
      case "card":
        return `${method.cardType?.toUpperCase() || "Card"} •••• ${method.lastFourDigits}`;
      case "mobile-money":
        return `${method.provider} - ${method.phoneNumber}`;
      case "bank":
        return `${method.bankName} - ${method.accountNumber?.slice(-4)}`;
      default:
        return "Payment Method";
    }
  };

  const getMethodSubtitle = (method) => {
    switch (method.type) {
      case "card":
        return `${method.cardHolderName} • Expires ${method.expiryDate}`;
      case "mobile-money":
        return method.accountName;
      case "bank":
        return method.accountTitle;
      default:
        return "";
    }
  };

  const renderAddMethodForm = () => {
    switch (methodType) {
      case "card":
        return (
          <div>
            <Form.Group className="mb-3">
              <Form.Label>Card Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardData.cardNumber}
                onChange={handleCardNumberChange}
                maxLength="19"
                isInvalid={cardData.cardNumber && cardData.cardNumber.replace(/\s/g, '').length !== 16}
              />
              {cardData.cardNumber && cardData.cardNumber.replace(/\s/g, '').length !== 16 && (
                <Form.Control.Feedback type="invalid">
                  Must be 16 digits
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Card Holder Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="John Doe"
                value={cardData.cardHolderName}
                onChange={(e) => setCardData({ ...cardData, cardHolderName: e.target.value })}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Expiry Date</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="MM/YY"
                    value={cardData.expiryDate}
                    onChange={(e) => setCardData({ ...cardData, expiryDate: e.target.value })}
                    maxLength="5"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>CVV</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="123"
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                    maxLength="4"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Card Type</Form.Label>
              <Form.Select
                value={cardData.cardType}
                onChange={(e) => setCardData({ ...cardData, cardType: e.target.value })}
              >
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
                <option value="amex">American Express</option>
              </Form.Select>
            </Form.Group>
          </div>
        );

      case "mobile-money":
        return (
          <div>
            <Form.Group className="mb-3">
              <Form.Label>Provider</Form.Label>
              <Form.Select
                value={mobileMoneyData.provider}
                onChange={(e) => setMobileMoneyData({ ...mobileMoneyData, provider: e.target.value })}
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
                placeholder="03001234567"
                value={mobileMoneyData.phoneNumber}
                onChange={(e) => setMobileMoneyData({ ...mobileMoneyData, phoneNumber: e.target.value })}
                maxLength="11"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Account Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Your Name"
                value={mobileMoneyData.accountName}
                onChange={(e) => setMobileMoneyData({ ...mobileMoneyData, accountName: e.target.value })}
              />
            </Form.Group>
          </div>
        );

      case "bank":
        return (
          <div>
            <Form.Group className="mb-3">
              <Form.Label>Bank Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="HBL, UBL, MCB, etc."
                value={bankData.bankName}
                onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Account Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Account Holder Name"
                value={bankData.accountTitle}
                onChange={(e) => setBankData({ ...bankData, accountTitle: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Account Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="1234567890"
                value={bankData.accountNumber}
                onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>IBAN (Optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="PK36HABB0012345678901234"
                value={bankData.iban}
                onChange={(e) => setBankData({ ...bankData, iban: e.target.value })}
              />
            </Form.Group>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Container className="py-4" style={{ maxWidth: "1000px" }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <FaCreditCard className="me-2 text-primary" />
            Payment Methods
          </h2>
          <p className="text-muted mb-0">Manage your saved payment methods</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
        >
          <FaPlus className="me-2" />
          Add Payment Method
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Payment Methods List */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading payment methods...</p>
        </div>
      ) : paymentMethods.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <FaCreditCard size={50} className="text-muted mb-3" />
            <h5 className="text-muted">No Payment Methods Added</h5>
            <p className="text-muted mb-4">
              Add a payment method to make checkout faster and easier.
            </p>
            <Button
              variant="primary"
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
            >
              <FaPlus className="me-2" />
              Add Your First Payment Method
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {paymentMethods.map((method) => (
            <Col md={6} key={method.id} className="mb-3">
              <Card className={`h-100 ${method.isDefault ? "border-primary border-2" : ""}`}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center">
                      {getMethodIcon(method.type)}
                      <div className="ms-3">
                        <h6 className="mb-0">{getMethodTitle(method)}</h6>
                        <small className="text-muted">{getMethodSubtitle(method)}</small>
                      </div>
                    </div>
                    {method.isDefault && (
                      <Badge bg="success" className="d-flex align-items-center">
                        <FaCheckCircle className="me-1" />
                        Default
                      </Badge>
                    )}
                  </div>

                  {method.type === "bank" && method.iban && (
                    <div className="mb-2">
                      <small className="text-muted">IBAN: {method.iban}</small>
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                    <small className="text-muted">
                      Added {new Date(method.addedDate).toLocaleDateString()}
                    </small>
                    <div className="d-flex gap-2">
                      {!method.isDefault && (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleSetDefault(method.id)}
                          title="Set as default"
                        >
                          <FaRegStar />
                        </Button>
                      )}
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteMethod(method.id)}
                        title="Delete"
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Info Alert */}
      {paymentMethods.length > 0 && (
        <Alert variant="info" className="mt-4">
          <strong>💡 Tip:</strong> Your default payment method will be pre-selected at checkout.
          You can change it anytime by clicking the star icon.
        </Alert>
      )}

      {/* Add Payment Method Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <FaPlus className="me-2" />
            Add Payment Method
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <Form.Group className="mb-4">
            <Form.Label>
              <strong>Select Payment Method Type</strong>
            </Form.Label>
            <div className="d-grid gap-2">
              <Button
                variant={methodType === "card" ? "primary" : "outline-primary"}
                onClick={() => setMethodType("card")}
                className="text-start d-flex align-items-center"
              >
                <FaCreditCard className="me-3" size={20} />
                Credit/Debit Card
              </Button>
              <Button
                variant={methodType === "mobile-money" ? "primary" : "outline-primary"}
                onClick={() => setMethodType("mobile-money")}
                className="text-start d-flex align-items-center"
              >
                <FaMobileAlt className="me-3" size={20} />
                Mobile Money (JazzCash, Easypaisa)
              </Button>
              <Button
                variant={methodType === "bank" ? "primary" : "outline-primary"}
                onClick={() => setMethodType("bank")}
                className="text-start d-flex align-items-center"
              >
                <FaUniversity className="me-3" size={20} />
                Bank Account
              </Button>
            </div>
          </Form.Group>

          <hr />

          {renderAddMethodForm()}

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Set as default payment method"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddPaymentMethod}>
            <FaPlus className="me-2" />
            Add Payment Method
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PaymentMethods;

