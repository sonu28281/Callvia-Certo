import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DashboardLayout from './components/layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import TenantDashboard from './pages/TenantDashboard';
import TenantImpersonationDashboard from './pages/TenantImpersonationDashboard';
import Wallet from './pages/Wallet';
import KYC from './pages/KYC';
import Voice from './pages/Voice';
import AuditLogs from './pages/AuditLogs';
import Tenants from './pages/Tenants';
import Settings from './pages/Settings';
import TenantProfile from './pages/TenantProfile';
import Login from './pages/Login';
import SignupNew from './pages/SignupNew';
import VerifyKYC from './pages/VerifyKYC';
import DigitalKYC from './pages/DigitalKYC';
import LiveKYC from './pages/LiveKYC';
import UnifiedKYC from './pages/UnifiedKYC';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public KYC Verification Routes (No Auth) */}
      <Route path="/verify/kyc/:sessionId" element={<VerifyKYC />} />
      <Route path="/kyc/digital" element={<DigitalKYC />} />
      <Route path="/kyc/live" element={<LiveKYC />} />
      <Route path="/kyc/unified/:sessionId" element={<UnifiedKYC />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/signup" element={!user ? <SignupNew /> : <Navigate to="/" replace />} />
      
      {/* Tenant Impersonation Dashboard (Top-level route) */}
      <Route path="/tenant-impersonation" element={user ? <TenantImpersonationDashboard /> : <Navigate to="/login" replace />} />
      
      {user ? (
        <>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="tenant-dashboard" element={<TenantDashboard />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="kyc" element={<KYC />} />
            <Route path="voice" element={<Voice />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="tenants" element={<Tenants />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<TenantProfile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
