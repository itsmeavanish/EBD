import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Forms from './pages/Forms';
import Auth from './pages/Auth';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EnhancedAdminDashboard from './pages/EnhancedAdminDashboard';
import BrandPortal from './pages/BrandPortal';
import BrandAccess from './pages/BrandAccess';
import RefundForms from './pages/RefundForms';
import AllotOrders from './pages/AllotOrders';
import OrderForm from './components/forms/OrderForm';
import RefundForm from './components/forms/RefundForm';
import RefundFormWithVerification from './components/forms/RefundFormWithVerification';
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly = false }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/user-dashboard" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
    const navigate = useNavigate();
  const handleBackToForms = () => {
    navigate("/forms")
  };
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        
        <Route path="auth" element={<Auth />} />
        <Route
          path="forms"
          element={
            <ProtectedRoute>
              <Forms />
            </ProtectedRoute>
          }
        />
        <Route
          path="forms/orderforms"
          element={
            <ProtectedRoute>
              <OrderForm onBack={handleBackToForms} />
            </ProtectedRoute>
          }
        />
        <Route
          path="forms/refundforms"
          element={
            <ProtectedRoute>
              <RefundFormWithVerification onBack={handleBackToForms} />
            </ProtectedRoute>
          }
        />
        <Route
          path="user-dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin-dashboard"
          element={
            <ProtectedRoute adminOnly>
              <EnhancedAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="allot-orders"
          element={
            <ProtectedRoute adminOnly>
              <AllotOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="brand-portal"
          element={
            <ProtectedRoute>
              <BrandPortal />
            </ProtectedRoute>
          }
        />
        <Route path="brand-access" element={<BrandAccess />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;