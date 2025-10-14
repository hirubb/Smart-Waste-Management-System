import React, { useState, useEffect, useContext } from "react";
import { Container, Card, Table, Badge, Spinner, Alert, Button, Row, Col, Form } from "react-bootstrap";
import { FaReceipt, FaCreditCard, FaMobileAlt, FaMoneyBillWave, FaUniversity, FaDownload, FaEye } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

const PaymentHistory = () => {
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMethod, setFilterMethod] = useState("all");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/payments/user/all");
      setPayments(response.data.payments || []);
      setError("");
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError("Failed to load payment history. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "card":
        return <FaCreditCard className="me-2" />;
      case "mobile-money":
        return <FaMobileAlt className="me-2" />;
      case "cash":
        return <FaMoneyBillWave className="me-2" />;
      case "bank-transfer":
        return <FaUniversity className="me-2" />;
      default:
        return <FaReceipt className="me-2" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed: "success",
      pending: "warning",
      processing: "info",
      failed: "danger",
      cancelled: "secondary",
      refunded: "dark",
    };
    return (
      <Badge bg={variants[status] || "secondary"} className="text-capitalize">
        {status}
      </Badge>
    );
  };

  const formatPaymentMethod = (method) => {
    const methods = {
      card: "Credit/Debit Card",
      "mobile-money": "Mobile Money",
      cash: "Cash on Collection",
      "bank-transfer": "Bank Transfer",
    };
    return methods[method] || method;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredPayments = payments.filter((payment) => {
    const statusMatch = filterStatus === "all" || payment.paymentStatus === filterStatus;
    const methodMatch = filterMethod === "all" || payment.paymentMethod === filterMethod;
    return statusMatch && methodMatch;
  });

  const totalAmount = filteredPayments
    .filter((p) => p.paymentStatus === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading payment history...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4" style={{ maxWidth: "1200px" }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <FaReceipt className="me-2 text-primary" />
            Payment History
          </h2>
          <p className="text-muted mb-0">View all your payment transactions</p>
        </div>
        <Button variant="outline-primary" size="sm">
          <FaDownload className="me-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="border-primary">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Total Payments</p>
                  <h4 className="mb-0">{payments.length}</h4>
                </div>
                <FaReceipt size={30} className="text-primary opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-success">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Completed</p>
                  <h4 className="mb-0">
                    {payments.filter((p) => p.paymentStatus === "completed").length}
                  </h4>
                </div>
                <Badge bg="success" style={{ fontSize: "2rem", width: "50px", height: "50px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  ✓
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-success">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Total Amount</p>
                  <h4 className="mb-0 text-success">Rs. {totalAmount.toLocaleString()}</h4>
                </div>
                <FaMoneyBillWave size={30} className="text-success opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-3">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Filter by Status</Form.Label>
                <Form.Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Filter by Method</Form.Label>
                <Form.Select
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                >
                  <option value="all">All Methods</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="mobile-money">Mobile Money</option>
                  <option value="cash">Cash on Collection</option>
                  <option value="bank-transfer">Bank Transfer</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Payment Table */}
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">Transaction History</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-5">
              <FaReceipt size={50} className="text-muted mb-3" />
              <h5 className="text-muted">No Payments Found</h5>
              <p className="text-muted">
                {payments.length === 0
                  ? "You haven't made any payments yet."
                  : "No payments match the selected filters."}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Invoice #</th>
                    <th>Date</th>
                    <th>Payment Method</th>
                    <th>Transaction ID</th>
                    <th className="text-end">Amount</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment._id}>
                      <td>
                        <strong className="text-primary">{payment.invoiceNumber}</strong>
                      </td>
                      <td>
                        <small>{formatDate(payment.createdAt)}</small>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          {getPaymentMethodIcon(payment.paymentMethod)}
                          <span>{formatPaymentMethod(payment.paymentMethod)}</span>
                        </div>
                        {payment.paymentMethod === "card" && payment.cardDetails && (
                          <small className="text-muted d-block">
                            •••• {payment.cardDetails.lastFourDigits}
                          </small>
                        )}
                        {payment.paymentMethod === "mobile-money" &&
                          payment.mobileMoneyDetails && (
                            <small className="text-muted d-block">
                              {payment.mobileMoneyDetails.provider}
                            </small>
                          )}
                      </td>
                      <td>
                        {payment.transactionId ? (
                          <code className="text-success">{payment.transactionId}</code>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="text-end">
                        <strong>Rs. {payment.amount.toLocaleString()}</strong>
                      </td>
                      <td>{getStatusBadge(payment.paymentStatus)}</td>
                      <td className="text-center">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          title="View Details"
                          onClick={() => {
                            // You can implement a modal to show payment details
                            alert(`Payment Details:\n\nInvoice: ${payment.invoiceNumber}\nAmount: Rs. ${payment.amount}\nStatus: ${payment.paymentStatus}\nTransaction ID: ${payment.transactionId || "N/A"}`);
                          }}
                        >
                          <FaEye />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Additional Info */}
      {filteredPayments.length > 0 && (
        <div className="mt-3 text-center">
          <small className="text-muted">
            Showing {filteredPayments.length} of {payments.length} total payments
          </small>
        </div>
      )}
    </Container>
  );
};

export default PaymentHistory;

