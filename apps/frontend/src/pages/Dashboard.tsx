import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  UserCheck,
  Phone,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Redirect TENANT_ADMIN to tenant dashboard
  useEffect(() => {
    if (userProfile?.role === 'TENANT_ADMIN') {
      console.log('🔄 Redirecting TENANT_ADMIN to tenant dashboard');
      navigate('/tenant-dashboard', { replace: true });
      return;
    }
    setTimeout(() => setLoading(false), 500);
  }, [userProfile?.role, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Wallet Balance',
      value: '$1,250.50',
      change: '+12.5%',
      trend: 'up',
      icon: Wallet,
      color: 'accent',
    },
    {
      name: 'KYC Verifications',
      value: '145',
      change: '+8 today',
      trend: 'up',
      icon: UserCheck,
      color: 'primary',
    },
    {
      name: 'Voice Calls',
      value: '89',
      change: '+23 today',
      trend: 'up',
      icon: Phone,
      color: 'primary',
    },
    {
      name: 'Pending Actions',
      value: '12',
      change: '3 urgent',
      trend: 'warning',
      icon: AlertCircle,
      color: 'warning',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'KYC',
      description: 'KYC verification completed for John Doe',
      time: '5 minutes ago',
      status: 'success',
    },
    {
      id: 2,
      type: 'Wallet',
      description: 'Wallet topped up $500',
      time: '1 hour ago',
      status: 'success',
    },
    {
      id: 3,
      type: 'Voice',
      description: 'Voice verification failed for Jane Smith',
      time: '2 hours ago',
      status: 'error',
    },
    {
      id: 4,
      type: 'KYC',
      description: 'KYC verification started for Bob Johnson',
      time: '3 hours ago',
      status: 'pending',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header with User Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {userProfile?.displayName || user?.email?.split('@')[0] || 'User'}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              {userProfile?.role === 'PLATFORM_ADMIN' 
                ? 'Super Admin Dashboard - Managing all tenants' 
                : userProfile?.role === 'TENANT_ADMIN'
                ? `Company Admin Dashboard`
                : 'User Dashboard'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Role</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              userProfile?.role === 'PLATFORM_ADMIN' 
                ? 'bg-purple-100 text-purple-800'
                : userProfile?.role === 'TENANT_ADMIN'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {userProfile?.role === 'PLATFORM_ADMIN' 
                ? '🔥 Super Admin' 
                : userProfile?.role === 'TENANT_ADMIN'
                ? '👔 Tenant Admin'
                : '👤 User'}
            </span>
          </div>
        </div>
      </div>

      {/* Page Subtitle */}
      <div>
        <p className="text-gray-600">
          Overview of your verification platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp
                    className={`w-4 h-4 mr-1 ${
                      stat.trend === 'up'
                        ? 'text-green-600'
                        : stat.trend === 'warning'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      stat.trend === 'up'
                        ? 'text-green-600'
                        : stat.trend === 'warning'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  stat.color === 'accent'
                    ? 'bg-accent-100'
                    : stat.color === 'warning'
                    ? 'bg-yellow-100'
                    : 'bg-primary-100'
                }`}
              >
                <stat.icon
                  className={`w-6 h-6 ${
                    stat.color === 'accent'
                      ? 'text-accent-600'
                      : stat.color === 'warning'
                      ? 'text-yellow-600'
                      : 'text-primary-600'
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h2>
          <a
            href="/audit-logs"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            View all
          </a>
        </div>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50"
            >
              <div
                className={`w-2 h-2 mt-2 rounded-full ${
                  activity.status === 'success'
                    ? 'bg-green-500'
                    : activity.status === 'error'
                    ? 'bg-red-500'
                    : 'bg-yellow-500'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
              <span
                className={`badge ${
                  activity.status === 'success'
                    ? 'badge-success'
                    : activity.status === 'error'
                    ? 'badge-danger'
                    : 'badge-warning'
                }`}
              >
                {activity.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a href="/kyc" className="card hover:shadow-md transition-shadow">
          <UserCheck className="w-8 h-8 text-primary-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Start KYC Verification
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            Verify customer identity with document checks
          </p>
        </a>

        <a href="/voice" className="card hover:shadow-md transition-shadow">
          <Phone className="w-8 h-8 text-primary-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Voice Verification
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            Authenticate users via voice biometrics
          </p>
        </a>

        <a href="/wallet" className="card hover:shadow-md transition-shadow">
          <Wallet className="w-8 h-8 text-accent-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Recharge Wallet
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            Add funds to continue using services
          </p>
        </a>
      </div>
    </div>
  );
}
