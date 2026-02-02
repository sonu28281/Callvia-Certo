import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckCircle2,
  BarChart3,
  Settings,
  FileText,
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';



export default function TenantImpersonationDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'verifications' | 'reports' | 'settings' | 'audit' | 'team'>('dashboard');

  // Get impersonation data from sessionStorage
  const impersonationData = {
    tenantId: sessionStorage.getItem('impersonatedTenantId') || '',
    tenantName: sessionStorage.getItem('impersonatedTenantName') || '',
    impersonatedBy: sessionStorage.getItem('impersonatedBy') || '',
  };

  // Check if we're actually in impersonation mode
  if (!impersonationData.tenantId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No tenant selected</p>
          <button
            onClick={() => navigate('/tenants')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to Tenants
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    // Clear impersonation data
    sessionStorage.removeItem('impersonatedTenantId');
    sessionStorage.removeItem('impersonatedTenantName');
    sessionStorage.removeItem('impersonatedBy');
    navigate('/tenants');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'verifications', label: 'Verifications', icon: CheckCircle2 },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
    { id: 'team', label: 'Team Members', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <p className="text-xs text-gray-400">Viewing as</p>
                <h2 className="text-lg font-bold truncate">{impersonationData.tenantName}</h2>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Exit Impersonation</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentPage === 'dashboard' && '📊 Dashboard'}
              {currentPage === 'verifications' && '✓ Verifications'}
              {currentPage === 'reports' && '📈 Reports'}
              {currentPage === 'audit' && '📋 Audit Logs'}
              {currentPage === 'team' && '👥 Team Members'}
              {currentPage === 'settings' && '⚙️ Settings'}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Impersonating: {impersonationData.tenantName}</p>
            <p className="text-xs text-gray-400">Tenant ID: {impersonationData.tenantId}</p>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {currentPage === 'dashboard' && <DashboardPage />}
            {currentPage === 'verifications' && <VerificationsPage />}
            {currentPage === 'reports' && <ReportsPage />}
            {currentPage === 'audit' && <AuditLogsPage />}
            {currentPage === 'team' && <TeamPage />}
            {currentPage === 'settings' && <SettingsPage />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard Page Content
function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-medium">Total Verifications</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">42</p>
          <p className="text-xs text-green-600 mt-1">↑ 5 this month</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium">Successful</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">40</p>
          <p className="text-xs text-gray-500 mt-1">95% success rate</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
          <p className="text-gray-600 text-sm font-medium">Pending Review</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">2</p>
          <p className="text-xs text-yellow-600 mt-1">Awaiting verification</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm font-medium">This Month Usage</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">42/500</p>
          <p className="text-xs text-gray-500 mt-1">8% of quota used</p>
        </div>
      </div>

      {/* Recent Verifications */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Verifications</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Aadhaar</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">PAN</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Bank</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Result</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { customer: 'John Doe', aadhaar: '✅', pan: '✅', bank: '✅', result: 'Pass', date: 'Feb 2' },
                { customer: 'Jane Smith', aadhaar: '✅', pan: '✅', bank: '⏳', result: 'Review', date: 'Feb 2' },
                { customer: 'Bob Johnson', aadhaar: '✅', pan: '✅', bank: '✅', result: 'Pass', date: 'Feb 1' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900 font-medium">{row.customer}</td>
                  <td className="py-3 px-4 text-gray-600">{row.aadhaar}</td>
                  <td className="py-3 px-4 text-gray-600">{row.pan}</td>
                  <td className="py-3 px-4 text-gray-600">{row.bank}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      row.result === 'Pass' ? 'bg-green-100 text-green-700' :
                      row.result === 'Review' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {row.result}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Verifications Page
function VerificationsPage() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold">
          + New Verification
        </button>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold">
          📊 Filter
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Services</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900 font-mono text-xs">VER-2026-{String(i).padStart(5, '0')}</td>
                <td className="py-3 px-4 text-gray-900">Customer {i}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">Verified</span>
                </td>
                <td className="py-3 px-4 text-gray-600 text-xs">Aadhaar, PAN, Bank</td>
                <td className="py-3 px-4 text-gray-500 text-xs">Feb {2 - Math.floor(i / 2)}</td>
                <td className="py-3 px-4">
                  <button className="text-blue-600 hover:text-blue-700 font-semibold text-xs">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Reports Page
function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4">Verification Success Rate</h3>
          <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">📊 95% Success Rate (40/42)</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4">Monthly Usage Trend</h3>
          <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">📈 42 verifications this month</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4">Service Breakdown</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Aadhaar Verifications</span>
              <span className="text-sm text-gray-600">40/42</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '95%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">PAN Verifications</span>
              <span className="text-sm text-gray-600">40/42</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Bank Verifications</span>
              <span className="text-sm text-gray-600">38/42</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '90%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Audit Logs Page
function AuditLogsPage() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Date & Time</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">IP Address</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {[
            { date: 'Feb 2, 10:15 AM', user: 'admin@company.com', action: 'Aadhaar OTP sent', customer: 'John Doe', status: 'Success', ip: '203.0.113.45' },
            { date: 'Feb 2, 10:14 AM', user: 'admin@company.com', action: 'Verification started', customer: 'John Doe', status: 'Success', ip: '203.0.113.45' },
            { date: 'Feb 2, 10:10 AM', user: 'admin@company.com', action: 'Consent captured', customer: 'Jane Smith', status: 'Success', ip: '203.0.113.46' },
            { date: 'Feb 1, 09:45 PM', user: 'admin@company.com', action: 'Bulk upload completed', customer: 'N/A', status: 'Success', ip: '203.0.113.47' },
          ].map((log, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="py-3 px-4 text-gray-900 text-xs">{log.date}</td>
              <td className="py-3 px-4 text-gray-600 text-sm">{log.user}</td>
              <td className="py-3 px-4 text-gray-600 text-sm">{log.action}</td>
              <td className="py-3 px-4 text-gray-600 text-sm">{log.customer}</td>
              <td className="py-3 px-4">
                <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">{log.status}</span>
              </td>
              <td className="py-3 px-4 text-gray-500 text-xs font-mono">{log.ip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Team Page
function TeamPage() {
  return (
    <div className="space-y-4">
      <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold">
        + Invite Team Member
      </button>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              { name: 'Raj Singh', email: 'raj@company.com', role: 'Admin', status: 'Active', joined: 'Jan 15' },
              { name: 'Priya Sharma', email: 'priya@company.com', role: 'User', status: 'Active', joined: 'Jan 20' },
              { name: 'Amit Kumar', email: 'amit@company.com', role: 'Viewer', status: 'Pending', joined: 'Feb 1' },
            ].map((member, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900 font-medium">{member.name}</td>
                <td className="py-3 px-4 text-gray-600">{member.email}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">{member.role}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    member.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {member.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500 text-xs">{member.joined}</td>
                <td className="py-3 px-4">
                  <button className="text-blue-600 hover:text-blue-700 font-semibold text-xs">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Settings Page
function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* API Keys */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4">API Keys</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Live API Key</p>
                <p className="text-xs text-gray-500 mt-1 font-mono">sk_live_abc12345xyz789...</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">Copy</button>
            </div>
          </div>
          <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-semibold text-sm">
            Regenerate Key
          </button>
        </div>
      </div>

      {/* Webhook URL */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4">Webhook Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
            <input
              type="text"
              placeholder="https://your-company.com/webhooks/kyc"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold text-sm">
              Save
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-sm">
              Test Webhook
            </button>
          </div>
        </div>
      </div>

      {/* Billing */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4">Billing & Usage</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Current Plan</span>
            <span className="font-semibold text-gray-900">Professional ($299/mo)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Billing Cycle</span>
            <span className="font-semibold text-gray-900">Feb 1 - Feb 28</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Verifications Used</span>
            <span className="font-semibold text-gray-900">42 / 500</span>
          </div>
          <button className="mt-4 px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold text-sm w-full">
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Company Profile */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4">Company Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
            <input
              type="text"
              placeholder="Your Company Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              defaultValue={sessionStorage.getItem('impersonatedTenantName') || ''}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
            <input
              type="email"
              placeholder="contact@company.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold text-sm">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
