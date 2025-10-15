import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import Header from './components/Header';
import Footer from './components/Footer';
import SideNavigation from './components/SideNavigation';
import SpecialWasteCollection from './pages/SpecialWasteCollection';
import CollectionSummary from './pages/CollectionSummary';
import UserCollections from './pages/UserCollections';
import ManagerProfile from './pages/ManagerProfile';
import AssignCollectors from './pages/AssignCollectors';
import AdminDashboard from './pages/AdminDashboard';
import PaymentHistory from './pages/PaymentHistory';
import PaymentMethods from './pages/PaymentMethods';
import AlertManagement from './pages/AlertManagement';
import AssignedRoutes from './pages/AssignedRoutes';
import AdminRoutes from './pages/AdminRoutes';
import Profile from './pages/Profile';
import SensorUI from './pages/SensorUI';
import LiveMonitor from './pages/LiveMonitor';

function App() {
  const location = useLocation();
  const isAlertManagementPage = location.pathname === '/alert-management';
  const isAssignedRoutesPage = location.pathname === '/assigned-routes';
  const isAdminRoutesPage = location.pathname === '/admin-routes';
  const isLiveMonitorPage = location.pathname === '/live-monitor';
  const hideHeader = isAlertManagementPage || isAssignedRoutesPage || isAdminRoutesPage || isLiveMonitorPage;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Side Navigation appears on all pages */}
      
      <SideNavigation />

      <main className="main-content-area">
        {/* Header appears on all pages except Alert Management and Assigned Routes */}
        {!hideHeader && <Header />}

      

      {/* Page content */}
      <Routes>
        {/* Public routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/special" element={<SpecialWasteCollection />} />
        <Route path="/collection-summary" element={<CollectionSummary />} />
        <Route path="/collection-history" element={<UserCollections />} />
        
        <Route path="/user-collections" element={<UserCollections />} />
        <Route path="/payment-history" element={<PaymentHistory />} />
        <Route path="/payment-methods" element={<PaymentMethods />} />
        <Route path="/alert-management" element={<AlertManagement />} />
        <Route path="/assigned-routes" element={<AssignedRoutes />} />
        <Route path="/admin-routes" element={<AdminRoutes />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/sensorUI" element={<SensorUI />} />
        <Route path="/live-monitor" element={<LiveMonitor />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/manager/profile" element={<ProtectedRoute><ManagerProfile /></ProtectedRoute>} />
        <Route path="/assign-collectors" element={<ProtectedRoute><AssignCollectors /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

        {/* Redirect unknown paths */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {!hideHeader && <Footer/>}
      </main>
    </div>
  );
}

export default App;
