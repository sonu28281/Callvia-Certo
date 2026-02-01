import { Users, Plus } from 'lucide-react';

export default function Tenants() {
  // TODO: Fetch from API
  const tenants = [
    {
      id: 'tenant_abc',
      name: 'Acme Corporation',
      domain: 'acme.callvia-certo.com',
      status: 'active',
      walletBalance: 1250.5,
      createdAt: '2024-01-01',
    },
    {
      id: 'tenant_xyz',
      name: 'TechStart Inc',
      domain: 'techstart.callvia-certo.com',
      status: 'active',
      walletBalance: 5.5,
      createdAt: '2024-01-15',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-600 mt-1">
            Manage tenants and sub-tenants
          </p>
        </div>
        <button className="btn btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Tenant
        </button>
      </div>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tenants.map((tenant) => (
          <div key={tenant.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {tenant.name}
                  </h3>
                  <p className="text-sm text-gray-500">{tenant.id}</p>
                </div>
              </div>
              <span className="badge badge-success">{tenant.status}</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Domain:</span>
                <span className="text-gray-900">{tenant.domain}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Wallet Balance:</span>
                <span className="text-gray-900 font-medium">
                  ${tenant.walletBalance.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Created:</span>
                <span className="text-gray-900">{tenant.createdAt}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
              <button className="btn btn-secondary text-sm flex-1">
                View Details
              </button>
              <button className="btn btn-secondary text-sm flex-1">
                Settings
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
