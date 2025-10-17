/**
 * Main Application Component
 * 
 * Purpose: Root component managing routing and layout
 * Responsibilities:
 * - Define application routes
 * - Manage layout components (Header, Footer, SideNavigation)
 * - Handle route-based conditional rendering
 * 
 * @component
 * @author Smart Waste Management System
 * @since 2025-10-15
 */

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
import WasteManagerDashboard from './pages/WasteManagerDashboard';
import MonthlyReports from './pages/MonthlyReports';
import ReportHistory from './pages/ReportHistory';
import ReportGeneration from './pages/ReportGeneration';
import DataAnalysis from './pages/DataAnalysis';


/**
 * Main App Component
 * Follows Single Responsibility Principle: Only handles routing and layout
 */
function App() {
  const location = useLocation();
  
  // Determine which pages should hide header/footer
  const isAlertManagementPage = location.pathname === '/alert-management';
  const isAssignedRoutesPage = location.pathname === '/assigned-routes';
  const isAdminRoutesPage = location.pathname === '/admin-routes';
  const isLiveMonitorPage = location.pathname === '/live-monitor';
  const isWasteManagerDashboard = location.pathname === '/waste-manager-dashboard';
  const isMonthlyReportsPage = location.pathname === '/monthly-reports';
  const isReportHistoryPage = location.pathname === '/report-history';
  const isReportGenerationPage = location.pathname === '/report-generation';
  const isDataAnalysisPage = location.pathname === '/data-analysis';
  
  const hideHeader = isAlertManagementPage || isAssignedRoutesPage || isAdminRoutesPage || isLiveMonitorPage || isWasteManagerDashboard || isMonthlyReportsPage || isReportHistoryPage || isReportGenerationPage || isDataAnalysisPage;
  const hideSideNav = isWasteManagerDashboard || isMonthlyReportsPage || isReportHistoryPage || isReportGenerationPage || isDataAnalysisPage;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Side Navigation - Global component (hidden for Waste Manager pages) */}
      {!hideSideNav && <SideNavigation />}

      <main className="main-content-area" style={hideSideNav ? { width: '100%', marginLeft: 0, padding: 0 } : {}}>
        {/* Conditional Header rendering */}
        {!hideHeader && <Header />}

        {/* Application Routes */}
        <Routes>
          {/* Public routes - No authentication required */}
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

          {/* Protected routes - Require authentication */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manager/profile" 
            element={
              <ProtectedRoute>
                <ManagerProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/assign-collectors" 
            element={
              <ProtectedRoute>
                <AssignCollectors />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Waste Manager Dashboard - Protected route */}
          <Route 
            path="/waste-manager-dashboard" 
            element={
              <ProtectedRoute>
                <WasteManagerDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Monthly Reports - Protected route */}
          <Route 
            path="/monthly-reports" 
            element={
              <ProtectedRoute>
                <MonthlyReports />
              </ProtectedRoute>
            } 
          />

          {/* Report History - Protected route */}
          <Route 
            path="/report-history" 
            element={
              <ProtectedRoute>
                <ReportHistory />
              </ProtectedRoute>
            } 
          />

          {/* Report Generation - Protected route */}
          <Route 
            path="/report-generation" 
            element={
              <ProtectedRoute>
                <ReportGeneration />
              </ProtectedRoute>
            } 
          />

          {/* Data Analysis - Protected route */}
          <Route 
            path="/data-analysis" 
            element={
              <ProtectedRoute>
                <DataAnalysis />
              </ProtectedRoute>
            } 
          />

          {/* Redirect unknown paths to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {/* Conditional Footer rendering */}
        {!hideHeader && <Footer/>}
      </main>
    </div>
  );
}

export default App;
