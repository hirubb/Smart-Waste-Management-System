import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Card, Button, Table, Alert } from "react-bootstrap";
import api from "../services/api";
import PaymentModal from "../components/PaymentModal";

const CollectionSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { request, formData, estimatedCost } = location.state || {};
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  if (!request) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">
          No scheduling data found. Please schedule a collection first.
        </Alert>
        <Button variant="primary" onClick={() => navigate("/schedule")}>
          Go to Scheduling Page
        </Button>
      </Container>
    );
  }

  const handleConfirmBooking = () => {
    // Open payment modal instead of directly confirming
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (paymentData) => {
    setShowPaymentModal(false);
    
    // Show success message
    alert(`✅ Payment Successful!\nTransaction ID: ${paymentData.transactionId || 'Pending'}\nYour booking has been confirmed!`);
    
    // Navigate to home or user collections page
    navigate("/user-collections");
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
  };

  return (
    <Container className="py-4" style={{ maxWidth: "800px" }}>
      <Card className="shadow-sm">
        <Card.Header className="bg-success text-white text-center">
          <h5 className="mb-0">Collection Summary</h5>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover>
            <tbody>
              <tr>
                <th>Waste Type</th>
                <td>{formData.wasteCategory}</td>
              </tr>
              <tr>
                <th>Scheduled Date</th>
                <td>{formData.scheduledDate}</td>
              </tr>
              <tr>
                <th>Time Slot</th>
                <td>{formData.scheduledTime}</td>
              </tr>
              <tr>
                <th>Pickup Address</th>
                <td>{formData.pickupAddress}</td>
              </tr>
              <tr>
                <th>Coordinates</th>
                <td>
                  {formData.pickupLatitude}, {formData.pickupLongitude}
                </td>
              </tr>
              <tr>
                <th>Estimated Weight</th>
                <td>{formData.weight || "N/A"} kg</td>
              </tr>
              <tr>
                <th>Special Notes</th>
                <td>{formData.notes || "None"}</td>
              </tr>
              <tr>
                <th>Estimated Cost</th>
                <td>
                  <strong>Rs. {estimatedCost}</strong>
                </td>
              </tr>
            </tbody>
          </Table>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button
              variant="outline-secondary"
              onClick={() => navigate("/schedule")}
            >
              Back to Edit
            </Button>
            <Button variant="success" onClick={handleConfirmBooking}>
              Proceed to Payment
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Payment Modal */}
      <PaymentModal
        show={showPaymentModal}
        handleClose={handleClosePaymentModal}
        amount={estimatedCost}
        collectionRequestId={request._id}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </Container>
  );
};

export default CollectionSummary;
