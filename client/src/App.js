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
import PaymentHistory from './pages/PaymentHistory';
import PaymentMethods from './pages/PaymentMethods';
import AlertManagement from './pages/AlertManagement';

function App() {
  const location = useLocation();
  const isAlertManagementPage = location.pathname === '/alert-management';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Side Navigation appears on all pages */}
      
      <SideNavigation />

      <main className="main-content-area">
        {/* Header appears on all pages except Alert Management */}
        {!isAlertManagementPage && <Header />}

      

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

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Redirect unknown paths */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {!isAlertManagementPage && <Footer/>}
      </main>
    </div>
  );
}

export default App;
