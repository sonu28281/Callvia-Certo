import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardSummary from '../components/dashboard/DashboardSummary';
import QuickActions from '../components/dashboard/QuickActions';
import EnabledServicesGrid from '../components/dashboard/EnabledServicesGrid';
import ComingSoonServicesGrid from '../components/dashboard/ComingSoonServicesGrid';
import VerificationWizard from '../components/dashboard/verification/VerificationWizard';
import BulkUploadModal from '../components/dashboard/verification/BulkUploadModal';

interface VerificationStats {
  totalVerifications: number;
  successfulVerifications: number;
  thisMonthUsed: number;
  monthlyQuota: number;
  accountStatus: 'active' | 'suspended' | 'trial';
}

export default function TenantDashboard() {
  const { userProfile, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<VerificationStats>({
    totalVerifications: 0,
    successfulVerifications: 0,
    thisMonthUsed: 0,
    monthlyQuota: 100,
    accountStatus: 'active'
  });
  
  const [showVerificationWizard, setShowVerificationWizard] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user || !userProfile) {
      navigate('/login');
      return;
    }
    
    // Only tenant users should see this dashboard
    if (!userProfile.tenantId) {
      navigate('/');
      return;
    }

    // Fetch verification stats
    fetchStats();
  }, [user, userProfile, navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch(API_ENDPOINTS.DASHBOARD.STATS, {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // const data = await response.json();
      // setStats(data.data);

      // Mock data for now
      setStats({
        totalVerifications: 142,
        successfulVerifications: 138,
        thisMonthUsed: 12,
        monthlyQuota: 100,
        accountStatus: 'active'
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {userProfile?.displayName || 'User'}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Tenant: {userProfile?.tenantId}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-8">
        <DashboardSummary stats={stats} />
      </div>

      {/* Usage Warning */}
      {stats.thisMonthUsed > stats.monthlyQuota * 0.8 && (
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-yellow-900">Usage Warning</h3>
            <p className="text-sm text-yellow-800">
              You've used {stats.thisMonthUsed} of {stats.monthlyQuota} verifications this month. 
              <a href="/settings" className="ml-1 underline font-semibold">Upgrade your plan</a> to increase quota.
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <QuickActions 
          onStartVerification={() => setShowVerificationWizard(true)}
          onBulkUpload={() => setShowBulkUpload(true)}
        />
      </div>

      {/* Enabled Services */}
      <div className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-green-500">✅</span> Enabled Services (Ready to Use)
          </h2>
          <p className="text-gray-600 mt-1">These services are fully functional and ready for your customers</p>
        </div>
        <EnabledServicesGrid onSelectService={(serviceId) => {
          // Route to specific service page
          console.log('Selected service:', serviceId);
        }} />
      </div>

      {/* Coming Soon Services */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-gray-400">⏳</span> Coming Soon (Q2-Q4 2026)
          </h2>
          <p className="text-gray-600 mt-1">These features are under development and will be available soon</p>
        </div>
        <ComingSoonServicesGrid />
      </div>

      {/* Modals */}
      {showVerificationWizard && (
        <VerificationWizard 
          onClose={() => setShowVerificationWizard(false)}
          onSuccess={() => {
            setShowVerificationWizard(false);
            // Refresh stats
            fetchStats();
          }}
        />
      )}

      {showBulkUpload && (
        <BulkUploadModal 
          onClose={() => setShowBulkUpload(false)}
          onSuccess={() => {
            setShowBulkUpload(false);
            // Refresh stats
            fetchStats();
          }}
        />
      )}
    </div>
  );
}
