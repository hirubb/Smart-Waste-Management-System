import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { FaBell, FaMapMarkerAlt } from "react-icons/fa";
import axios from "axios";

const NewAlertModal = ({ show, handleClose, onAlertCreated, editAlert = null }) => {
  const [formData, setFormData] = useState({
    binId: "",
    location: "",
    latitude: "",
    longitude: "",
    severity: "Medium",
    type: "Bin Full",
    description: "",
    assignedTo: "",
    notes: "",
    binCapacity: "",
    status: "Open",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Populate form when editing
  useEffect(() => {
    if (editAlert) {
      setFormData({
        binId: editAlert.binId || "",
        location: editAlert.location || "",
        latitude: editAlert.latitude || "",
        longitude: editAlert.longitude || "",
        severity: editAlert.severity || "Medium",
        type: editAlert.type || "Bin Full",
        description: editAlert.description || "",
        assignedTo: editAlert.assignedTo || "",
        notes: editAlert.notes || "",
        binCapacity: editAlert.binCapacity || "",
        status: editAlert.status || "Open",
      });
    } else {
      // Reset form for new alert
      setFormData({
        binId: "",
        location: "",
        latitude: "",
        longitude: "",
        severity: "Medium",
        type: "Bin Full",
        description: "",
        assignedTo: "",
        notes: "",
        binCapacity: "",
        status: "Open",
      });
    }
  }, [editAlert, show]);

  const severityOptions = ["Critical", "High", "Medium", "Low"];
  const typeOptions = [
    "Bin Full",
    "Maintenance Required",
    "Odor Detection",
    "Fire Hazard",
    "Temperature Alert",
    "Contamination",
    "Sensor Malfunction",
    "Damage Reported",
    "Other",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.binId || !formData.location || !formData.severity || !formData.type || !formData.description) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      // Prepare data for API
      const alertData = {
        binId: formData.binId,
        location: formData.location,
        severity: formData.severity,
        type: formData.type,
        description: formData.description,
        status: formData.status,
      };

      // Add optional fields if provided
      if (formData.latitude) alertData.latitude = parseFloat(formData.latitude);
      if (formData.longitude) alertData.longitude = parseFloat(formData.longitude);
      if (formData.assignedTo) alertData.assignedTo = formData.assignedTo;
      if (formData.notes) alertData.notes = formData.notes;
      if (formData.binCapacity) alertData.binCapacity = parseFloat(formData.binCapacity);

      let response;
      if (editAlert) {
        // Update existing alert
        response = await axios.put(`http://localhost:4000/api/alerts/${editAlert._id}`, alertData);
        if (response.data.success) {
          setSuccess("Alert updated successfully!");
        }
      } else {
        // Create new alert
        response = await axios.post("http://localhost:4000/api/alerts", alertData);
        if (response.data.success) {
          setSuccess("Alert created successfully!");
        }
      }

      // Notify parent component
      if (onAlertCreated) {
        onAlertCreated(response.data.alert);
      }

      // Close modal after short delay
      setTimeout(() => {
        handleClose();
        setSuccess("");
      }, 1500);
    } catch (err) {
      console.error(`Error ${editAlert ? 'updating' : 'creating'} alert:`, err);
      setError(err.response?.data?.message || `Failed to ${editAlert ? 'update' : 'create'} alert. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setError("");
    setSuccess("");
    handleClose();
  };

  const statusOptions = ["Open", "In Progress", "Resolved"];

  return (
    <Modal show={show} onHide={handleModalClose} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <FaBell className="me-2" />
          {editAlert ? 'Edit Alert' : 'Create New Alert'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row>
            {/* Bin ID */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Bin ID <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="binId"
                  placeholder="e.g., BIN-2024-001"
                  value={formData.binId}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            {/* Severity */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Severity <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select name="severity" value={formData.severity} onChange={handleChange} required>
                  {severityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            {/* Alert Type */}
            <Col md={editAlert ? 4 : 6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Alert Type <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select name="type" value={formData.type} onChange={handleChange} required>
                  {typeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Status - Only show when editing */}
            {editAlert && (
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Status <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select name="status" value={formData.status} onChange={handleChange} required>
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}

            {/* Bin Capacity */}
            <Col md={editAlert ? 4 : 6}>
              <Form.Group className="mb-3">
                <Form.Label>Bin Capacity (%)</Form.Label>
                <Form.Control
                  type="number"
                  name="binCapacity"
                  placeholder="e.g., 85"
                  value={formData.binCapacity}
                  onChange={handleChange}
                  min="0"
                  max="100"
                />
                <Form.Text className="text-muted">Optional: Current fill level</Form.Text>
              </Form.Group>
            </Col>
          </Row>

          {/* Location */}
          <Form.Group className="mb-3">
            <Form.Label>
              <FaMapMarkerAlt className="me-2" />
              Location <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="location"
              placeholder="e.g., Downtown Plaza, Sector A"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Row>
            {/* Latitude */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Latitude (Optional)</Form.Label>
                <Form.Control
                  type="number"
                  name="latitude"
                  placeholder="e.g., 24.8607"
                  value={formData.latitude}
                  onChange={handleChange}
                  step="any"
                />
              </Form.Group>
            </Col>

            {/* Longitude */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Longitude (Optional)</Form.Label>
                <Form.Control
                  type="number"
                  name="longitude"
                  placeholder="e.g., 67.0011"
                  value={formData.longitude}
                  onChange={handleChange}
                  step="any"
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Description */}
          <Form.Group className="mb-3">
            <Form.Label>
              Description <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              placeholder="Describe the alert details..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </Form.Group>

          {/* Assigned To */}
          <Form.Group className="mb-3">
            <Form.Label>Assigned To (Optional)</Form.Label>
            <Form.Select
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
            >
              <option value="">Select Role...</option>
              <option value="Waste Collector">Waste Collector</option>
              <option value="WMA Manager/Admin">WMA Manager/Admin</option>
            </Form.Select>
            <Form.Text className="text-muted">Assign this alert to a specific role</Form.Text>
          </Form.Group>

          {/* Notes */}
          <Form.Group className="mb-3">
            <Form.Label>Additional Notes (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="notes"
              placeholder="Any additional information..."
              value={formData.notes}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleModalClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {editAlert ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <FaBell className="me-2" />
              {editAlert ? 'Update Alert' : 'Create Alert'}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NewAlertModal;

