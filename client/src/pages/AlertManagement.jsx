import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup, Modal, Navbar, Nav, ListGroup } from "react-bootstrap";
import { FaBell, FaSearch, FaPlus, FaSync, FaUserCircle, FaEdit, FaTrash, FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaTimes } from "react-icons/fa";
import { Line, Pie } from "react-chartjs-2";
import { Link, useNavigate } from "react-router-dom";
import NewAlertModal from "../components/NewAlertModal";
import { AuthContext } from "../context/AuthContext";
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
  const [selectedTime, setSelectedTime] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [timeFilter, setTimeFilter] = useState("This Month");
  const [showNewAlertModal, setShowNewAlertModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [alertToDelete, setAlertToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Fetch alerts and notifications from API
  useEffect(() => {
    fetchAlerts();
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/notifications');
      
      if (response.data.success) {
        // Format notifications from backend
        const backendNotifs = response.data.notifications.map(notif => ({
          id: notif._id,
          title: notif.title,
          message: notif.message,
          time: getTimeAgo(notif.createdAt),
          type: notif.severity === 'critical' ? 'error' : notif.severity === 'warning' ? 'warning' : 'info',
          read: notif.isRead,
          binId: notif.binId,
          location: notif.location,
          fillPercentage: notif.fillPercentage,
          notificationType: notif.type,
          dbId: notif._id
        }));
        
        // Merge with existing notifications from alerts
        setNotifications(prev => {
          const alertNotifs = prev.filter(n => !n.dbId); // Keep only alert-generated notifications
          return [...backendNotifs, ...alertNotifs];
        });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

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
        // Format the dates for display
        const formattedAlerts = response.data.alerts.map(alert => ({
          ...alert,
          id: alert.alertId || alert._id, // Use alertId for display
          _id: alert._id, // Keep MongoDB ID for API operations
          createdAtOriginal: alert.createdAt, // Keep original date for filtering
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
          fetchNotifications(); // Also fetch backend notifications
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
    const alertNotifs = [];
    
    // Generate notifications for all alerts
    alertsList.forEach((alert) => {
      // Notifications for status updates by Waste Collector or All
      if (alert.assignedTo === "Waste Collector" || alert.assignedTo === "All") {
        if (alert.status === "In Progress") {
          alertNotifs.push({
            id: `collector-progress-${alert._id}`,
            title: `${alert.assignedTo === "All" ? "Team" : "Waste Collector"} Working on Alert`,
            message: `${alert.assignedTo === "All" ? "Team member" : "Waste Collector"} is working on alert ${alert.id || alert.alertId} - Bin ${alert.binId} at ${alert.location}`,
            time: getTimeAgo(alert.updatedAt || alert.createdAtOriginal),
            type: "info",
            read: false
          });
        } else if (alert.status === "Resolved") {
          alertNotifs.push({
            id: `collector-resolved-${alert._id}`,
            title: `Alert Resolved by ${alert.assignedTo === "All" ? "Team" : "Waste Collector"}`,
            message: `${alert.assignedTo === "All" ? "Team member" : "Waste Collector"} resolved alert ${alert.id || alert.alertId} - Bin ${alert.binId} at ${alert.location}`,
            time: getTimeAgo(alert.updatedAt || alert.createdAtOriginal),
            type: "success",
            read: false
          });
        }
      }
      
      // Notifications for status updates by WMA Manager/Admin or All
      if (alert.assignedTo === "WMA Manager/Admin" || alert.assignedTo === "All") {
        if (alert.status === "In Progress") {
          alertNotifs.push({
            id: `admin-progress-${alert._id}`,
            title: `${alert.assignedTo === "All" ? "Team" : "WMA Manager/Admin"} Working on Alert`,
            message: `${alert.assignedTo === "All" ? "Team member" : "WMA Manager/Admin"} is working on alert ${alert.id || alert.alertId} - Bin ${alert.binId} at ${alert.location}`,
            time: getTimeAgo(alert.updatedAt || alert.createdAtOriginal),
            type: "info",
            read: false
          });
        } else if (alert.status === "Resolved") {
          alertNotifs.push({
            id: `admin-resolved-${alert._id}`,
            title: `Alert Resolved by ${alert.assignedTo === "All" ? "Team" : "WMA Manager/Admin"}`,
            message: `${alert.assignedTo === "All" ? "Team member" : "WMA Manager/Admin"} resolved alert ${alert.id || alert.alertId} - Bin ${alert.binId} at ${alert.location}`,
            time: getTimeAgo(alert.updatedAt || alert.createdAtOriginal),
            type: "success",
            read: false
          });
        }
      }
      
      // Notifications for critical alerts
      if (alert.severity === "Critical" && alert.status === "Open") {
        alertNotifs.push({
          id: `critical-${alert._id}`,
          title: "Critical Alert Requires Attention",
          message: `Critical ${alert.type} alert at ${alert.location}. Bin ID: ${alert.binId}`,
          time: getTimeAgo(alert.createdAtOriginal),
          type: "critical",
          read: false
        });
      }
      
      // Notifications for high priority alerts
      if (alert.severity === "High" && alert.status === "Open") {
        alertNotifs.push({
          id: `high-${alert._id}`,
          title: "High Priority Alert",
          message: `High priority ${alert.type} alert at ${alert.location}. Bin ID: ${alert.binId}`,
          time: getTimeAgo(alert.createdAtOriginal),
          type: "warning",
          read: false
        });
      }
    });
    
    // If no notifications generated, add a general one
    if (alertNotifs.length === 0 && alertsList.length > 0) {
      alertNotifs.push({
        id: 'general-1',
        title: "Alert System Active",
        message: `You have ${alertsList.length} alert${alertsList.length > 1 ? 's' : ''} in the system`,
        time: "Just now",
        type: "info",
        read: false
      });
    }
    
    // Merge with existing backend notifications
    setNotifications(prev => {
      const backendNotifs = prev.filter(n => n.dbId); // Keep only backend notifications
      return [...backendNotifs, ...alertNotifs];
    });
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const handleAlertCreated = (newAlert) => {
    // Refresh the alerts list
    fetchAlerts();
    setEditingAlert(null);
  };

  const handleEditClick = (alert) => {
    setEditingAlert(alert);
    setShowNewAlertModal(true);
  };

  const handleDeleteClick = (alert) => {
    setAlertToDelete(alert);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!alertToDelete) return;

    try {
      setDeleteLoading(true);
      const response = await axios.delete(`http://localhost:4000/api/alerts/${alertToDelete._id}`);
      
      if (response.data.success) {
        // Refresh the alerts list
        fetchAlerts();
        setShowDeleteModal(false);
        setAlertToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting alert:", error);
      alert("Failed to delete alert. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowNewAlertModal(false);
    setEditingAlert(null);
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
        (alert.location && alert.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (alert.assignedTo && alert.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()))
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

    // Time filter
    if (selectedTime !== "all") {
      const now = new Date();
      filtered = filtered.filter(alert => {
        const alertDate = new Date(alert.createdAtOriginal || alert.createdAt);
        
        switch (selectedTime) {
          case "today":
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            return alertDate >= today;
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return alertDate >= weekAgo;
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return alertDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredAlerts(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedSeverity, selectedStatus, selectedType, selectedTime, alerts]);

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

  // Calculate trends based on selected time filter
  const calculateTrends = () => {
    const now = new Date();
    let periods = [];
    let labels = [];

    if (timeFilter === "This Week") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        periods.push({ start, end });
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        labels.push(dayNames[date.getDay()]);
      }
    } else if (timeFilter === "Last 3 Months") {
      // Last 3 months including current month
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 2; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthStart.setHours(0, 0, 0, 0);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        periods.push({ start: monthStart, end: monthEnd });
        labels.push(monthNames[monthStart.getMonth()]);
      }
    } else {
      // This Month (default) - 4 weeks
      periods = [
        { label: 'Week 1', start: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000), end: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000) },
        { label: 'Week 2', start: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000), end: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) },
        { label: 'Week 3', start: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), end: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
        { label: 'Week 4', start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), end: now }
      ];
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    }

    const trendsData = { Critical: [], High: [], Medium: [], Low: [] };

    periods.forEach(period => {
      const periodAlerts = alerts.filter(alert => {
        const alertDate = new Date(alert.createdAtOriginal || alert.createdAt);
        return alertDate >= period.start && alertDate <= period.end;
      });

      trendsData.Critical.push(periodAlerts.filter(a => a.severity === 'Critical').length);
      trendsData.High.push(periodAlerts.filter(a => a.severity === 'High').length);
      trendsData.Medium.push(periodAlerts.filter(a => a.severity === 'Medium').length);
      trendsData.Low.push(periodAlerts.filter(a => a.severity === 'Low').length);
    });

    return { data: trendsData, labels };
  };

  const { data: weeklyTrends, labels: trendLabels } = calculateTrends();

  const alertTrendsData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Critical',
        data: weeklyTrends.Critical,
        borderColor: '#dc3545',
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
        fill: false,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#dc3545',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      },
      {
        label: 'High',
        data: weeklyTrends.High,
        borderColor: '#fd7e14',
        backgroundColor: 'rgba(253, 126, 20, 0.1)',
        fill: false,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#fd7e14',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      },
      {
        label: 'Medium',
        data: weeklyTrends.Medium,
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        fill: false,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#0d6efd',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      },
      {
        label: 'Low',
        data: weeklyTrends.Low,
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.2)',
        fill: false,
        tension: 0.4,
        borderWidth: 4,
        pointRadius: 7,
        pointHoverRadius: 9,
        pointBackgroundColor: '#28a745',
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        borderDash: []
      }
    ]
  };

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

  const handleRefresh = () => {
    fetchAlerts();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAsRead = async (notificationId) => {
    // Find the notification
    const notif = notifications.find(n => n.id === notificationId);
    
    // If it's a backend notification (has dbId), update in database
    if (notif && notif.dbId) {
      try {
        await axios.put(`http://localhost:4000/api/notifications/${notif.dbId}/read`);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    
    // Update in local state
    setNotifications(notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const deleteNotification = async (notificationId) => {
    // Find the notification
    const notif = notifications.find(n => n.id === notificationId);
    
    // If it's a backend notification (has dbId), delete from database
    if (notif && notif.dbId) {
      try {
        await axios.delete(`http://localhost:4000/api/notifications/${notif.dbId}`);
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
    
    // Remove from local state
    setNotifications(notifications.filter(n => n.id !== notificationId));
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

          <Navbar.Toggle aria-controls="alert-navbar" />
          
          <Navbar.Collapse id="alert-navbar">
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
                fontWeight: '500'
              }}>
                Live Monitor
              </Nav.Link>
              <Nav.Link as={Link} to="/alert-management" className="mx-2 px-3 py-2" style={{ 
                border: '1px solid #d0d0d0', 
                borderRadius: '4px',
                color: '#333',
                fontWeight: '500',
                backgroundColor: '#f0f0f0'
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
                      width: '380px', 
                      maxHeight: '450px', 
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
          <Row className="align-items-center g-2">
            <Col lg={3} md={12}>
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
            <Col lg="auto" md={6} sm={6}>
              <Form.Select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                style={{ minWidth: '120px' }}
              >
                <option value="all">⏰ Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </Form.Select>
            </Col>
            <Col lg="auto" md={12} className="d-flex justify-content-end gap-2 ms-auto">
              <Button variant="primary" onClick={() => setShowNewAlertModal(true)}>
                <FaPlus className="me-1" />
                New Alert
              </Button>
              <Button variant="outline-secondary" onClick={handleRefresh}>
                <FaSync className="me-1" />
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
                      <div className="d-flex gap-2 align-items-center">
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="text-primary p-0" 
                          onClick={() => handleEditClick(alert)}
                          title="Edit"
                        >
                          <FaEdit size={16} />
                        </Button>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="text-danger p-0" 
                          onClick={() => handleDeleteClick(alert)}
                          title="Delete"
                        >
                          <FaTrash size={16} />
                        </Button>
                      </div>
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
              <option value="This Month">This Month ▼</option>
              <option value="This Week">This Week</option>
              <option value="Last 3 Months">Last 3 Months</option>
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

      {/* New/Edit Alert Modal */}
      <NewAlertModal 
        show={showNewAlertModal} 
        handleClose={handleModalClose}
        onAlertCreated={handleAlertCreated}
        editAlert={editingAlert}
      />

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this alert?</p>
          {alertToDelete && (
            <div className="bg-light p-3 rounded">
              <p className="mb-1"><strong>Alert ID:</strong> {alertToDelete.id}</p>
              <p className="mb-1"><strong>Bin ID:</strong> {alertToDelete.binId}</p>
              <p className="mb-0"><strong>Location:</strong> {alertToDelete.location}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleteLoading}>
            {deleteLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Deleting...
              </>
            ) : (
              <>
                <FaTrash className="me-2" />
                Delete
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      </Container>
    </>
  );
};

export default AlertManagement;

