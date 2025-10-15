import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Table, Badge, Modal, InputGroup, Toast, ToastContainer, Spinner } from "react-bootstrap";
import { FaTrash, FaPlus, FaMapMarkerAlt, FaSave, FaEdit, FaTimes, FaBell, FaExclamationTriangle } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const SensorUI = () => {
  const [dustbins, setDustbins] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBin, setEditingBin] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    binId: "",
    location: "",
    fillPercentage: 0,
    latitude: null,
    longitude: null,
  });

  const [mapCenter, setMapCenter] = useState([7.8731, 80.7718]); // Sri Lanka coordinates as default

  // Fetch dustbins on component mount
  useEffect(() => {
    fetchDustbins();
  }, []);

  const fetchDustbins = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:4000/api/dustbins');
      if (response.data.success) {
        setDustbins(response.data.dustbins);
      }
    } catch (error) {
      console.error('Error fetching dustbins:', error);
    } finally {
      setLoading(false);
    }
  };

  // Map click handler component
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setFormData(prev => ({
          ...prev,
          latitude: e.latlng.lat,
          longitude: e.latlng.lng
        }));
      },
    });

    return formData.latitude && formData.longitude ? (
      <Marker position={[formData.latitude, formData.longitude]} />
    ) : null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getFillStatus = (percentage) => {
    if (percentage <= 25) {
      return { label: "Empty", color: "success", icon: "🟢" };
    } else if (percentage <= 75) {
      return { label: "Half Full", color: "warning", icon: "🟡" };
    } else if (percentage <= 100) {
      return { label: "Full", color: "danger", icon: "🔴" };
    } else {
      return { label: "Overflow", color: "dark", icon: "⚫" };
    }
  };

  const checkAndNotify = (bin) => {
    const percentage = bin.fillPercentage;
    
    if (percentage > 100) {
      // Overflow notification
      const notification = {
        id: Date.now(),
        binId: bin.binId,
        location: bin.location,
        type: 'overflow',
        message: `OVERFLOW ALERT: Bin ${bin.binId} at ${bin.location} is overflowing (${percentage}%). Immediate attention required!`,
        timestamp: new Date().toLocaleString(),
        show: true
      };
      setNotifications(prev => [notification, ...prev]);
    } else if (percentage > 75) {
      // Full notification
      const notification = {
        id: Date.now(),
        binId: bin.binId,
        location: bin.location,
        type: 'full',
        message: `FULL ALERT: Bin ${bin.binId} at ${bin.location} is full (${percentage}%). Collection needed soon.`,
        timestamp: new Date().toLocaleString(),
        show: true
      };
      setNotifications(prev => [notification, ...prev]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.latitude || !formData.longitude) {
      alert("Please select a location on the map");
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const binData = {
        binId: formData.binId,
        location: formData.location,
        fillPercentage: parseInt(formData.fillPercentage),
        latitude: formData.latitude,
        longitude: formData.longitude
      };

      let response;
      
      if (editingBin) {
        // Update existing bin
        response = await axios.put(
          `http://localhost:4000/api/dustbins/${editingBin._id}`,
          binData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } else {
        // Create new bin
        response = await axios.post(
          'http://localhost:4000/api/dustbins',
          binData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }

      if (response.data.success) {
        // Check and send notification if bin is full or overflow
        checkAndNotify(response.data.dustbin);
        
        // Refresh the dustbins list
        fetchDustbins();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error saving dustbin:', error);
      alert(error.response?.data?.message || 'Failed to save dustbin. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (bin) => {
    setEditingBin(bin);
    setFormData({
      binId: bin.binId,
      location: bin.location,
      fillPercentage: bin.fillPercentage,
      latitude: bin.latitude,
      longitude: bin.longitude
    });
    setShowAddModal(true);
  };

  const handleDelete = async (binId) => {
    if (window.confirm("Are you sure you want to delete this bin?")) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(
          `http://localhost:4000/api/dustbins/${binId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          // Refresh the dustbins list
          fetchDustbins();
        }
      } catch (error) {
        console.error('Error deleting dustbin:', error);
        alert(error.response?.data?.message || 'Failed to delete dustbin. Please try again.');
      }
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingBin(null);
    setFormData({
      binId: "",
      location: "",
      fillPercentage: 0,
      latitude: null,
      longitude: null
    });
  };

  return (
    <Container fluid className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Toast Notifications */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        {notifications.map((notif) => (
          <Toast
            key={notif.id}
            show={notif.show}
            onClose={() => setNotifications(notifications.map(n => 
              n.id === notif.id ? { ...n, show: false } : n
            ))}
            delay={10000}
            autohide
            bg={notif.type === 'overflow' ? 'dark' : 'danger'}
          >
            <Toast.Header>
              <FaExclamationTriangle className="me-2 text-danger" />
              <strong className="me-auto">
                {notif.type === 'overflow' ? 'OVERFLOW ALERT' : 'FULL ALERT'}
              </strong>
              <small>{notif.timestamp}</small>
            </Toast.Header>
            <Toast.Body className="text-white">
              <div className="d-flex align-items-start">
                <FaBell size={20} className="me-2 mt-1" />
                <div>
                  <strong>Bin ID:</strong> {notif.binId}<br />
                  <strong>Location:</strong> {notif.location}<br />
                  <span className="mt-2 d-block">{notif.message}</span>
                </div>
              </div>
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>

      {/* Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-1">Sensor UI - Dustbin Management</h2>
            <p className="text-muted mb-0">
              Add and manage dustbins with real-time fill status monitoring
            </p>
          </div>
          {notifications.length > 0 && (
            <div className="position-relative">
              <Button variant="outline-danger" size="sm">
                <FaBell className="me-2" />
                Notifications
                <Badge bg="danger" pill className="ms-2">
                  {notifications.filter(n => n.show).length}
                </Badge>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Total Bins</p>
                  <h3 className="fw-bold mb-0">{dustbins.length}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <FaTrash size={24} className="text-primary" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Empty Bins</p>
                  <h3 className="fw-bold mb-0 text-success">
                    {dustbins.filter(b => b.fillPercentage <= 25).length}
                  </h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  🟢
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Half Full</p>
                  <h3 className="fw-bold mb-0 text-warning">
                    {dustbins.filter(b => b.fillPercentage > 25 && b.fillPercentage <= 75).length}
                  </h3>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  🟡
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Full/Overflow</p>
                  <h3 className="fw-bold mb-0 text-danger">
                    {dustbins.filter(b => b.fillPercentage > 75).length}
                  </h3>
                </div>
                <div className="bg-danger bg-opacity-10 p-3 rounded">
                  🔴
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add Bin Button */}
      <div className="mb-3">
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <FaPlus className="me-2" />
          Add New Dustbin
        </Button>
      </div>

      {/* Dustbins Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {dustbins.length === 0 ? (
            <div className="text-center py-5">
              <FaTrash size={50} className="text-muted mb-3" />
              <h5 className="text-muted">No Dustbins Added</h5>
              <p className="text-muted">Click "Add New Dustbin" to get started</p>
            </div>
          ) : (
            <Table hover responsive className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Bin ID</th>
                  <th>Location</th>
                  <th>Fill Status</th>
                  <th>Fill %</th>
                  <th>Coordinates</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dustbins.map((bin) => {
                  const status = getFillStatus(bin.fillPercentage);
                  return (
                    <tr key={bin.id}>
                      <td className="fw-semibold">{bin.binId}</td>
                      <td>{bin.location}</td>
                      <td>
                        <Badge bg={status.color}>
                          {status.icon} {status.label}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="progress flex-grow-1 me-2" style={{ height: '20px', width: '100px' }}>
                            <div
                              className={`progress-bar bg-${status.color}`}
                              role="progressbar"
                              style={{ width: `${bin.fillPercentage}%` }}
                              aria-valuenow={bin.fillPercentage}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            >
                              {bin.fillPercentage}%
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <small>
                          {bin.latitude.toFixed(4)}, {bin.longitude.toFixed(4)}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="link"
                            size="sm"
                            className="text-primary p-0"
                            onClick={() => handleEdit(bin)}
                            title="Edit"
                          >
                            <FaEdit size={16} />
                          </Button>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-danger p-0"
                            onClick={() => handleDelete(bin._id)}
                            title="Delete"
                          >
                            <FaTimes size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
          
          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="text-muted mt-3">Loading dustbins...</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Fill Status Legend */}
      <Card className="border-0 shadow-sm mt-3">
        <Card.Body>
          <h6 className="fw-bold mb-3">Fill Status Legend</h6>
          <Row>
            <Col md={3}>
              <div className="d-flex align-items-center mb-2">
                <Badge bg="success" className="me-2">🟢 Empty</Badge>
                <span className="text-muted">0-25%</span>
              </div>
            </Col>
            <Col md={3}>
              <div className="d-flex align-items-center mb-2">
                <Badge bg="warning" className="me-2">🟡 Half Full</Badge>
                <span className="text-muted">26-75%</span>
              </div>
            </Col>
            <Col md={3}>
              <div className="d-flex align-items-center mb-2">
                <Badge bg="danger" className="me-2">🔴 Full</Badge>
                <span className="text-muted">76-100%</span>
              </div>
            </Col>
            <Col md={3}>
              <div className="d-flex align-items-center mb-2">
                <Badge bg="dark" className="me-2">⚫ Overflow</Badge>
                <span className="text-muted">&gt;100%</span>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Add/Edit Bin Modal */}
      <Modal show={showAddModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingBin ? "Edit Dustbin" : "Add New Dustbin"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Bin ID <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="binId"
                    value={formData.binId}
                    onChange={handleChange}
                    placeholder="e.g., BIN-001"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Main Street"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>
                Fill Percentage: <strong>{formData.fillPercentage}%</strong>
                <Badge bg={getFillStatus(formData.fillPercentage).color} className="ms-2">
                  {getFillStatus(formData.fillPercentage).icon} {getFillStatus(formData.fillPercentage).label}
                </Badge>
              </Form.Label>
              <Form.Range
                name="fillPercentage"
                value={formData.fillPercentage}
                onChange={handleChange}
                min="0"
                max="120"
                step="1"
              />
              <div className="d-flex justify-content-between">
                <small className="text-muted">0%</small>
                <small className="text-muted">25%</small>
                <small className="text-muted">50%</small>
                <small className="text-muted">75%</small>
                <small className="text-muted">100%</small>
                <small className="text-muted">120%</small>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <FaMapMarkerAlt className="me-2" />
                Select Location on Map <span className="text-danger">*</span>
              </Form.Label>
              {formData.latitude && formData.longitude && (
                <div className="mb-2">
                  <small className="text-success">
                    Selected: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                  </small>
                </div>
              )}
              <div style={{ height: "400px", borderRadius: "8px", overflow: "hidden" }}>
                <MapContainer
                  center={mapCenter}
                  zoom={8}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker />
                </MapContainer>
              </div>
              <Form.Text className="text-muted">
                Click anywhere on the map to select the bin location
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  {editingBin ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>
                  <FaSave className="me-2" />
                  {editingBin ? "Update Bin" : "Add Bin"}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default SensorUI;

