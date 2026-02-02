import { useAuth } from '../contexts/AuthContext';

export default function TenantVerifications() {
  const { userProfile } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Verifications</h1>
        <p className="text-gray-600 mt-1">Manage and track customer verifications</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-500">Verifications module for {userProfile?.tenantId}</p>
        <p className="text-sm text-gray-400 mt-2">Coming soon: Detailed verification tracking and management</p>
      </div>
    </div>
  );
}
