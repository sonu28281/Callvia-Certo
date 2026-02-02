import { useState, useEffect } from 'react';
import { Users, Plus, LayoutGrid, LayoutList, LogIn, Power } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../config/firebase';
import { API_ENDPOINTS } from '../config/api';

interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: 'enabled' | 'disabled';
  walletBalance: number;
  createdAt: string;
  companyName?: string;
  tenantId?: string;
}

export default function Tenants() {
  const [viewMode, setViewMode] = useState<'cards' | 'grid'>('cards');
  const { userProfile } = useAuth();
  const isSuperAdmin = userProfile?.role === 'PLATFORM_ADMIN';
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  // Fetch tenants from API
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.log('No user logged in');
          setLoading(false);
          return;
        }

        const token = await user.getIdToken();
        const response = await fetch(API_ENDPOINTS.TENANTS.LIST, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();

        if (result.success && result.data.tenants) {
          const formattedTenants = result.data.tenants.map((t: any) => ({
            id: t.tenantId || t.id,
            name: t.companyName || t.name || 'Unknown',
            domain: `${t.companyName?.toLowerCase().replace(/\s+/g, '-') || 'tenant'}.callvia-certo.com`,
            status: t.status || (t.isActive ? 'enabled' : 'disabled'),
            walletBalance: t.wallet?.balance || 0,
            createdAt: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A',
            companyName: t.companyName,
            tenantId: t.tenantId
          }));
          setTenants(formattedTenants);
        }
      } catch (error) {
        console.error('Failed to fetch tenants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  const handleLoginAsTenant = async (tenantId: string, tenantName: string) => {
    try {
      // Store impersonation data
      sessionStorage.setItem('impersonatedTenantId', tenantId);
      sessionStorage.setItem('impersonatedTenantName', tenantName);
      sessionStorage.setItem('impersonatedBy', auth.currentUser?.uid || '');
      
      alert(`Impersonating ${tenantName}. You will now see the tenant's view.`);
      // Reload to apply impersonation
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to login as tenant:', error);
      alert('Failed to login as tenant');
    }
  };

  const handleToggleTenantStatus = async (tenantId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('Please log in first');
        return;
      }

      const token = await user.getIdToken();
      
      const response = await fetch(API_ENDPOINTS.TENANTS.TOGGLE_STATUS(tenantId), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setTenants(prev => prev.map(t => 
          t.id === tenantId 
            ? { ...t, status: result.data.status as 'enabled' | 'disabled' }
            : t
        ));
        console.log('✅ Tenant status updated:', result.data.message);
      } else {
        throw new Error(result.error?.message || 'Failed to update status');
      }
    } catch (error: any) {
      console.error('Failed to toggle tenant status:', error);
      alert(`Failed to update tenant status: ${error.message}`);
    }
  };

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
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-md transition-all duration-300 ${
                viewMode === 'cards'
                  ? 'bg-white text-primary-600 shadow-sm scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:scale-105'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'bg-white text-primary-600 shadow-sm scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:scale-105'
              }`}
              title="Table View"
            >
              <LayoutList className="h-5 w-5" />
            </button>
          </div>
          <button className="btn btn-primary flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Tenant
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && tenants.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tenants</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new tenant.</p>
        </div>
      )}

      {/* Cards View */}
      {!loading && viewMode === 'cards' && tenants.length > 0 && (
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
              <span className={`badge ${tenant.status === 'enabled' ? 'badge-success' : 'badge-error'}`}>
                {tenant.status}
              </span>
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
              {isSuperAdmin && (
                <>
                  <button 
                    onClick={() => handleLoginAsTenant(tenant.id, tenant.name)}
                    disabled={tenant.status === 'disabled'}
                    className="btn btn-primary text-sm flex items-center justify-center flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LogIn className="w-4 h-4 mr-1" />
                    Login as Tenant
                  </button>
                  <button 
                    onClick={() => handleToggleTenantStatus(tenant.id)}
                    className={`btn text-sm flex items-center justify-center flex-1 ${
                      tenant.status === 'enabled' 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    <Power className="w-4 h-4 mr-1" />
                    {tenant.status === 'enabled' ? 'Disable' : 'Enable'}
                  </button>
                </>
              )}
              <button className="btn btn-secondary text-sm flex-1">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Table View */}
      {!loading && viewMode === 'grid' && tenants.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wallet Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                          <div className="text-sm text-gray-500">{tenant.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{tenant.domain}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${tenant.status === 'enabled' ? 'badge-success' : 'badge-error'}`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${tenant.walletBalance.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{tenant.createdAt}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {isSuperAdmin && (
                        <>
                          <button 
                            onClick={() => handleLoginAsTenant(tenant.id, tenant.name)}
                            disabled={tenant.status === 'disabled'}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <LogIn className="w-3 h-3 mr-1" />
                            Login
                          </button>
                          <button 
                            onClick={() => handleToggleTenantStatus(tenant.id)}
                            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white ${
                              tenant.status === 'enabled' 
                                ? 'bg-red-600 hover:bg-red-700' 
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                          >
                            <Power className="w-3 h-3 mr-1" />
                            {tenant.status === 'enabled' ? 'Disable' : 'Enable'}
                          </button>
                        </>
                      )}
                      <button className="text-primary-600 hover:text-primary-900">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
