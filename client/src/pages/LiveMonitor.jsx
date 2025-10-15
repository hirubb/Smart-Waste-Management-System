import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Card, Form, Button, Badge, Navbar, Nav } from "react-bootstrap";
import { FaSync, FaMap, FaList, FaSearch, FaSignOutAlt, FaTimes } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
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

const LiveMonitor = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [dustbins, setDustbins] = useState([]);
  const [filteredBins, setFilteredBins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFillStatus, setSelectedFillStatus] = useState([]);
  const [selectedBinType, setSelectedBinType] = useState("all");
  const [selectedZone, setSelectedZone] = useState("all");
  const [selectedRoute, setSelectedRoute] = useState("all");
  const [mapCenter] = useState([7.8731, 80.7718]); // Sri Lanka

  useEffect(() => {
    fetchDustbins();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDustbins();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterBins();
  }, [dustbins, searchTerm, selectedFillStatus, selectedBinType, selectedZone, selectedRoute]);

  const fetchDustbins = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/api/dustbins');
      
      if (response.data.success) {
        setDustbins(response.data.dustbins);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching dustbins:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBins = () => {
    let filtered = [...dustbins];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(bin =>
        bin.binId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bin.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Fill status filter
    if (selectedFillStatus.length > 0) {
      filtered = filtered.filter(bin => selectedFillStatus.includes(bin.status));
    }

    setFilteredBins(filtered);
  };

  const handleFillStatusToggle = (status) => {
    setSelectedFillStatus(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedFillStatus([]);
    setSelectedBinType("all");
    setSelectedZone("all");
    setSelectedRoute("all");
  };

  const getMarkerColor = (status) => {
    switch (status) {
      case 'Empty':
        return '#28a745'; // Green
      case 'Half Full':
        return '#ffc107'; // Orange
      case 'Full':
        return '#dc3545'; // Red
      case 'Overflow':
        return '#6c757d'; // Dark gray
      default:
        return '#007bff';
    }
  };

  const getBinCount = (status) => {
    return dustbins.filter(bin => bin.status === status).length;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getTimeAgo = () => {
    const now = new Date();
    const diff = Math.floor((now - lastUpdated) / 1000); // seconds
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <>
      {/* Custom Navigation Bar */}
      <Navbar bg="white" expand="lg" className="shadow-sm px-4 py-3" style={{ borderBottom: '2px solid #e0e0e0' }}>
        <Container fluid>
          {/* WasteWise Logo */}
          <Navbar.Brand as={Link} to="/dashboard" className="fw-bold" style={{ fontSize: '1.5rem', color: '#2c3e50' }}>
            WasteWise
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="live-monitor-navbar" />
          
          <Navbar.Collapse id="live-monitor-navbar">
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
              <Nav.Link as={Link} to="/live-monitor" className="mx-2 px-3 py-2" style={{ 
                border: '1px solid #d0d0d0', 
                borderRadius: '4px',
                color: '#333',
                fontWeight: '500',
                backgroundColor: '#f0f0f0'
              }}>
                Live Monitor
              </Nav.Link>
              <Nav.Link as={Link} to="/alert-management" className="mx-2 px-3 py-2" style={{ 
                border: '1px solid #d0d0d0', 
                borderRadius: '4px',
                color: '#333',
                fontWeight: '500'
              }}>
                Alerts
              </Nav.Link>
              <Nav.Link as={Link} to="/reports" className="mx-2 px-3 py-2" style={{ 
                border: '1px solid #d0d0d0', 
                borderRadius: '4px',
                color: '#333',
                fontWeight: '500'
              }}>
                Reports
              </Nav.Link>
              <Nav.Link as={Link} to="/settings" className="mx-2 px-3 py-2" style={{ 
                border: '1px solid #d0d0d0', 
                borderRadius: '4px',
                color: '#333',
                fontWeight: '500'
              }}>
                Settings
              </Nav.Link>
            </Nav>

            {/* Right Side - Live Badge and Logout */}
            <div className="d-flex align-items-center gap-3">
              <Badge bg="success" className="px-3 py-2" style={{ fontSize: '0.9rem' }}>
                Live monitoring active - {dustbins.length} bins online
              </Badge>
              <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                <FaSignOutAlt className="me-2" />
                Logout
              </Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <Container fluid className="p-0" style={{ height: 'calc(100vh - 80px)' }}>
        <Row className="g-0 h-100">
          {/* Left Sidebar - Filters */}
          <Col md={3} className="bg-light border-end" style={{ overflowY: 'auto' }}>
            <div className="p-4">
              <h5 className="mb-4 fw-bold bg-dark text-white p-2">Filters & Search</h5>

              {/* Search Bins */}
              <div className="mb-4">
                <h6 className="mb-2 fw-bold bg-dark text-white p-2">Search Bins</h6>
                <Form.Control
                  type="text"
                  placeholder="Bin ID or Location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Fill Status */}
              <div className="mb-4">
                <h6 className="mb-3 fw-bold bg-secondary text-white p-2">Fill Status</h6>
                <div className="d-flex flex-column gap-2">
                  <Form.Check
                    type="checkbox"
                    id="status-empty"
                    label={
                      <span>
                        <span className="badge bg-success me-2">■</span>
                        Empty (0-25%) - {getBinCount('Empty')}
                      </span>
                    }
                    checked={selectedFillStatus.includes('Empty')}
                    onChange={() => handleFillStatusToggle('Empty')}
                  />
                  <Form.Check
                    type="checkbox"
                    id="status-half"
                    label={
                      <span>
                        <span className="badge bg-warning me-2">■</span>
                        Half Full (26-75%) - {getBinCount('Half Full')}
                      </span>
                    }
                    checked={selectedFillStatus.includes('Half Full')}
                    onChange={() => handleFillStatusToggle('Half Full')}
                  />
                  <Form.Check
                    type="checkbox"
                    id="status-full"
                    label={
                      <span>
                        <span className="badge bg-danger me-2">■</span>
                        Full (76-100%) - {getBinCount('Full')}
                      </span>
                    }
                    checked={selectedFillStatus.includes('Full')}
                    onChange={() => handleFillStatusToggle('Full')}
                  />
                  <Form.Check
                    type="checkbox"
                    id="status-overflow"
                    label={
                      <span>
                        <span className="badge bg-dark me-2">■</span>
                        Overflow - {getBinCount('Overflow')}
                      </span>
                    }
                    checked={selectedFillStatus.includes('Overflow')}
                    onChange={() => handleFillStatusToggle('Overflow')}
                  />
                </div>
              </div>

              {/* Bin Type */}
              <div className="mb-4">
                <h6 className="mb-2 fw-bold bg-secondary text-white p-2">Bin Type</h6>
                <Form.Select
                  value={selectedBinType}
                  onChange={(e) => setSelectedBinType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="general">General Waste</option>
                  <option value="recyclable">Recyclable</option>
                  <option value="organic">Organic</option>
                </Form.Select>
              </div>

              {/* Location Zone */}
              <div className="mb-4">
                <h6 className="mb-2 fw-bold bg-secondary text-white p-2">Location Zone</h6>
                <Form.Select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                >
                  <option value="all">All Zones</option>
                  <option value="zone1">Zone 1</option>
                  <option value="zone2">Zone 2</option>
                  <option value="zone3">Zone 3</option>
                </Form.Select>
              </div>

              {/* Collection Route */}
              <div className="mb-4">
                <h6 className="mb-2 fw-bold bg-secondary text-white p-2">Collection Route</h6>
                <Form.Select
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                >
                  <option value="all">All Routes</option>
                  <option value="route1">Route 1</option>
                  <option value="route2">Route 2</option>
                  <option value="route3">Route 3</option>
                </Form.Select>
              </div>

              {/* Clear Filters */}
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={clearAllFilters}
              >
                Clear All Filters
              </Button>
            </div>
          </Col>

          {/* Right Side - Map */}
          <Col md={9} className="p-0 position-relative">
            {/* Top Controls */}
            <div className="p-3 bg-white border-bottom d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                <Badge bg="danger" className="px-3 py-2">
                  Live
                </Badge>
                <span className="text-muted">
                  Last updated: {getTimeAgo()}
                </span>
              </div>
              <div className="d-flex gap-2">
                <Button variant="outline-primary" size="sm" onClick={fetchDustbins} disabled={loading}>
                  <FaSync className={loading ? "spin" : ""} />
                  <span className="ms-2">Refresh</span>
                </Button>
                <Button variant="outline-secondary" size="sm">
                  <FaMap className="me-2" />
                  Map View
                </Button>
                <Button variant="outline-secondary" size="sm">
                  Legend
                </Button>
              </div>
            </div>

            {/* Map Container */}
            <div style={{ height: 'calc(100vh - 180px)' }}>
              <MapContainer
                center={mapCenter}
                zoom={8}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {filteredBins.map((bin) => (
                  <CircleMarker
                    key={bin._id}
                    center={[bin.latitude, bin.longitude]}
                    radius={10}
                    fillColor={getMarkerColor(bin.status)}
                    color="#fff"
                    weight={2}
                    opacity={1}
                    fillOpacity={0.8}
                  >
                    <Popup>
                      <div style={{ minWidth: '200px' }}>
                        <h6 className="fw-bold mb-2">{bin.binId}</h6>
                        <p className="mb-1"><strong>Location:</strong> {bin.location}</p>
                        <p className="mb-1">
                          <strong>Status:</strong>{' '}
                          <Badge bg={bin.status === 'Empty' ? 'success' : bin.status === 'Half Full' ? 'warning' : bin.status === 'Full' ? 'danger' : 'dark'}>
                            {bin.status}
                          </Badge>
                        </p>
                        <p className="mb-1"><strong>Fill Level:</strong> {bin.fillPercentage}%</p>
                        <div className="progress mt-2" style={{ height: '20px' }}>
                          <div
                            className={`progress-bar bg-${bin.status === 'Empty' ? 'success' : bin.status === 'Half Full' ? 'warning' : bin.status === 'Full' ? 'danger' : 'dark'}`}
                            role="progressbar"
                            style={{ width: `${bin.fillPercentage}%` }}
                          >
                            {bin.fillPercentage}%
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>

            {/* Legend Overlay */}
            <Card 
              className="position-absolute shadow-sm" 
              style={{ 
                bottom: '20px', 
                left: '20px', 
                zIndex: 1000,
                minWidth: '250px'
              }}
            >
              <Card.Body className="p-3">
                <h6 className="fw-bold mb-3 bg-secondary text-white p-2">Bin Status Legend</h6>
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex align-items-center">
                    <span className="badge bg-success me-2" style={{ width: '20px', height: '20px' }}>■</span>
                    <span>Empty (0-25%)</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className="badge bg-warning me-2" style={{ width: '20px', height: '20px' }}>■</span>
                    <span>Half Full (26-75%)</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className="badge bg-danger me-2" style={{ width: '20px', height: '20px' }}>■</span>
                    <span>Full (76-100%)</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className="badge bg-dark me-2" style={{ width: '20px', height: '20px' }}>■</span>
                    <span>Overflow</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </>
  );
};

export default LiveMonitor;

