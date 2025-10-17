import React, { useState, useEffect } from 'react';
import { MapPin, Users, Navigation, Clock, TrendingUp, CheckCircle, XCircle, Filter, Send, Search, Bell } from 'lucide-react';

import '../css/WasteMangement.css';
import RouteMap from "../components/RouteMap";

const API_BASE_URL = 'http://localhost:4000/api';

const WasteManagementSystem = () => {
    const [activeTab, setActiveTab] = useState('optimize');
    const [routes, setRoutes] = useState([]);
    const [collectors, setCollectors] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [optimizedRoute, setOptimizedRoute] = useState(null);
    const [selectedCollector, setSelectedCollector] = useState(null);
    const [filters, setFilters] = useState({
        routeType: '',
        vehicleType: '',
        status: '',
        searchQuery: '',
        collectorAvailability: '',
        collectorWorkload: ''
    });
    const [notification, setNotification] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRoutes();
        fetchCollectors();
    }, []);

    const fetchRoutes = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/routes/`);
            const result = await response.json();

            if (result.success && result.data) {
                setRoutes(result.data);
            } else {
                setRoutes([]);
                showNotification('No routes found', 'info');
            }
        } catch (error) {
            console.error('Fetch routes error:', error);
            showNotification('Error fetching routes', 'error');
            setRoutes([]);
        }
    };

    const fetchCollectors = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/collectors`);
            const result = await response.json();

            if (result.success && result.data) {
                setCollectors(result.data);
            } else {
                setCollectors([]);
                showNotification('No collectors found', 'info');
            }
        } catch (error) {
            console.error('Fetch collectors error:', error);
            showNotification('Error fetching collectors', 'error');
            setCollectors([]);
        }
    };

    const handleOptimizeRoute = async () => {
        if (!selectedRoute) {
            showNotification('Please select a route first', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/routes/${selectedRoute.id}/optimize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const result = await response.json();

            if (result.success && result.data) {
                setOptimizedRoute(result.data);
                showNotification(result.message || 'Route optimized successfully', 'success');
            } else {
                showNotification(result.message || 'Failed to optimize route', 'error');
            }
        } catch (error) {
            console.error('Optimize error:', error);
            showNotification('Error optimizing route', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRoute = async () => {
        if (!optimizedRoute) return;

        try {
            // Don't send the entire optimizedRoute - just trigger the accept endpoint
            // The backend already has the optimized data saved in the database
            const response = await fetch(`${API_BASE_URL}/routes/${selectedRoute.id}/accept`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                // Send empty body or minimal data - the optimization is already saved
                body: JSON.stringify({})
            });

            const result = await response.json();

            if (result.success) {
                showNotification(result.message || 'Optimized route accepted', 'success');
                setSelectedRoute(result.data);
                setOptimizedRoute(null);
                fetchRoutes();
                setActiveTab('assign');
            } else {
                showNotification(result.message || 'Failed to accept route', 'error');
            }
        } catch (error) {
            console.error('Accept route error:', error);
            showNotification('Error accepting route', 'error');
        }
    };
    const handleRejectRoute = () => {
        setOptimizedRoute(null);
        showNotification('Optimization rejected, keeping previous route', 'info');
    };

    const handleAssignCollector = async () => {
        if (!selectedRoute || !selectedCollector) {
            showNotification('Please select both route and collector', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/routes/${selectedRoute.id}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    collectorId: selectedCollector.id
                })
            });

            const result = await response.json();

            if (result.success) {
                showNotification(result.message || 'Collector assigned successfully', 'success');
                fetchRoutes();
                fetchCollectors();
                setSelectedCollector(null);
                setSelectedRoute(null);
            } else {
                showNotification(result.message || 'Failed to assign collector', 'error');
            }
        } catch (error) {
            console.error('Assign collector error:', error);
            showNotification('Error assigning collector', 'error');
        }
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const filteredRoutes = routes.filter(route => {
        return (
            (filters.routeType === '' || route.routeType === filters.routeType) &&
            (filters.vehicleType === '' || route.vehicleType === filters.vehicleType) &&
            (filters.status === '' || route.status === filters.status) &&
            (filters.searchQuery === '' ||
                route.name?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                route.routeCode?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                route.id?.toLowerCase().includes(filters.searchQuery.toLowerCase()))
        );
    });

    const filteredCollectors = collectors.filter(collector => {
        const workloadNum = parseInt(collector.workload) || 0;
        return (
            (filters.collectorAvailability === '' || collector.status === filters.collectorAvailability) &&
            (filters.collectorWorkload === '' ||
                (filters.collectorWorkload === 'low' && workloadNum < 50) ||
                (filters.collectorWorkload === 'medium' && workloadNum >= 50 && workloadNum < 80) ||
                (filters.collectorWorkload === 'high' && workloadNum >= 80))
        );
    });

    const getStatusClass = (status) => {
        switch(status?.toLowerCase()) {
            case 'planned': return 'status-planned';
            case 'optimized': return 'status-optimized';
            case 'active': return 'status-active';
            case 'delayed': return 'status-delayed';
            case 'completed': return 'status-completed';
            default: return 'status-default';
        }
    };

    return (
        <div className="waste-management-container">
            {/* Notification */}
            {notification && (
                <div className={`notification notification-${notification.type}`}>
                    {notification.message}
                </div>
            )}

            {/* Tabs */}
            <div className="tabs-container">
                <div className="tabs-wrapper">
                    <div className="tabs-flex">
                        <button
                            onClick={() => setActiveTab('optimize')}
                            className={`tab-button ${activeTab === 'optimize' ? 'active' : ''}`}
                        >
                            Optimize Route
                        </button>
                        <button
                            onClick={() => setActiveTab('assign')}
                            className={`tab-button ${activeTab === 'assign' ? 'active' : ''}`}
                        >
                            Assign Collector
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {activeTab === 'optimize' && (
                    <div className="grid-12">
                        {/* Left Sidebar - Route Controls */}
                        <div className="col-span-3 space-y-6">
                            <div className="card">
                                <h3 className="section-title">Route Controls</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="form-label">Route Type</label>
                                        <select
                                            className="form-select"
                                            value={filters.routeType}
                                            onChange={(e) => setFilters({...filters, routeType: e.target.value})}
                                        >
                                            <option value="">All Types</option>
                                            <option value="Residential">Residential</option>
                                            <option value="Commercial">Commercial</option>
                                            <option value="Industrial">Industrial</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="form-label">Vehicle Type</label>
                                        <select
                                            className="form-select"
                                            value={filters.vehicleType}
                                            onChange={(e) => setFilters({...filters, vehicleType: e.target.value})}
                                        >
                                            <option value="">All Vehicles</option>
                                            <option value="Truck">Truck</option>
                                            <option value="Van">Van</option>
                                            <option value="Compact">Compact</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="form-label">Status</label>
                                        <select
                                            className="form-select"
                                            value={filters.status}
                                            onChange={(e) => setFilters({...filters, status: e.target.value})}
                                        >
                                            <option value="">All Status</option>
                                            <option value="Planned">Planned</option>
                                            <option value="Optimized">Optimized</option>
                                            <option value="Active">Active</option>
                                            <option value="Delayed">Delayed</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="form-label">Search Routes</label>
                                        <div className="search-wrapper">
                                            <Search className="search-icon" />
                                            <input
                                                type="text"
                                                placeholder="Search..."
                                                className="search-input"
                                                value={filters.searchQuery}
                                                onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Available Routes List */}
                            <div className="card">
                                <h3 className="section-title">Available Routes</h3>
                                <div className="routes-list space-y-2">
                                    {filteredRoutes.length === 0 ? (
                                        <p className="text-center text-gray-500">No routes found</p>
                                    ) : (
                                        filteredRoutes.map(route => (
                                            <div
                                                key={route.id}
                                                onClick={() => setSelectedRoute(route)}
                                                className={`route-item ${selectedRoute?.id === route.id ? 'selected' : ''}`}
                                            >
                                                <div className="route-item-content">
                                                    <div className="route-item-details">
                                                        <div className="route-header">
                                                            <MapPin className="route-icon" />
                                                            <span className="route-name">{route.name}</span>
                                                        </div>
                                                        <p className="route-area">{route.area}</p>
                                                        <div className="route-stats">
                                                            <span className="route-stat">{route.distance}</span>
                                                            <span className="stat-separator">•</span>
                                                            <span className="route-stat">{route.estimatedTime}</span>
                                                        </div>
                                                    </div>
                                                    <span className={`status-badge ${getStatusClass(route.status)}`}>
                                                        {route.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Main Content Area - Route Details & Map */}
                        <div className="col-span-9 space-y-6">
                            {/* Current Route Details */}
                            {selectedRoute && (
                                <div className="card">
                                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
                                        <h3 className="section-title-lg" style={{margin: 0}}>Current Route: {selectedRoute.name}</h3>
                                        <span className={`status-badge ${getStatusClass(selectedRoute.status)}`}>
                                            {selectedRoute.status}
                                        </span>
                                    </div>

                                    <div className="grid-cols-4" style={{marginBottom: '1.5rem'}}>
                                        <div className="stat-card">
                                            <p className="stat-label">Total Distance</p>
                                            <p className="stat-value">{selectedRoute.distance}</p>
                                        </div>
                                        <div className="stat-card">
                                            <p className="stat-label">Estimated Time</p>
                                            <p className="stat-value">{selectedRoute.estimatedTime}</p>
                                        </div>
                                        <div className="stat-card">
                                            <p className="stat-label">Collection Points</p>
                                            <p className="stat-value">{selectedRoute.collectionPoints}</p>
                                        </div>
                                        <div className="stat-card">
                                            <p className="stat-label">Fuel Cost</p>
                                            <p className="stat-value">${selectedRoute.fuelCost}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleOptimizeRoute}
                                        disabled={loading || selectedRoute.status === 'Active' || selectedRoute.status === 'Completed'}
                                        className="btn btn-primary"
                                    >
                                        <TrendingUp className="btn-icon" />
                                        <span>{loading ? 'Optimizing...' : 'Optimize Selected'}</span>
                                    </button>
                                </div>
                            )}

                            {/* Optimized Route Comparison */}
                            {optimizedRoute && (
                                <div className="card">
                                    <h3 className="section-title-lg">Optimization Results</h3>

                                    <div className="comparison-grid">
                                        {/* Current Route */}
                                        <div className="comparison-card comparison-current">
                                            <h4 className="comparison-title">Current Route</h4>
                                            <div className="space-y-2">
                                                <div className="comparison-row">
                                                    <span className="comparison-label">Total Distance:</span>
                                                    <span className="comparison-value">{selectedRoute.distance}</span>
                                                </div>
                                                <div className="comparison-row">
                                                    <span className="comparison-label">Estimated Time:</span>
                                                    <span className="comparison-value">{selectedRoute.estimatedTime}</span>
                                                </div>
                                                <div className="comparison-row">
                                                    <span className="comparison-label">Fuel Cost:</span>
                                                    <span className="comparison-value">${selectedRoute.fuelCost}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Optimized Route */}
                                        <div className="comparison-card comparison-optimized">
                                            <h4 className="comparison-title">Optimized Route</h4>
                                            <div className="space-y-2">
                                                <div className="comparison-row">
                                                    <span className="comparison-label">Total Distance:</span>
                                                    <span className="comparison-value">{optimizedRoute.distance}</span>
                                                </div>
                                                <div className="comparison-row">
                                                    <span className="comparison-label">Estimated Time:</span>
                                                    <span className="comparison-value">{optimizedRoute.estimatedTime}</span>
                                                </div>
                                                <div className="comparison-row">
                                                    <span className="comparison-label">Fuel Cost:</span>
                                                    <span className="comparison-value">${optimizedRoute.fuelCost}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Improvement Stats */}
                                    {optimizedRoute.improvements && (
                                        <div className="improvements-card">
                                            <h4 className="improvements-title">Improvements</h4>
                                            <div className="improvements-grid">
                                                <div>
                                                    <p className="improvement-label">Distance Saved</p>
                                                    <p className="improvement-value">{optimizedRoute.improvements.distanceSaved}</p>
                                                </div>
                                                <div>
                                                    <p className="improvement-label">Time Saved</p>
                                                    <p className="improvement-value">{optimizedRoute.improvements.timeSaved}</p>
                                                </div>
                                                <div>
                                                    <p className="improvement-label">Cost Saved</p>
                                                    <p className="improvement-value">${optimizedRoute.improvements.costSaved}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="btn-group">
                                        <button
                                            onClick={handleAcceptRoute}
                                            className="btn btn-success"
                                        >
                                            <CheckCircle className="btn-icon" />
                                            <span>Accept</span>
                                        </button>
                                        <button
                                            onClick={handleRejectRoute}
                                            className="btn btn-danger"
                                        >
                                            <XCircle className="btn-icon" />
                                            <span>Reject</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Map with Real Visualization */}
                            <div className="card">
                                <h3 className="section-title-lg">Route Map</h3>
                                <div className="map-container">
                                    {selectedRoute ? (
                                        <RouteMap
                                            route={selectedRoute}
                                            optimizedRoute={optimizedRoute}
                                        />
                                    ) : (
                                        <div className="map-placeholder">
                                            <MapPin className="map-icon" />
                                            <p className="map-text">Select a route to view on map</p>
                                            <p className="map-subtext">Map will show collection points and route path</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'assign' && (
                    <div className="grid-12">
                        {/* Collector Filters */}
                        <div className="col-span-3 card">
                            <h3 className="section-title">Collector Filters</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="form-label">Availability</label>
                                    <select
                                        className="form-select"
                                        value={filters.collectorAvailability}
                                        onChange={(e) => setFilters({...filters, collectorAvailability: e.target.value})}
                                    >
                                        <option value="">All Status</option>
                                        <option value="Available">Available</option>
                                        <option value="On Route">On Route</option>
                                        <option value="On Break">On Break</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="form-label">Workload</label>
                                    <select
                                        className="form-select"
                                        value={filters.collectorWorkload}
                                        onChange={(e) => setFilters({...filters, collectorWorkload: e.target.value})}
                                    >
                                        <option value="">All Workload</option>
                                        <option value="low">Low (&lt;50%)</option>
                                        <option value="medium">Medium (50-80%)</option>
                                        <option value="high">High (&gt;80%)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="form-label">Route Selection</label>
                                    <select
                                        className="form-select"
                                        value={selectedRoute?.id || ''}
                                        onChange={(e) => {
                                            const route = routes.find(r => r.id === e.target.value);
                                            setSelectedRoute(route);
                                        }}
                                    >
                                        <option value="">Select a route</option>
                                        {routes
                                            .filter(r => r.status === 'Optimized' || r.status === 'Planned')
                                            .map(route => (
                                                <option key={route.id} value={route.id}>
                                                    {route.name}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Collectors List and Assignment */}
                        <div className="col-span-9 space-y-6">
                            {/* Selected Route Info */}
                            {selectedRoute && (
                                <div className="card">
                                    <h3 className="section-title-lg">Selected Route for Assignment</h3>
                                    <div className="selected-route-info">
                                        <div className="selected-route-details">
                                            <p>{selectedRoute.name}</p>
                                            <p>{selectedRoute.area} • {selectedRoute.distance} • {selectedRoute.estimatedTime}</p>
                                        </div>
                                        <span className={`status-badge ${getStatusClass(selectedRoute.status)}`}>
                                            {selectedRoute.status}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Collectors Grid */}
                            <div className="card">
                                <h3 className="section-title-lg">Available Collectors</h3>
                                <div className="collectors-grid">
                                    {filteredCollectors.length === 0 ? (
                                        <p className="text-center text-gray-500">No collectors found</p>
                                    ) : (
                                        filteredCollectors.map(collector => (
                                            <div
                                                key={collector.id}
                                                onClick={() => setSelectedCollector(collector)}
                                                className={`collector-card ${selectedCollector?.id === collector.id ? 'selected' : ''}`}
                                            >
                                                <div className="collector-header">
                                                    <div className="collector-info">
                                                        <div className="collector-avatar">
                                                            <Users className="collector-avatar-icon" />
                                                        </div>
                                                        <div>
                                                            <p className="collector-name">{collector.name}</p>
                                                            <p className="collector-id">{collector.email}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`collector-status ${
                                                        collector.status === 'Available' ? 'available' :
                                                            collector.status === 'On Route' ? 'on-route' :
                                                                'on-break'
                                                    }`}>
                                                        {collector.status}
                                                    </span>
                                                </div>

                                                <div className="collector-details space-y-2">
                                                    <div className="collector-detail-row">
                                                        <span className="collector-detail-label">Location:</span>
                                                        <span className="collector-detail-value">{collector.currentLocation}</span>
                                                    </div>
                                                    <div className="collector-detail-row">
                                                        <span className="collector-detail-label">Workload:</span>
                                                        <span className="collector-detail-value">{collector.workload}</span>
                                                    </div>
                                                    {collector.assignedRoute && (
                                                        <div className="collector-detail-row">
                                                            <span className="collector-detail-label">Current Route:</span>
                                                            <span className="collector-detail-value">{collector.assignedRoute}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Workload Bar */}
                                                <div>
                                                    <div className="workload-bar">
                                                        <div
                                                            className={`workload-fill ${
                                                                parseInt(collector.workload) < 50 ? 'workload-low' :
                                                                    parseInt(collector.workload) < 80 ? 'workload-medium' :
                                                                        'workload-high'
                                                            }`}
                                                            style={{width: collector.workload}}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Assignment Action */}
                            {selectedRoute && selectedCollector && (
                                <div className="card">
                                    <h3 className="section-title-lg">Confirm Assignment</h3>
                                    <div className="assignment-confirmation">
                                        <div className="assignment-row">
                                            <span className="assignment-label">Route:</span>
                                            <span className="assignment-value">{selectedRoute.name}</span>
                                        </div>
                                        <div className="assignment-row">
                                            <span className="assignment-label">Collector:</span>
                                            <span className="assignment-value">{selectedCollector.name}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleAssignCollector}
                                        className="btn btn-primary"
                                        disabled={selectedCollector.status !== 'Available'}
                                    >
                                        <Send className="btn-icon" />
                                        <span>Assign and Notify Collector</span>
                                    </button>
                                    {selectedCollector.status !== 'Available' && (
                                        <p className="text-sm text-red-500 mt-2">
                                            This collector is not available for assignment
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WasteManagementSystem;