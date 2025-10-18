import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Truck, Clock, Navigation, TrendingUp, AlertCircle, CheckCircle, Activity, Zap, Users, AlertTriangle, RefreshCw, Maximize2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:4000/api';

const LiveMonitoring = () => {
    const [stats, setStats] = useState({
        routes: { active: 0, completedToday: 0, delayed: 0, totalDistanceToday: 0 },
        collectors: { total: 0, onRoute: 0, onBreak: 0, available: 0 }
    });
    const [vehiclePositions, setVehiclePositions] = useState([]);
    const [activeRoutes, setActiveRoutes] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [trackingVehicle, setTrackingVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef({});

    // Initialize map
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Create map instance
        const L = window.L;
        if (!L) {
            console.error('Leaflet not loaded');
            return;
        }

        const map = L.map(mapRef.current).setView([7.2906, 79.8337], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Update map markers when vehicle positions change
    useEffect(() => {
        if (!mapInstanceRef.current || !window.L) return;

        const L = window.L;

        // Clear existing markers
        Object.values(markersRef.current).forEach(marker => marker.remove());
        markersRef.current = {};

        // Add new markers for each vehicle
        vehiclePositions.forEach(vehicle => {
            const isMoving = vehicle.status === 'On Route';
            const lat = vehicle.position?.latitude || 7.2906 + (Math.random() - 0.5) * 0.1;
            const lng = vehicle.position?.longitude || 79.8337 + (Math.random() - 0.5) * 0.1;

            // Create custom icon
            const iconHtml = `
        <div style="
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: ${isMoving ? '#10b981' : '#f59e0b'};
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M5 17h14v-4H5v4zm0 0v2h14v-2M5 17l-2-5h18l-2 5M7 13h10M7 8h10M9 8V5h6v3"/>
          </svg>
        </div>
      `;

            const customIcon = L.divIcon({
                html: iconHtml,
                className: 'custom-vehicle-marker',
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });

            const marker = L.marker([lat, lng], { icon: customIcon })
                .addTo(mapInstanceRef.current)
                .bindPopup(`
          <div style="padding: 8px; min-width: 200px;">
            <h6 style="margin: 0 0 8px 0; font-weight: 600;">${vehicle.vehicleId}</h6>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Driver:</strong> ${vehicle.collectorName}</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Status:</strong> <span style="color: ${isMoving ? '#10b981' : '#f59e0b'};">${vehicle.status}</span></p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Location:</strong> ${vehicle.currentLocation}</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Workload:</strong> ${vehicle.workload}</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Speed:</strong> ${Math.round(vehicle.position?.speed || 0)} km/h</p>
            <button 
              onclick="window.trackVehicle('${vehicle.vehicleId}')" 
              style="
                margin-top: 8px;
                padding: 6px 12px;
                background: #6366f1;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                width: 100%;
                font-size: 12px;
              "
            >
              Track Vehicle
            </button>
          </div>
        `);

            marker.on('click', () => {
                setSelectedVehicle(vehicle);
            });

            markersRef.current[vehicle.vehicleId] = marker;

            // If this is the tracked vehicle, center map on it
            if (trackingVehicle?.vehicleId === vehicle.vehicleId) {
                mapInstanceRef.current.setView([lat, lng], 15);
            }
        });
    }, [vehiclePositions, trackingVehicle]);

    // Global function for tracking from popup
    useEffect(() => {
        window.trackVehicle = (vehicleId) => {
            const vehicle = vehiclePositions.find(v => v.vehicleId === vehicleId);
            if (vehicle) {
                setTrackingVehicle(vehicle);
                setSelectedVehicle(vehicle);
            }
        };
    }, [vehiclePositions]);

    // Fetch initial data
    useEffect(() => {
        fetchInitialData();
        const interval = setInterval(fetchInitialData, 15000); // Refresh every 15 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [statsRes, vehiclesRes, routesRes, alertsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/monitoring/dashboard/stats`),
                fetch(`${API_BASE_URL}/monitoring/vehicles/live`),
                fetch(`${API_BASE_URL}/monitoring/routes/active`),
                fetch(`${API_BASE_URL}/monitoring/alerts`)
            ]);

            const statsData = await statsRes.json();
            const vehiclesData = await vehiclesRes.json();
            const routesData = await routesRes.json();
            const alertsData = await alertsRes.json();

            if (statsData.success) setStats(statsData.data);
            if (vehiclesData.success) setVehiclePositions(vehiclesData.data);
            if (routesData.success) setActiveRoutes(routesData.data);
            if (alertsData.success) setAlerts(alertsData.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTrackVehicle = (vehicle) => {
        setTrackingVehicle(vehicle);
        setSelectedVehicle(vehicle);

        if (mapInstanceRef.current && vehicle.position) {
            const lat = vehicle.position.latitude || 7.2906;
            const lng = vehicle.position.longitude || 79.8337;
            mapInstanceRef.current.setView([lat, lng], 15);

            // Open popup for tracked vehicle
            if (markersRef.current[vehicle.vehicleId]) {
                markersRef.current[vehicle.vehicleId].openPopup();
            }
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Active': 'success',
            'On Route': 'primary',
            'On Break': 'warning',
            'Delayed': 'danger',
            'Available': 'info',
            'Completed': 'success',
            'Optimized': 'info'
        };
        return colors[status] || 'secondary';
    };

    const getPriorityBadge = (priority) => {
        const badges = {
            'Urgent': { bg: 'danger', text: 'danger' },
            'High': { bg: 'warning', text: 'warning' },
            'Medium': { bg: 'info', text: 'info' },
            'Low': { bg: 'secondary', text: 'secondary' }
        };
        return badges[priority] || badges['Low'];
    };

    const getAlertIcon = (type) => {
        switch(type) {
            case 'danger': return <AlertTriangle className="text-danger" size={20} />;
            case 'warning': return <AlertCircle className="text-warning" size={20} />;
            default: return <Activity className="text-info" size={20} />;
        }
    };

    return (
        <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '24px' }}>
            {/* Leaflet CSS */}
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                crossOrigin=""
            />
            <script
                src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
                integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
                crossOrigin=""
            ></script>

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1 fw-bold text-dark d-flex align-items-center">
                        <Activity size={32} className="me-2" style={{ color: '#6366f1' }} />
                        Live Vehicle Monitoring
                    </h2>
                    <p className="text-muted mb-0">Real-time tracking and fleet management</p>
                </div>
                <div className="d-flex gap-2 align-items-center">
                    <div className="d-flex align-items-center me-3">
                        <div
                            style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: '#10b981',
                                marginRight: '8px',
                                animation: 'pulse 2s infinite'
                            }}
                        />
                        <small className="text-muted">Live Updates</small>
                    </div>
                    <button className="btn btn-outline-primary" onClick={fetchInitialData}>
                        <RefreshCw size={16} className="me-2" />
                        Refresh
                    </button>
                </div>
            </div>


            {/* Main Content */}
            <div className="row g-3">
                {/* Map Section */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm mb-3">
                        <div className="card-header bg-white border-0 py-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-semibold d-flex align-items-center">
                                    <MapPin size={20} className="me-2" style={{ color: '#6366f1' }} />
                                    Live Vehicle Tracking Map
                                    {trackingVehicle && (
                                        <span className="badge bg-primary ms-2" style={{ fontSize: '0.75rem' }}>
                      Tracking: {trackingVehicle.vehicleId}
                    </span>
                                    )}
                                </h5>
                                {trackingVehicle && (
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => setTrackingVehicle(null)}
                                    >
                                        Stop Tracking
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="card-body p-0">
                            <div
                                ref={mapRef}
                                style={{
                                    height: '500px',
                                    width: '100%',
                                    position: 'relative'
                                }}
                            />
                            {loading && (
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    backgroundColor: 'white',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}>
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* card */}
                    <div className="row g-3 mb-4 ">
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #10b981' }}>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <p className="text-muted mb-1 small">Active Routes</p>
                                            <h3 className="mb-0 fw-bold">{stats.routes.active}</h3>
                                            <small className="text-success">
                                                <TrendingUp size={14} className="me-1" />
                                                {stats.routes.completedToday} completed today
                                            </small>
                                        </div>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '12px',
                                            backgroundColor: '#d1fae5',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Navigation size={24} style={{ color: '#10b981' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #3b82f6' }}>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <p className="text-muted mb-1 small">Vehicles On Route</p>
                                            <h3 className="mb-0 fw-bold">{stats.collectors.onRoute}</h3>
                                            <small className="text-primary">
                                                of {stats.collectors.total} total
                                            </small>
                                        </div>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '12px',
                                            backgroundColor: '#dbeafe',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Truck size={24} style={{ color: '#3b82f6' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #f59e0b' }}>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <p className="text-muted mb-1 small">On Break</p>
                                            <h3 className="mb-0 fw-bold">{stats.collectors.onBreak}</h3>
                                            <small className="text-warning">
                                                <Clock size={14} className="me-1" />
                                                Paused operations
                                            </small>
                                        </div>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '12px',
                                            backgroundColor: '#fef3c7',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Clock size={24} style={{ color: '#f59e0b' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #ef4444' }}>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <p className="text-muted mb-1 small">Delayed Routes</p>
                                            <h3 className="mb-0 fw-bold">{stats.routes.delayed}</h3>
                                            <small className="text-danger">
                                                <AlertTriangle size={14} className="me-1" />
                                                Needs attention
                                            </small>
                                        </div>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '12px',
                                            backgroundColor: '#fee2e2',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <AlertTriangle size={24} style={{ color: '#ef4444' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Active Routes Table */}
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="mb-0 fw-semibold d-flex align-items-center">
                                <Navigation size={20} className="me-2" style={{ color: '#6366f1' }} />
                                Active Routes ({activeRoutes.length})
                            </h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead style={{ backgroundColor: '#f8fafc' }}>
                                    <tr>
                                        <th className="border-0 py-3 small">Route</th>
                                        <th className="border-0 py-3 small">Status</th>
                                        <th className="border-0 py-3 small">Collector</th>
                                        <th className="border-0 py-3 small">Progress</th>
                                        <th className="border-0 py-3 small">Priority</th>
                                        <th className="border-0 py-3 small">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {activeRoutes.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-5 text-muted">
                                                <AlertCircle size={40} className="mb-2 opacity-25" />
                                                <p className="mb-0 small">No active routes found</p>
                                                <small className="text-muted">Routes will appear here when collectors start their work</small>
                                            </td>
                                        </tr>
                                    ) : (
                                        activeRoutes.map((route) => (
                                            <tr key={route.id}>
                                                <td className="py-3">
                                                    <div>
                                                        <span className="badge bg-light text-dark mb-1">{route.routeCode}</span>
                                                        <div className="fw-semibold small">{route.routeName}</div>
                                                        <small className="text-muted">{route.area}</small>
                                                    </div>
                                                </td>
                                                <td className="py-3">
                            <span className={`badge bg-${getStatusColor(route.status)}`}>
                              {route.status}
                            </span>
                                                </td>
                                                <td className="py-3">
                                                    <div className="small">
                                                        {route.assignedCollector?.name || 'Unassigned'}
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    <div style={{ width: '120px' }}>
                                                        <div className="progress" style={{ height: '6px' }}>
                                                            <div
                                                                className="progress-bar bg-success"
                                                                style={{ width: `${route.progress?.percentage || 0}%` }}
                                                            ></div>
                                                        </div>
                                                        <small className="text-muted">
                                                            {route.progress?.collected || 0}/{route.progress?.total || 0}
                                                        </small>
                                                    </div>
                                                </td>
                                                <td className="py-3">
                            <span className={`badge bg-${getPriorityBadge(route.priority).bg}-subtle text-${getPriorityBadge(route.priority).text}`}>
                              {route.priority}
                            </span>
                                                </td>
                                                <td className="py-3">
                                                    <button className="btn btn-sm btn-outline-primary me-1" title="View Details">
                                                        <i className="bi bi-eye"></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-success" title="Track Route">
                                                        <i className="bi bi-geo-alt"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="col-lg-4">
                    {/* Live Status */}
                    <div className="card border-0 shadow-sm mb-3">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="mb-0 fw-semibold d-flex align-items-center">
                                <Zap size={20} className="me-2" style={{ color: '#6366f1' }} />
                                Live Status ({vehiclePositions.length})
                            </h5>
                        </div>
                        <div className="card-body p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {vehiclePositions.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    <Users size={40} className="mb-2 opacity-25" />
                                    <p className="mb-0 small">No active vehicles</p>
                                </div>
                            ) : (
                                vehiclePositions.map((vehicle) => {
                                    const statusColor = getStatusColor(vehicle.status);
                                    const isTracking = trackingVehicle?.vehicleId === vehicle.vehicleId;
                                    return (
                                        <div
                                            key={vehicle.vehicleId}
                                            className="p-3 border-bottom"
                                            style={{
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s',
                                                backgroundColor: isTracking ? '#e0e7ff' : selectedVehicle?.vehicleId === vehicle.vehicleId ? '#f8fafc' : 'transparent'
                                            }}
                                            onClick={() => setSelectedVehicle(vehicle)}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isTracking ? '#e0e7ff' : '#f8fafc'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isTracking ? '#e0e7ff' : selectedVehicle?.vehicleId === vehicle.vehicleId ? '#f8fafc' : 'transparent'}
                                        >
                                            <div className="d-flex align-items-start">
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '8px',
                                                    backgroundColor: statusColor === 'success' ? '#d1fae5' : statusColor === 'warning' ? '#fef3c7' : statusColor === 'primary' ? '#dbeafe' : '#f3f4f6',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: '12px',
                                                    flexShrink: 0
                                                }}>
                                                    <Truck size={20} style={{
                                                        color: statusColor === 'success' ? '#10b981' : statusColor === 'warning' ? '#f59e0b' : statusColor === 'primary' ? '#3b82f6' : '#6b7280'
                                                    }} />
                                                </div>
                                                <div className="flex-grow-1 overflow-hidden">
                                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                                        <div>
                                                            <div className="fw-semibold small">{vehicle.vehicleId}</div>
                                                            <small className="text-muted">{vehicle.collectorName}</small>
                                                        </div>
                                                        <span className={`badge bg-${statusColor}`} style={{ fontSize: '0.7rem' }}>
                              {vehicle.status}
                            </span>
                                                    </div>
                                                    <div className="d-flex align-items-center text-muted mb-2">
                                                        <MapPin size={12} className="me-1" />
                                                        <small style={{ fontSize: '0.75rem' }}>{vehicle.currentLocation}</small>
                                                    </div>
                                                    <div className="progress" style={{ height: '4px' }}>
                                                        <div
                                                            className={`progress-bar bg-${statusColor}`}
                                                            style={{ width: vehicle.workload }}
                                                        ></div>
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center mt-2">
                                                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>Workload: {vehicle.workload}</small>
                                                        <button
                                                            className="btn btn-sm btn-outline-primary py-0 px-2"
                                                            style={{ fontSize: '0.7rem' }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleTrackVehicle(vehicle);
                                                            }}
                                                        >
                                                            {isTracking ? 'Tracking' : 'Track'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Alerts */}
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="mb-0 fw-semibold d-flex align-items-center">
                                <AlertCircle size={20} className="me-2" style={{ color: '#6366f1' }} />
                                Recent Alerts ({alerts.length})
                            </h5>
                        </div>
                        <div className="card-body p-0" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {alerts.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    <CheckCircle size={40} className="mb-2 opacity-25" />
                                    <p className="mb-0 small">No alerts</p>
                                </div>
                            ) : (
                                alerts.map((alert, idx) => (
                                    <div key={idx} className="p-3 border-bottom">
                                        <div className="d-flex align-items-start">
                                            <div className="me-2">{getAlertIcon(alert.type)}</div>
                                            <div className="flex-grow-1">
                                                <div className="fw-semibold small mb-1">{alert.title}</div>
                                                <p className="mb-1 small text-muted">{alert.message}</p>
                                                <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                    {new Date(alert.timestamp).toLocaleTimeString()}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>




            {/* Vehicle Details Modal */}
            {selectedVehicle && (
                <div
                    className="modal show d-block"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onClick={() => setSelectedVehicle(null)}
                >
                    <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Vehicle Details</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setSelectedVehicle(null)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="text-center mb-4">
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        backgroundColor: '#6366f1',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '15px'
                                    }}>
                                        <Truck size={40} color="white" />
                                    </div>
                                    <h4 className="mb-2">{selectedVehicle.vehicleId}</h4>
                                    <span className={`badge bg-${getStatusColor(selectedVehicle.status)}`}>
                    {selectedVehicle.status}
                  </span>
                                </div>

                                <div className="row g-3">
                                    <div className="col-6">
                                        <div className="p-3 rounded" style={{ backgroundColor: '#f8fafc' }}>
                                            <small className="text-muted d-block mb-1">Driver</small>
                                            <strong className="small">{selectedVehicle.collectorName}</strong>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="p-3 rounded" style={{ backgroundColor: '#f8fafc' }}>
                                            <small className="text-muted d-block mb-1">Vehicle Type</small>
                                            <strong className="small">{selectedVehicle.vehicleType}</strong>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="p-3 rounded" style={{ backgroundColor: '#f8fafc' }}>
                                            <small className="text-muted d-block mb-1">Phone</small>
                                            <strong className="small">{selectedVehicle.collectorPhone || 'N/A'}</strong>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="p-3 rounded" style={{ backgroundColor: '#f8fafc' }}>
                                            <small className="text-muted d-block mb-1">Email</small>
                                            <strong className="small" style={{ fontSize: '0.75rem' }}>{selectedVehicle.collectorEmail || 'N/A'}</strong>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="p-3 rounded" style={{ backgroundColor: '#f8fafc' }}>
                                            <small className="text-muted d-block mb-1">Current Location</small>
                                            <strong className="small">{selectedVehicle.currentLocation}</strong>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="p-3 rounded" style={{ backgroundColor: '#f8fafc' }}>
                                            <small className="text-muted d-block mb-1">Workload</small>
                                            <strong className="small">{selectedVehicle.workload}</strong>
                                            <div className="progress mt-2" style={{ height: '6px' }}>
                                                <div
                                                    className="progress-bar bg-primary"
                                                    style={{ width: selectedVehicle.workload }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="p-3 rounded" style={{ backgroundColor: '#f8fafc' }}>
                                            <small className="text-muted d-block mb-1">Speed</small>
                                            <strong className="small">{Math.round(selectedVehicle.position?.speed || 0)} km/h</strong>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="p-3 rounded" style={{ backgroundColor: '#f8fafc' }}>
                                            <small className="text-muted d-block mb-1">Completed Routes</small>
                                            <strong className="small">{selectedVehicle.completedRoutes}</strong>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="p-3 rounded" style={{ backgroundColor: '#f8fafc' }}>
                                            <small className="text-muted d-block mb-1">Total Distance</small>
                                            <strong className="small">{selectedVehicle.totalDistance}</strong>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="p-3 rounded" style={{ backgroundColor: '#f8fafc' }}>
                                            <small className="text-muted d-block mb-1">Rating</small>
                                            <strong className="small">{selectedVehicle.rating} ⭐</strong>
                                        </div>
                                    </div>
                                    {selectedVehicle.assignedRoute && (
                                        <div className="col-12">
                                            <div className="p-3 rounded" style={{ backgroundColor: '#e0e7ff' }}>
                                                <small className="text-muted d-block mb-1">Assigned Route</small>
                                                <strong className="small d-block">{selectedVehicle.assignedRoute.name}</strong>
                                                <small className="text-muted">
                                                    {selectedVehicle.assignedRoute.code} • {selectedVehicle.assignedRoute.area} • {selectedVehicle.assignedRoute.collectionPoints} points
                                                </small>
                                            </div>
                                        </div>
                                    )}
                                    <div className="col-12">
                                        <div className="p-3 rounded" style={{ backgroundColor: '#fef3c7' }}>
                                            <small className="text-muted d-block mb-2">GPS Coordinates</small>
                                            <div className="row g-2">
                                                <div className="col-6">
                                                    <small className="text-muted d-block">Latitude</small>
                                                    <strong className="small">{selectedVehicle.position?.latitude?.toFixed(6) || 'N/A'}</strong>
                                                </div>
                                                <div className="col-6">
                                                    <small className="text-muted d-block">Longitude</small>
                                                    <strong className="small">{selectedVehicle.position?.longitude?.toFixed(6) || 'N/A'}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0">
                                <button className="btn btn-outline-secondary" onClick={() => setSelectedVehicle(null)}>
                                    Close
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        handleTrackVehicle(selectedVehicle);
                                        setSelectedVehicle(null);
                                    }}
                                >
                                    <MapPin size={16} className="me-1" />
                                    Track on Map
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>
                {`
          @keyframes pulse {
            0%, 100% { 
              transform: scale(1); 
              opacity: 1; 
            }
            50% { 
              transform: scale(1.05); 
              opacity: 0.9; 
            }
          }
          
          .table tbody tr {
            transition: background-color 0.2s;
          }
          
          .table tbody tr:hover {
            background-color: #f8fafc;
          }
          
          .card {
            transition: transform 0.2s, box-shadow 0.2s;
          }
          
          .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
          }
          
          .btn {
            transition: all 0.2s;
          }
          
          .btn:hover {
            transform: translateY(-1px);
          }
          
          .badge {
            font-weight: 500;
            padding: 4px 8px;
          }
          
          /* Scrollbar styling */
          ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          
          ::-webkit-scrollbar-track {
            background: #f1f5f9;
          }
          
          ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }

          /* Leaflet popup customization */
          .leaflet-popup-content-wrapper {
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          
          .leaflet-popup-content {
            margin: 0;
          }

          .custom-vehicle-marker {
            background: transparent;
            border: none;
          }

          /* Map controls */
          .leaflet-control-zoom a {
            border-radius: 4px !important;
          }
        `}
            </style>
        </div>
    );
};

export default LiveMonitoring;