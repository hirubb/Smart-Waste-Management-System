import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup, Navbar, Nav, ListGroup } from "react-bootstrap";
import { FaBell, FaSearch, FaSync, FaUserCircle, FaEdit, FaTrash, FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import NewAlertModal from "../components/NewAlertModal";
import axios from "axios";

const AdminRoutes = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // State management
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNewAlertModal, setShowNewAlertModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);

  // Fetch alerts from API - filtered for WMA Manager/Admin
  useEffect(() => {
    fetchAlerts();
  }, []);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.position-relative')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/api/alerts');
      
      if (response.data.success) {
        // Filter alerts assigned to WMA Manager/Admin or All
        const adminAlerts = response.data.alerts.filter(
          alert => alert.assignedTo === "WMA Manager/Admin" || alert.assignedTo === "All"
        );

        // Format the dates for display
        const formattedAlerts = adminAlerts.map(alert => ({
          ...alert,
          id: alert.alertId || alert._id,
          _id: alert._id,
          createdAtOriginal: alert.createdAt,
          createdAt: new Date(alert.createdAt).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })
        }));
        
        setAlerts(formattedAlerts);
        setFilteredAlerts(formattedAlerts);
        
        // Generate notifications after alerts are loaded
        setTimeout(() => {
          generateNotificationsFromAlerts(formattedAlerts);
        }, 100);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      setAlerts([]);
      setFilteredAlerts([]);
      setLoading(false);
    }
  };

  const generateNotificationsFromAlerts = (alertsList) => {
    const notifs = [];
    
    alertsList.forEach((alert) => {
      let notifType = 'info';
      let title = '';
      
      // Determine notification type based on severity
      if (alert.severity === 'Critical') {
        notifType = 'critical';
        title = 'Critical Alert';
      } else if (alert.severity === 'High') {
        notifType = 'warning';
        title = 'High Priority Alert';
      } else if (alert.severity === 'Medium') {
        notifType = 'info';
        title = 'Medium Priority Alert';
      } else if (alert.severity === 'Low') {
        notifType = 'success';
        title = 'Low Priority Alert';
      }

      // Create notification message
      const message = `Bin ${alert.binId} at ${alert.location} - ${alert.type}`;
      
      // Calculate time ago
      const createdDate = new Date(alert.createdAtOriginal || alert.createdAt);
      const now = new Date();
      const diffInHours = Math.floor((now - createdDate) / (1000 * 60 * 60));
      let timeAgo = '';
      
      if (diffInHours < 1) {
        timeAgo = 'Just now';
      } else if (diffInHours < 24) {
        timeAgo = `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        timeAgo = `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
      }

      notifs.push({
        id: alert._id,
        title: title,
        message: message,
        time: timeAgo,
        type: notifType,
        read: alert.status === 'Resolved'
      });
    });
    
    setNotifications(notifs);
  };

  // Filter alerts based on search and filters
  useEffect(() => {
    let filtered = alerts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(alert =>
        (alert.id && alert.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (alert.alertId && alert.alertId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (alert.binId && alert.binId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (alert.location && alert.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Severity filter
    if (selectedSeverity !== "all") {
      filtered = filtered.filter(alert => alert.severity === selectedSeverity);
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(alert => alert.status === selectedStatus);
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter(alert => alert.type === selectedType);
    }

    setFilteredAlerts(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedSeverity, selectedStatus, selectedType, alerts]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAlerts = filteredAlerts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);

  const getSeverityBadge = (severity) => {
    const variants = {
      Critical: { bg: 'danger', icon: <FaExclamationTriangle className="me-1" /> },
      High: { bg: 'warning', icon: <FaExclamationTriangle className="me-1" /> },
      Medium: { bg: 'primary', icon: <FaInfoCircle className="me-1" /> },
      Low: { bg: 'success', icon: <FaCheckCircle className="me-1" /> }
    };
    const config = variants[severity] || variants.Medium;
    return (
      <Badge bg={config.bg}>
        {config.icon}
        {severity}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    const variants = {
      Open: 'danger',
      'In Progress': 'info',
      Resolved: 'success'
    };
    return (
      <Badge bg={variants[status]} style={{ minWidth: '90px' }}>
        {status}
      </Badge>
    );
  };

  const handleStatusChange = async (alertId, newStatus) => {
    try {
      const response = await axios.put(`http://localhost:4000/api/alerts/${alertId}`, {
        status: newStatus
      });

      if (response.data.success) {
        // Update the local state
        const updatedAlerts = alerts.map(alert =>
          alert._id === alertId ? { ...alert, status: newStatus } : alert
        );
        setAlerts(updatedAlerts);
        
        // Also update filtered alerts
        const updatedFiltered = filteredAlerts.map(alert =>
          alert._id === alertId ? { ...alert, status: newStatus } : alert
        );
        setFilteredAlerts(updatedFiltered);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  const handleEditClick = (alert) => {
    setEditingAlert(alert);
    setShowNewAlertModal(true);
  };

  const handleAlertCreated = (newAlert) => {
    fetchAlerts();
    setEditingAlert(null);
  };

  const handleModalClose = () => {
    setShowNewAlertModal(false);
    setEditingAlert(null);
  };

  const handleRefresh = () => {
    fetchAlerts();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAsRead = (notificationId) => {
    setNotifications(notifications.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const deleteNotification = (notificationId) => {
    setNotifications(notifications.filter(notif => notif.id !== notificationId));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Custom Navigation Bar */}
      <Navbar bg="white" expand="lg" className="shadow-sm px-4 py-3" style={{ borderBottom: '2px solid #e0e0e0' }}>
        <Container fluid>
          {/* WasteWise Logo */}
          <Navbar.Brand as={Link} to="/dashboard" className="fw-bold" style={{ fontSize: '1.5rem', color: '#2c3e50' }}>
            WasteWise
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="admin-navbar" />
          
          <Navbar.Collapse id="admin-navbar">
            {/* Center Navigation Links */}
            <Nav className="mx-auto">
              <Nav.Link as={Link} to="/dashboard" className="mx-2 px-3 py-2" style={{ 
                border: '1px solid #d0d0d0', 
                borderRadius: '4px',
                color: '#333',
                fontWeight: '500'
              }}>
                Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="/admin-routes" className="mx-2 px-3 py-2" style={{ 
                border: '1px solid #d0d0d0', 
                borderRadius: '4px',
                color: '#333',
                fontWeight: '500',
                backgroundColor: '#f0f0f0'
              }}>
                Assigned Routes
              </Nav.Link>
              <Nav.Link as={Link} to="/alert-management" className="mx-2 px-3 py-2" style={{ 
                border: '1px solid #d0d0d0', 
                borderRadius: '4px',
                color: '#333',
                fontWeight: '500'
              }}>
                All Alerts
              </Nav.Link>
              <Nav.Link as={Link} to="/reports" className="mx-2 px-3 py-2" style={{ 
                border: '1px solid #d0d0d0', 
                borderRadius: '4px',
                color: '#333',
                fontWeight: '500'
              }}>
                Reports
              </Nav.Link>
            </Nav>

            {/* Right side - Notification and User */}
            <Nav className="align-items-center">
              <div className="position-relative me-3">
                <Button 
                  variant="link" 
                  className="text-dark p-2"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <FaBell size={20} />
                  {unreadCount > 0 && (
                    <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle" style={{ fontSize: '0.6rem' }}>
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
                
                {/* Notification Dropdown */}
                {showNotifications && (
                  <div 
                    className="position-absolute bg-white border rounded shadow-lg"
                    style={{ 
                      top: '100%', 
                      right: 0, 
                      width: '350px', 
                      maxHeight: '400px', 
                      overflowY: 'auto',
                      zIndex: 1000,
                      marginTop: '8px'
                    }}
                  >
                    <div className="px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
                      <h6 className="mb-0 fw-bold">Notifications</h6>
                      {unreadCount > 0 && (
                        <Badge bg="primary" pill>{unreadCount} New</Badge>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="text-center py-4 text-muted">
                        <FaBell size={30} className="mb-2" />
                        <p className="mb-0">No notifications</p>
                      </div>
                    ) : (
                      <ListGroup variant="flush">
                        {notifications.map((notif) => (
                          <ListGroup.Item 
                            key={notif.id} 
                            className={`px-3 py-2 ${!notif.read ? 'bg-light' : ''}`}
                            style={{ cursor: 'pointer', border: 'none' }}
                          >
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1" onClick={() => markAsRead(notif.id)}>
                                <div className="d-flex align-items-center mb-1">
                                  {notif.type === 'critical' && <FaExclamationTriangle className="text-danger me-2" />}
                                  {notif.type === 'warning' && <FaExclamationTriangle className="text-warning me-2" />}
                                  {notif.type === 'success' && <FaCheckCircle className="text-success me-2" />}
                                  {notif.type === 'info' && <FaInfoCircle className="text-primary me-2" />}
                                  <strong className="mb-0" style={{ fontSize: '0.9rem' }}>{notif.title}</strong>
                                </div>
                                <p className="mb-1 text-muted" style={{ fontSize: '0.85rem' }}>{notif.message}</p>
                                <small className="text-muted">{notif.time}</small>
                              </div>
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="text-muted p-0 ms-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notif.id);
                                }}
                              >
                                <FaTimes />
                              </Button>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}
                    {notifications.length > 0 && (
                      <div className="px-3 py-2 border-top text-center">
                        <Button variant="link" size="sm" className="text-decoration-none">
                          View All Notifications
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="d-flex align-items-center">
                <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                     style={{ width: '35px', height: '35px', fontSize: '1rem' }}>
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={handleLogout}
                  className="ms-2"
                >
                  Logout
                </Button>
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        {/* Breadcrumb */}
        <div className="mb-3">
          <span className="text-muted">Dashboard</span>
          <span className="mx-2 text-muted">{'>'}</span>
          <span className="fw-bold">Assigned Routes (Admin)</span>
        </div>

      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">My Assigned Routes</h2>
        <p className="text-muted">
          View and manage waste collection routes and alerts assigned to you as WMA Manager/Admin.
        </p>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row className="align-items-center g-2">
            <Col lg={4} md={12}>
              <InputGroup>
                <InputGroup.Text className="bg-white">
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search routes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col lg="auto" md={6} sm={6}>
              <Form.Select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                style={{ minWidth: '140px' }}
              >
                <option value="all">🔔 Severity</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </Form.Select>
            </Col>
            <Col lg="auto" md={6} sm={6}>
              <Form.Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{ minWidth: '140px' }}
              >
                <option value="all">📊 Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </Form.Select>
            </Col>
            <Col lg="auto" md={6} sm={6}>
              <Form.Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{ minWidth: '150px' }}
              >
                <option value="all">🗂️ Type</option>
                <option value="Bin Full">Bin Full</option>
                <option value="Maintenance Required">Maintenance</option>
                <option value="Odor Detection">Odor</option>
                <option value="Fire Hazard">Fire Hazard</option>
              </Form.Select>
            </Col>
            <Col lg="auto" md={12} className="d-flex justify-content-end gap-2 ms-auto">
              <Button variant="outline-secondary" onClick={handleRefresh}>
                <FaSync className="me-1" />
                Refresh
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Routes Table */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading assigned routes...</p>
            </div>
          ) : currentAlerts.length === 0 ? (
            <div className="text-center py-5">
              <FaBell size={50} className="text-muted mb-3" />
              <h5 className="text-muted">No Assigned Routes Found</h5>
              <p className="text-muted">
                {searchTerm || selectedSeverity !== 'all' || selectedStatus !== 'all' || selectedType !== 'all'
                  ? 'No routes match your current filters. Try adjusting your search criteria.'
                  : 'You currently have no assigned alerts. New assignments will appear here.'}
              </p>
            </div>
          ) : (
            <Table hover responsive className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Alert ID</th>
                  <th>Bin ID</th>
                  <th>Location</th>
                  <th>Created At</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentAlerts.map((alert) => (
                  <tr key={alert.id}>
                    <td className="fw-semibold">{alert.id}</td>
                    <td>
                      <span className="text-primary">
                        {alert.binId}
                      </span>
                    </td>
                    <td>
                      <span className="text-primary">
                        {alert.location}
                      </span>
                    </td>
                    <td>{alert.createdAt}</td>
                    <td>{getSeverityBadge(alert.severity)}</td>
                    <td>
                      <Form.Select
                        value={alert.status}
                        onChange={(e) => handleStatusChange(alert._id, e.target.value)}
                        size="sm"
                        style={{ minWidth: '130px' }}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </Form.Select>
                    </td>
                    <td>{alert.type}</td>
                    <td>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="text-primary p-0" 
                        onClick={() => handleEditClick(alert)}
                        title="Edit"
                      >
                        <FaEdit size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {/* Pagination */}
          {!loading && filteredAlerts.length > 0 && (
            <div className="d-flex justify-content-between align-items-center p-3 border-top">
              <div className="text-muted">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAlerts.length)} of {filteredAlerts.length} routes
              </div>
            <div className="d-flex gap-1">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                «
              </Button>
              {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "primary" : "outline-secondary"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <Button variant="outline-secondary" size="sm" disabled>
                    ...
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    {totalPages}
                  </Button>
                </>
              )}
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                »
              </Button>
            </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Edit Alert Modal */}
      <NewAlertModal 
        show={showNewAlertModal} 
        handleClose={handleModalClose}
        onAlertCreated={handleAlertCreated}
        editAlert={editingAlert}
      />
      </Container>
    </>
  );
};

export default AdminRoutes;

