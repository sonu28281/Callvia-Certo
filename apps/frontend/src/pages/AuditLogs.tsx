import { useState } from 'react';
import { FileText, Filter, Download, Search } from 'lucide-react';

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [selectedResult, setSelectedResult] = useState('all');

  // TODO: Fetch from API
  const logs = [
    {
      id: 'log_001',
      eventType: 'LOGIN_SUCCESS',
      eventResult: 'ALLOWED',
      actorId: 'user_123',
      actorRole: 'TENANT_ADMIN',
      targetEntity: 'SESSION',
      message: 'User logged in successfully',
      ipAddress: '192.168.1.1',
      timestamp: '2024-01-25 14:30:15',
    },
    {
      id: 'log_002',
      eventType: 'KYC_STARTED',
      eventResult: 'ALLOWED',
      actorId: 'user_123',
      actorRole: 'TENANT_ADMIN',
      targetEntity: 'KYC_SESSION',
      targetId: 'kyc_001',
      message: 'KYC verification initiated',
      ipAddress: '192.168.1.1',
      timestamp: '2024-01-25 14:25:10',
    },
    {
      id: 'log_003',
      eventType: 'WALLET_DEDUCTED',
      eventResult: 'ALLOWED',
      actorId: 'system',
      actorRole: 'SYSTEM',
      targetEntity: 'WALLET',
      message: 'Wallet balance deducted for KYC service',
      amount: 2.5,
      timestamp: '2024-01-25 14:25:11',
    },
    {
      id: 'log_004',
      eventType: 'WALLET_INSUFFICIENT_BALANCE',
      eventResult: 'BLOCKED',
      actorId: 'user_456',
      actorRole: 'AGENT',
      targetEntity: 'WALLET',
      message: 'Insufficient wallet balance',
      requiredAmount: 5.0,
      currentBalance: 2.5,
      ipAddress: '192.168.1.2',
      timestamp: '2024-01-25 13:45:30',
    },
    {
      id: 'log_005',
      eventType: 'PERMISSION_DENIED',
      eventResult: 'BLOCKED',
      actorId: 'user_789',
      actorRole: 'VIEWER',
      targetEntity: 'TENANT',
      message: 'User attempted to access unauthorized resource',
      ipAddress: '192.168.1.3',
      timestamp: '2024-01-25 12:15:45',
    },
  ];

  const eventTypes = [
    'all',
    'LOGIN_SUCCESS',
    'LOGIN_FAILED',
    'KYC_STARTED',
    'KYC_COMPLETED',
    'WALLET_TOPUP',
    'WALLET_DEDUCTED',
    'WALLET_INSUFFICIENT_BALANCE',
    'PERMISSION_DENIED',
  ];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      searchQuery === '' ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actorId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEvent = selectedEvent === 'all' || log.eventType === selectedEvent;
    const matchesResult = selectedResult === 'all' || log.eventResult === selectedResult;
    
    return matchesSearch && matchesEvent && matchesResult;
  });

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting audit logs...');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-1">
            View and export comprehensive audit trail
          </p>
        </div>
        <button
          onClick={handleExport}
          className="btn btn-secondary flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="input pl-10"
              />
            </div>
          </div>

          {/* Event Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type
            </label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="input"
            >
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Events' : type}
                </option>
              ))}
            </select>
          </div>

          {/* Result Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Result
            </label>
            <select
              value={selectedResult}
              onChange={(e) => setSelectedResult(e.target.value)}
              className="input"
            >
              <option value="all">All Results</option>
              <option value="ALLOWED">Allowed</option>
              <option value="BLOCKED">Blocked</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <p className="text-sm text-gray-600">Total Logs</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{logs.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Allowed</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {logs.filter(l => l.eventResult === 'ALLOWED').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Blocked</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {logs.filter(l => l.eventResult === 'BLOCKED').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Failed</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {logs.filter(l => l.eventResult === 'FAILED').length}
          </p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Audit Trail ({filteredLogs.length} logs)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Timestamp
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Event Type
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Actor
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Message
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                  Result
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4">
                    <span className="badge badge-info text-xs">
                      {log.eventType}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-900">{log.actorId}</div>
                    <div className="text-xs text-gray-500">{log.actorRole}</div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {log.message}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`badge ${
                        log.eventResult === 'ALLOWED'
                          ? 'badge-success'
                          : log.eventResult === 'BLOCKED'
                          ? 'badge-danger'
                          : 'badge-warning'
                      }`}
                    >
                      {log.eventResult}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {log.ipAddress || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No audit logs found</p>
          </div>
        )}
      </div>
    </div>
  );
}
