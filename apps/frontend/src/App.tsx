import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import KYC from './pages/KYC';
import Voice from './pages/Voice';
import AuditLogs from './pages/AuditLogs';
import Tenants from './pages/Tenants';
import Settings from './pages/Settings';
import Login from './pages/Login';

function App() {
  // TODO: Implement proper authentication check
  const isAuthenticated = true;

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="kyc" element={<KYC />} />
        <Route path="voice" element={<Voice />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="tenants" element={<Tenants />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
