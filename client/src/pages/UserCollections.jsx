import React, { useEffect, useState, useContext } from "react";
import { Container, Card, Alert, Row, Col, Badge, Spinner, Button } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

const UserCollections = () => {
  const { user } = useContext(AuthContext);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelingId, setCancelingId] = useState(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/collections/user/${user?.id}`);
        setCollections(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch collection requests.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchCollections();
  }, [user]);

  const statusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "confirmed":
        return "info";
      case "assigned":
        return "primary";
      case "in-progress":
        return "secondary";
      case "completed":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "dark";
    }
  };

  const handleCancel = async (id) => {
    const reason = window.prompt(
      "Please provide a reason for cancelling this collection:",
      "User cancelled"
    );
    if (reason === null) return; // User pressed cancel

    try {
      setCancelingId(id);
      await api.put(`/collections/cancel/${id}`, { reason });
      setCollections((prev) =>
        prev.map((col) =>
          col._id === id
            ? { ...col, status: "cancelled", cancelledAt: new Date(), cancellationReason: reason }
            : col
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to cancel the collection. Please try again.");
    } finally {
      setCancelingId(null);
    }
  };

  if (loading)
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading your collections...</p>
        </div>
      </Container>
    );

  if (error)
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );

  return (
    <Container className="py-4" style={{ maxWidth: "1100px" }}>
      <h4 className="mb-4">Your Collection Requests</h4>
      {collections.length === 0 ? (
        <Alert variant="info">You have no collection requests yet.</Alert>
      ) : (
        <Row className="g-3">
          {collections.map((col) => (
            <Col md={6} key={col._id}>
              <Card className="shadow-sm">
                <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
                  <strong>{col.wasteCategory.toUpperCase()}</strong>
                  <Badge bg={statusColor(col.status)} className="text-uppercase">
                    {col.status}
                  </Badge>
                </Card.Header>
                <Card.Body>
                  <p>
                    <strong>Type:</strong> {col.requestType}
                  </p>
                  <p>
                    <strong>Scheduled Date:</strong>{" "}
                    {new Date(col.scheduledDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Scheduled Time:</strong> {col.scheduledTime}
                  </p>
                  <p>
                    <strong>Estimated Cost:</strong> Rs. {col.estimatedCost || 0}
                  </p>
                  {col.weight && (
                    <p>
                      <strong>Weight:</strong> {col.weight} kg
                    </p>
                  )}
             
                  {col.notes && (
                    <p>
                      <strong>Notes:</strong> {col.notes}
                    </p>
                  )}
                  {col.pickupLocation?.address && (
                    <p>
                      <strong>Pickup Address:</strong> {col.pickupLocation.address}
                    </p>
                  )}
                  {col.status === "cancelled" && col.cancellationReason && (
                    <p>
                      <strong>Cancellation Reason:</strong> {col.cancellationReason}
                    </p>
                  )}

                  {/* Cancel Button */}
                  {["pending", "confirmed"].includes(col.status) && (
                    <div className="mt-3 text-end">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancel(col._id)}
                        disabled={cancelingId === col._id}
                      >
                        {cancelingId === col._id ? "Cancelling..." : "Cancel Collection"}
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default UserCollections;
