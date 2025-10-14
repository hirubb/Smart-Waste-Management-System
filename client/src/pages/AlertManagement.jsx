import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup, Dropdown } from "react-bootstrap";
import { FaBell, FaSearch, FaPlus, FaSync, FaEllipsisV, FaUserCircle } from "react-icons/fa";
import { Line, Pie } from "react-chartjs-2";
import NewAlertModal from "../components/NewAlertModal";
import axios from "axios";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler
);

const AlertManagement = () => {
  // State management
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedTime, setSelectedTime] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [timeFilter, setTimeFilter] = useState("This Month");
  const [showNewAlertModal, setShowNewAlertModal] = useState(false);

  // Fetch alerts from API
  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/api/alerts');
      
      if (response.data.success) {
        // Format the dates for display
        const formattedAlerts = response.data.alerts.map(alert => ({
          ...alert,
          id: alert._id,
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
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      setAlerts([]);
      setFilteredAlerts([]);
      setLoading(false);
    }
  };

  const handleAlertCreated = (newAlert) => {
    // Refresh the alerts list
    fetchAlerts();
  };

  // Filter alerts based on search and filters
  useEffect(() => {
    let filtered = alerts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.binId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Chart data - dynamically calculated from alerts
  const criticalCount = alerts.filter(a => a.severity === 'Critical').length;
  const highCount = alerts.filter(a => a.severity === 'High').length;
  const mediumCount = alerts.filter(a => a.severity === 'Medium').length;
  const lowCount = alerts.filter(a => a.severity === 'Low').length;
  
  const alertsByType = {
    labels: ['Critical Alerts', 'High Priority', 'Medium Priority', 'Low Priority'],
    datasets: [{
      data: [criticalCount, highCount, mediumCount, lowCount],
      backgroundColor: ['#dc3545', '#fd7e14', '#0d6efd', '#28a745'],
      borderWidth: 0
    }]
  };

  const alertTrendsData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Critical',
        data: [0, 0, 0, criticalCount],
        borderColor: '#dc3545',
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'High',
        data: [0, 0, 0, highCount],
        borderColor: '#fd7e14',
        backgroundColor: 'rgba(253, 126, 20, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Medium',
        data: [0, 0, 0, mediumCount],
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const getSeverityBadge = (severity) => {
    const variants = {
      Critical: 'danger',
      High: 'warning',
      Medium: 'primary',
      Low: 'success'
    };
    return <Badge bg={variants[severity]}>{severity}</Badge>;
  };

  const getStatusBadge = (status) => {
    const variants = {
      Open: 'danger',
      'In Progress': 'info',
      Resolved: 'success'
    };
    const labels = {
      Open: 'Open',
      'In Progress': 'In Progress',
      Resolved: 'Resolved'
    };
    return <Badge bg={variants[status]} style={{ minWidth: '90px' }}>{labels[status]}</Badge>;
  };

  const handleRefresh = () => {
    fetchAlerts();
  };

  return (
    <Container fluid className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div className="mb-3">
        <span className="text-muted">Dashboard</span>
        <span className="mx-2 text-muted">{'>'}</span>
        <span className="fw-bold">Alert Management</span>
      </div>

      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Alert Management</h2>
        <p className="text-muted">
          Monitor and manage all system-generated alerts for waste bins. Take action on critical issues to ensure optimal system performance.
        </p>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={3}>
              <InputGroup>
                <InputGroup.Text className="bg-white">
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Form.Select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
              >
                <option value="all">🔔 Severity</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">📊 Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">🗂️ Type</option>
                <option value="Bin Full">Bin Full</option>
                <option value="Maintenance Required">Maintenance</option>
                <option value="Odor Detection">Odor</option>
                <option value="Fire Hazard">Fire Hazard</option>
              </Form.Select>
            </Col>
            <Col md={1}>
              <Form.Select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              >
                <option value="all">⏰ Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </Form.Select>
            </Col>
            <Col md={2} className="text-end">
              <Button variant="primary" className="me-2" onClick={() => setShowNewAlertModal(true)}>
                <FaPlus className="me-2" />
                New Alert
              </Button>
              <Button variant="outline-secondary" onClick={handleRefresh}>
                <FaSync className="me-2" />
                Refresh
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Alerts Table */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading alerts...</p>
            </div>
          ) : currentAlerts.length === 0 ? (
            <div className="text-center py-5">
              <FaBell size={50} className="text-muted mb-3" />
              <h5 className="text-muted">No Alerts Found</h5>
              <p className="text-muted">
                {searchTerm || selectedSeverity !== 'all' || selectedStatus !== 'all' || selectedType !== 'all'
                  ? 'No alerts match your current filters. Try adjusting your search criteria.'
                  : 'There are currently no bin alerts in the system. New alerts will appear here when bins require attention.'}
              </p>
            </div>
          ) : (
            <Table hover responsive className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th style={{ width: '40px' }}>
                    <Form.Check type="checkbox" />
                  </th>
                  <th>Alert ID ↕</th>
                  <th>Bin ID ↕</th>
                  <th>Location ↕</th>
                  <th>Created At ↕</th>
                  <th>Severity ↕</th>
                  <th>Status ↕</th>
                  <th>Assigned To</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentAlerts.map((alert) => (
                  <tr key={alert.id}>
                    <td>
                      <Form.Check type="checkbox" />
                    </td>
                    <td className="fw-semibold">{alert.id}</td>
                    <td>
                      <a href="#" className="text-primary text-decoration-none">
                        {alert.binId}
                      </a>
                    </td>
                    <td>
                      <a href="#" className="text-primary text-decoration-none">
                        {alert.location}
                      </a>
                    </td>
                    <td>{alert.createdAt}</td>
                    <td>{getSeverityBadge(alert.severity)}</td>
                    <td>{getStatusBadge(alert.status)}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FaUserCircle className="me-2 text-muted" size={20} />
                        {alert.assignedTo}
                      </div>
                    </td>
                    <td>
                      <Button variant="link" size="sm" className="text-secondary p-0">
                        <FaEllipsisV />
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
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAlerts.length)} of {filteredAlerts.length} alerts
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

      {/* Charts Section */}
      <Row>
        <Col md={12} className="mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="fw-bold">Alert Trends Overview</h4>
            <Form.Select style={{ width: 'auto' }} value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
              <option>This Month ▼</option>
              <option>This Week</option>
              <option>Last 3 Months</option>
            </Form.Select>
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={5}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h5 className="mb-4">Alerts by Type</h5>
              <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Pie data={alertsByType} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
              </div>
              <div className="mt-3">
                <div className="d-flex align-items-center mb-2">
                  <span className="badge bg-danger me-2" style={{ width: '12px', height: '12px', borderRadius: '50%' }}></span>
                  <span>Critical Alerts</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={7}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h5 className="mb-4">Alert Trends Over Time</h5>
              <div style={{ height: '300px' }}>
                <Line
                  data={alertTrendsData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: 'bottom'
                      },
                      title: {
                        display: true,
                        text: 'Line Chart - Alert Frequency Over Time',
                        position: 'bottom'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* New Alert Modal */}
      <NewAlertModal 
        show={showNewAlertModal} 
        handleClose={() => setShowNewAlertModal(false)}
        onAlertCreated={handleAlertCreated}
      />
    </Container>
  );
};

export default AlertManagement;

