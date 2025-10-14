import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header appears on all pages */}
      
      <SideNavigation />

      <main className="main-content-area">
        <Header />

      

      {/* Page content */}
      <Routes>
        {/* Public routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/special" element={<SpecialWasteCollection />} />
        <Route path="/collection-summary" element={<CollectionSummary />} />
        <Route path="/collection-history" element={<UserCollections />} />
        

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/manager/profile" element={<ProtectedRoute><ManagerProfile /></ProtectedRoute>} />
        <Route path="/assign-collectors" element={<ProtectedRoute><AssignCollectors /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

        {/* Redirect unknown paths */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      <Footer/>
      </main>
    </div>
  );
}

export default App;
