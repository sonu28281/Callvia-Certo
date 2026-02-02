import { TrendingUp, CheckCircle2, Activity, Shield } from 'lucide-react';

interface VerificationStats {
  totalVerifications: number;
  successfulVerifications: number;
  thisMonthUsed: number;
  monthlyQuota: number;
  accountStatus: 'active' | 'suspended' | 'trial';
}

interface DashboardSummaryProps {
  stats: VerificationStats;
}

export default function DashboardSummary({ stats }: DashboardSummaryProps) {
  const successRate = stats.totalVerifications > 0 
    ? Math.round((stats.successfulVerifications / stats.totalVerifications) * 100)
    : 0;
  
  const usagePercentage = Math.round((stats.thisMonthUsed / stats.monthlyQuota) * 100);

  const statusColor = stats.accountStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  const statusIcon = stats.accountStatus === 'active' ? '✅' : '⚠️';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Verifications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-gray-600 font-medium text-sm">Total Verifications</h3>
          <TrendingUp className="w-5 h-5 text-blue-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">{stats.totalVerifications}</span>
          <span className="text-xs text-gray-500">lifetime</span>
        </div>
      </div>

      {/* Success Rate */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-gray-600 font-medium text-sm">Success Rate</h3>
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">{successRate}%</span>
          <span className="text-xs text-gray-500">{stats.successfulVerifications} passed</span>
        </div>
      </div>

      {/* Monthly Usage */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-gray-600 font-medium text-sm">Monthly Usage</h3>
          <Activity className="w-5 h-5 text-purple-500" />
        </div>
        <div className="mb-3">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold text-gray-900">{stats.thisMonthUsed}</span>
            <span className="text-xs text-gray-500">/ {stats.monthlyQuota}</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                usagePercentage > 80 ? 'bg-red-500' : usagePercentage > 50 ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            ></div>
          </div>
        </div>
        <p className="text-xs text-gray-500">{usagePercentage}% used</p>
      </div>

      {/* Account Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-gray-600 font-medium text-sm">Account Status</h3>
          <Shield className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}>
            {statusIcon} {stats.accountStatus.charAt(0).toUpperCase() + stats.accountStatus.slice(1)}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {stats.accountStatus === 'active' ? 'Ready to use' : 'Review account'}
        </p>
      </div>
    </div>
  );
}
