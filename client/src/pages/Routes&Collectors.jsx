import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE_URL = 'http://localhost:4000/api'; // Change to your backend URL

const RoutesCollector = () => {
    const [activeTab, setActiveTab] = useState('routes');
    const [routes, setRoutes] = useState([]);
    const [collectors, setCollectors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [modalType, setModalType] = useState('route');
    const [selectedItem, setSelectedItem] = useState(null);

    const [routeForm, setRouteForm] = useState({
        routeName: '',
        routeCode: '',
        area: '',
        routeType: 'Residential',
        vehicleType: 'Truck',
        estimatedTime: '',
        estimatedDistance: '',
        fuelCost: '',
        priority: 'Medium'
    });

    const [collectorForm, setCollectorForm] = useState({
        userId: '',
        name: '',
        email: '',
        phone: '',
        vehicleId: '',
        vehicleType: 'Truck',
        currentLocation: 'Base Station'
    });

    // Get auth token from localStorage
    const getAuthToken = () => {
        return localStorage.getItem('token') || '';
    };

    // Fetch routes from backend
    const fetchRoutes = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/routes/`, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch routes');

            const result = await response.json();
            setRoutes(result.data || []);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching routes:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch collectors from backend
    const fetchCollectors = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/collectors/`, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch collectors');

            const result = await response.json();
            setCollectors(result.data || []);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching collectors:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoutes();
        fetchCollectors();
    }, []);

    const openCreateModal = (type) => {
        setModalType(type);
        setModalMode('create');
        setSelectedItem(null);
        if (type === 'route') {
            setRouteForm({
                routeName: '',
                routeCode: '',
                area: '',
                routeType: 'Residential',
                vehicleType: 'Truck',
                estimatedTime: '',
                estimatedDistance: '',
                fuelCost: '',
                priority: 'Medium'
            });
        } else {
            setCollectorForm({
                userId: '',
                name: '',
                email: '',
                phone: '',
                vehicleId: '',
                vehicleType: 'Truck',
                currentLocation: 'Base Station'
            });
        }
        setShowModal(true);
    };

    const openEditModal = (type, item) => {
        setModalType(type);
        setModalMode('edit');
        setSelectedItem(item);
        if (type === 'route') {
            setRouteForm({
                routeName: item.name || item.routeName,
                routeCode: item.routeCode,
                area: item.area,
                routeType: item.routeType,
                vehicleType: item.vehicleType,
                estimatedTime: item.estimatedTime,
                estimatedDistance: item.distance || item.estimatedDistance,
                fuelCost: item.fuelCost || '',
                priority: item.priority
            });
        } else {
            setCollectorForm({
                userId: item.userId || '',
                name: item.name,
                email: item.email,
                phone: item.phone,
                vehicleId: item.vehicleId,
                vehicleType: item.vehicleType,
                currentLocation: item.currentLocation || 'Base Station'
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedItem(null);
        setError(null);
    };

    // Create Route
    const createRoute = async (data) => {
        try {
            const response = await fetch(`${API_BASE_URL}/routes/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create route');
            }

            const result = await response.json();
            return result;
        } catch (err) {
            throw err;
        }
    };

    // Update Route
    const updateRoute = async (id, data) => {
        try {
            const response = await fetch(`${API_BASE_URL}/routes/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update route');
            }

            const result = await response.json();
            return result;
        } catch (err) {
            throw err;
        }
    };

    // Delete Route
    const deleteRoute = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/routes/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete route');
            }

            return await response.json();
        } catch (err) {
            throw err;
        }
    };

    // Create Collector
    const createCollector = async (data) => {
        try {
            const response = await fetch(`${API_BASE_URL}/collectors/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create collector');
            }

            const result = await response.json();
            return result;
        } catch (err) {
            throw err;
        }
    };

    // Update Collector
    const updateCollector = async (id, data) => {
        try {
            const response = await fetch(`${API_BASE_URL}/collectors/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update collector');
            }

            const result = await response.json();
            return result;
        } catch (err) {
            throw err;
        }
    };

    // Delete Collector
    const deleteCollectorAPI = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/collectors/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete collector');
            }

            return await response.json();
        } catch (err) {
            throw err;
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            if (modalType === 'route') {
                if (modalMode === 'create') {
                    await createRoute(routeForm);
                    alert('Route created successfully!');
                } else {
                    await updateRoute(selectedItem.id || selectedItem._id, routeForm);
                    alert('Route updated successfully!');
                }
                await fetchRoutes();
            } else {
                if (modalMode === 'create') {
                    await createCollector(collectorForm);
                    alert('Collector created successfully!');
                } else {
                    await updateCollector(selectedItem.id || selectedItem._id, collectorForm);
                    alert('Collector updated successfully!');
                }
                await fetchCollectors();
            }

            closeModal();
        } catch (err) {
            setError(err.message);
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (type === 'route') {
                await deleteRoute(id);
                alert('Route deleted successfully!');
                await fetchRoutes();
            } else {
                await deleteCollectorAPI(id);
                alert('Collector deleted successfully!');
                await fetchCollectors();
            }
        } catch (err) {
            setError(err.message);
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Planned': 'secondary',
            'Optimized': 'info',
            'Active': 'primary',
            'Completed': 'success',
            'Cancelled': 'danger',
            'Delayed': 'warning',
            'Available': 'success',
            'On Route': 'primary',
            'On Break': 'warning',
            'Offline': 'secondary'
        };
        return colors[status] || 'secondary';
    };

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" />

            <div className="row mb-4">
                <div className="col">
                    <h2 className="mb-0">
                        <i className="bi bi-speedometer2 me-2"></i>
                        Admin Dashboard
                    </h2>
                    <p className="text-muted">Manage routes and collectors</p>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                </div>
            )}

            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'routes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('routes')}
                    >
                        <i className="bi bi-map me-2"></i>Routes
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'collectors' ? 'active' : ''}`}
                        onClick={() => setActiveTab('collectors')}
                    >
                        <i className="bi bi-people me-2"></i>Collectors
                    </button>
                </li>
            </ul>

            {activeTab === 'routes' && (
                <div className="card shadow-sm">
                    <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
                        <h5 className="mb-0">Routes Management</h5>
                        <button
                            className="btn btn-primary"
                            onClick={() => openCreateModal('route')}
                            disabled={loading}
                        >
                            <i className="bi bi-plus-circle me-2"></i>Create Route
                        </button>
                    </div>
                    <div className="card-body">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : routes.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <i className="bi bi-inbox" style={{ fontSize: '3rem' }}></i>
                                <p className="mt-3">No routes found. Create your first route!</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="table-light">
                                    <tr>
                                        <th>Route Code</th>
                                        <th>Route Name</th>
                                        <th>Area</th>
                                        <th>Type</th>
                                        <th>Vehicle</th>
                                        <th>Status</th>
                                        <th>Distance</th>
                                        <th>Priority</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {routes.map(route => (
                                        <tr key={route.id || route._id}>
                                            <td><strong>{route.routeCode}</strong></td>
                                            <td>{route.name || route.routeName}</td>
                                            <td>{route.area}</td>
                                            <td>{route.routeType}</td>
                                            <td>{route.vehicleType}</td>
                                            <td>
                          <span className={`badge bg-${getStatusColor(route.status)}`}>
                            {route.status}
                          </span>
                                            </td>
                                            <td>{route.distance || route.estimatedDistance}</td>
                                            <td>
                          <span className={`badge bg-${route.priority === 'High' || route.priority === 'Urgent' ? 'danger' : route.priority === 'Medium' ? 'warning' : 'secondary'}`}>
                            {route.priority}
                          </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                    onClick={() => openEditModal('route', route)}
                                                    disabled={loading}
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete('route', route.id || route._id)}
                                                    disabled={loading}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'collectors' && (
                <div className="card shadow-sm">
                    <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
                        <h5 className="mb-0">Collectors Management</h5>
                        <button
                            className="btn btn-primary"
                            onClick={() => openCreateModal('collector')}
                            disabled={loading}
                        >
                            <i className="bi bi-plus-circle me-2"></i>Create Collector
                        </button>
                    </div>
                    <div className="card-body">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : collectors.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <i className="bi bi-inbox" style={{ fontSize: '3rem' }}></i>
                                <p className="mt-3">No collectors found. Create your first collector!</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="table-light">
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Vehicle ID</th>
                                        <th>Vehicle Type</th>
                                        <th>Status</th>
                                        <th>Workload</th>
                                        <th>Completed</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {collectors.map(collector => (
                                        <tr key={collector.id || collector._id}>
                                            <td><strong>{collector.name}</strong></td>
                                            <td>{collector.email}</td>
                                            <td>{collector.phone}</td>
                                            <td>{collector.vehicleId}</td>
                                            <td>{collector.vehicleType}</td>
                                            <td>
                          <span className={`badge bg-${getStatusColor(collector.status)}`}>
                            {collector.status}
                          </span>
                                            </td>
                                            <td>
                                                <div className="progress" style={{ width: '80px', height: '20px' }}>
                                                    <div
                                                        className="progress-bar"
                                                        style={{ width: collector.workload }}
                                                        role="progressbar"
                                                    >
                                                        {collector.workload}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{collector.completedRoutes || 0}</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                    onClick={() => openEditModal('collector', collector)}
                                                    disabled={loading}
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete('collector', collector.id || collector._id)}
                                                    disabled={loading}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {modalMode === 'create' ? 'Create' : 'Edit'} {modalType === 'route' ? 'Route' : 'Collector'}
                                </h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body">
                                {modalType === 'route' ? (
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Route Name *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={routeForm.routeName}
                                                onChange={(e) => setRouteForm({...routeForm, routeName: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Route Code *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={routeForm.routeCode}
                                                onChange={(e) => setRouteForm({...routeForm, routeCode: e.target.value})}
                                                required
                                                disabled={modalMode === 'edit'}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Area *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={routeForm.area}
                                                onChange={(e) => setRouteForm({...routeForm, area: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Route Type *</label>
                                            <select
                                                className="form-select"
                                                value={routeForm.routeType}
                                                onChange={(e) => setRouteForm({...routeForm, routeType: e.target.value})}
                                            >
                                                <option value="Residential">Residential</option>
                                                <option value="Commercial">Commercial</option>
                                                <option value="Industrial">Industrial</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Vehicle Type *</label>
                                            <select
                                                className="form-select"
                                                value={routeForm.vehicleType}
                                                onChange={(e) => setRouteForm({...routeForm, vehicleType: e.target.value})}
                                            >
                                                <option value="Truck">Truck</option>
                                                <option value="Van">Van</option>
                                                <option value="Compact">Compact</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Priority *</label>
                                            <select
                                                className="form-select"
                                                value={routeForm.priority}
                                                onChange={(e) => setRouteForm({...routeForm, priority: e.target.value})}
                                            >
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                                <option value="Urgent">Urgent</option>
                                            </select>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Estimated Time</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="2.5h"
                                                value={routeForm.estimatedTime}
                                                onChange={(e) => setRouteForm({...routeForm, estimatedTime: e.target.value})}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Distance</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="15 km"
                                                value={routeForm.estimatedDistance}
                                                onChange={(e) => setRouteForm({...routeForm, estimatedDistance: e.target.value})}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Fuel Cost</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="150.00"
                                                value={routeForm.fuelCost}
                                                onChange={(e) => setRouteForm({...routeForm, fuelCost: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="row g-3">
                                        {modalMode === 'create' && (
                                            <div className="col-12">
                                                <div className="alert alert-info">
                                                    <i className="bi bi-info-circle me-2"></i>
                                                    Note: userId is required. Make sure the user exists with role 'collector'.
                                                </div>
                                            </div>
                                        )}
                                        <div className="col-md-6">
                                            <label className="form-label">User ID *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={collectorForm.userId}
                                                onChange={(e) => setCollectorForm({...collectorForm, userId: e.target.value})}
                                                required
                                                disabled={modalMode === 'edit'}
                                                placeholder="Enter user ObjectId"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Name *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={collectorForm.name}
                                                onChange={(e) => setCollectorForm({...collectorForm, name: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Email *</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={collectorForm.email}
                                                onChange={(e) => setCollectorForm({...collectorForm, email: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Phone *</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                value={collectorForm.phone}
                                                onChange={(e) => setCollectorForm({...collectorForm, phone: e.target.value})}
                                                required
                                                placeholder="+94771234567"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Vehicle ID *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={collectorForm.vehicleId}
                                                onChange={(e) => setCollectorForm({...collectorForm, vehicleId: e.target.value})}
                                                required
                                                placeholder="TRK-001"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Vehicle Type *</label>
                                            <select
                                                className="form-select"
                                                value={collectorForm.vehicleType}
                                                onChange={(e) => setCollectorForm({...collectorForm, vehicleType: e.target.value})}
                                            >
                                                <option value="Truck">Truck</option>
                                                <option value="Van">Van</option>
                                                <option value="Compact">Compact</option>
                                            </select>
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label">Current Location</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={collectorForm.currentLocation}
                                                onChange={(e) => setCollectorForm({...collectorForm, currentLocation: e.target.value})}
                                                placeholder="Base Station"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={loading}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        modalMode === 'create' ? 'Create' : 'Update'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoutesCollector;