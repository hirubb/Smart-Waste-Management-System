import React, { useEffect, useState, useContext } from "react";
import { Container, Card, Alert, Badge, Spinner, Button, Form, InputGroup } from "react-bootstrap";
import { Search, Filter, ChevronDown, ChevronUp, Calendar, MapPin, Weight, FileText, DollarSign, X } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

const UserCollections = () => {
  const { user } = useContext(AuthContext);
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelingId, setCancelingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/collections/user/${user?.id}`);
        setCollections(res.data);
        setFilteredCollections(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch collection requests.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchCollections();
  }, [user]);

  // Filter and search logic
  useEffect(() => {
    let filtered = collections;

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(col => col.status === filterStatus);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(col => 
        col.wasteCategory.toLowerCase().includes(term) ||
        col.requestType.toLowerCase().includes(term) ||
        col.pickupLocation?.address?.toLowerCase().includes(term) ||
        col.notes?.toLowerCase().includes(term)
      );
    }

    setFilteredCollections(filtered);
  }, [searchTerm, filterStatus, collections]);

  const statusColor = (status) => {
    switch (status) {
      case "pending": return "warning";
      case "confirmed": return "info";
      case "assigned": return "primary";
      case "in-progress": return "secondary";
      case "completed": return "success";
      case "cancelled": return "danger";
      default: return "dark";
    }
  };

  const handleCancel = async (id) => {
    const reason = window.prompt(
      "Please provide a reason for cancelling this collection:",
      "User cancelled"
    );
    if (reason === null) return;

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

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
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
    <Container className="py-4" style={{ maxWidth: "900px" }}>
      <h4 className="mb-4">Your Collection Requests</h4>

      {collections.length === 0 ? (
        <Alert variant="info">You have no collection requests yet.</Alert>
      ) : (
        <>
          {/* Search and Filter Section */}
          <Card className="shadow-sm mb-3">
            <Card.Body className="p-3">
              <div className="d-flex flex-column flex-md-row gap-3">
                <InputGroup style={{ flex: 1 }}>
                  <InputGroup.Text>
                    <Search size={18} />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search by waste type, address, notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setSearchTerm("")}
                    >
                      <X size={18} />
                    </Button>
                  )}
                </InputGroup>
                
                <InputGroup style={{ maxWidth: "200px" }}>
                  <InputGroup.Text>
                    <Filter size={18} />
                  </InputGroup.Text>
                  <Form.Select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="assigned">Assigned</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                </InputGroup>
              </div>
            </Card.Body>
          </Card>

          {/* Results Count */}
          <div className="mb-3 text-muted small">
            Showing {filteredCollections.length} of {collections.length} collection(s)
          </div>

          {/* Collections List */}
          {filteredCollections.length === 0 ? (
            <Alert variant="warning">No collections match your search criteria.</Alert>
          ) : (
            <div className="d-flex flex-column gap-3">
              {filteredCollections.map((col) => {
                const isExpanded = expandedId === col._id;
                const borderColor = 
                  col.status === "completed" ? "#28a745" :
                  col.status === "cancelled" ? "#dc3545" :
                  col.status === "in-progress" ? "#6c757d" : "#007bff";

                return (
                  <Card 
                    key={col._id} 
                    className="shadow-sm border-0" 
                    style={{ borderLeft: `4px solid ${borderColor}` }}
                  >
                    <Card.Body className="p-3">
                      <div 
                        className="d-flex justify-content-between align-items-start"
                        onClick={() => toggleExpand(col._id)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                            <h6 className="mb-0 fw-bold">{col.wasteCategory.toUpperCase()}</h6>
                            <Badge bg={statusColor(col.status)} className="text-uppercase">
                              {col.status}
                            </Badge>
                            <span className="text-muted small">• {col.requestType}</span>
                          </div>
                          
                          <div className="d-flex flex-wrap gap-3 text-muted small">
                            <span className="d-flex align-items-center gap-1">
                              <Calendar size={14} />
                              {new Date(col.scheduledDate).toLocaleDateString()} at {col.scheduledTime}
                            </span>
                            {col.pickupLocation?.address && (
                              <span className="d-flex align-items-center gap-1">
                                <MapPin size={14} />
                                {col.pickupLocation.address.length > 35 
                                  ? col.pickupLocation.address.substring(0, 35) + "..." 
                                  : col.pickupLocation.address}
                              </span>
                            )}
                            <span className="d-flex align-items-center gap-1 fw-bold text-success">
                              <DollarSign size={14} />
                              Rs. {col.estimatedCost || 0}
                            </span>
                          </div>
                        </div>

                        <Button 
                          variant="link" 
                          className="text-secondary p-0"
                          style={{ minWidth: "auto" }}
                        >
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </Button>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-top">
                          <div className="row g-3">
                            <div className="col-md-6">
                              <div className="d-flex align-items-start gap-2">
                                <Calendar size={18} className="text-primary mt-1" />
                                <div>
                                  <small className="text-muted d-block">Scheduled</small>
                                  <span className="fw-semibold">
                                    {new Date(col.scheduledDate).toLocaleDateString()}
                                  </span>
                                  <span className="text-muted"> at {col.scheduledTime}</span>
                                </div>
                              </div>
                            </div>

                            {col.weight && (
                              <div className="col-md-6">
                                <div className="d-flex align-items-start gap-2">
                                  <Weight size={18} className="text-primary mt-1" />
                                  <div>
                                    <small className="text-muted d-block">Estimated Weight</small>
                                    <span className="fw-semibold">{col.weight} kg</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {col.pickupLocation?.address && (
                              <div className="col-12">
                                <div className="d-flex align-items-start gap-2">
                                  <MapPin size={18} className="text-primary mt-1" />
                                  <div>
                                    <small className="text-muted d-block">Pickup Address</small>
                                    <span className="fw-semibold">{col.pickupLocation.address}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {col.notes && (
                              <div className="col-12">
                                <div className="d-flex align-items-start gap-2">
                                  <FileText size={18} className="text-primary mt-1" />
                                  <div>
                                    <small className="text-muted d-block">Notes</small>
                                    <span>{col.notes}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {col.status === "cancelled" && col.cancellationReason && (
                              <div className="col-12">
                                <Alert variant="danger" className="mb-0 py-2">
                                  <strong>Cancelled:</strong> {col.cancellationReason}
                                </Alert>
                              </div>
                            )}

                            <div className="col-12">
                              <div className="bg-light p-3 rounded">
                                <div className="d-flex justify-content-between align-items-center">
                                  <span className="text-muted">Estimated Cost</span>
                                  <span className="fs-5 fw-bold text-success">Rs. {col.estimatedCost || 0}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Cancel Button */}
                          {["pending", "confirmed"].includes(col.status) && (
                            <div className="mt-3 text-end">
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancel(col._id);
                                }}
                                disabled={cancelingId === col._id}
                              >
                                {cancelingId === col._id ? "Cancelling..." : "Cancel Collection"}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default UserCollections;