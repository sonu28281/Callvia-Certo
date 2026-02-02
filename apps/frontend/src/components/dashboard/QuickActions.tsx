import { Plus, Upload, BarChart3, FileText } from 'lucide-react';

interface QuickActionsProps {
  onStartVerification: () => void;
  onBulkUpload: () => void;
}

export default function QuickActions({ onStartVerification, onBulkUpload }: QuickActionsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h2 className="text-lg font-bold text-gray-900 mb-6">🚀 Quick Actions</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Start New Verification */}
        <button
          onClick={onStartVerification}
          className="group relative bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg p-6 text-center transition-all shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <div className="flex flex-col items-center gap-3">
            <Plus className="w-8 h-8" />
            <div>
              <p className="font-semibold text-lg">Start New</p>
              <p className="text-blue-100 text-sm">Verification</p>
            </div>
          </div>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity"></div>
        </button>

        {/* Bulk Upload */}
        <button
          onClick={onBulkUpload}
          className="group relative bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg p-6 text-center transition-all shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-8 h-8" />
            <div>
              <p className="font-semibold text-lg">Bulk Upload</p>
              <p className="text-emerald-100 text-sm">(CSV)</p>
            </div>
          </div>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity"></div>
        </button>

        {/* View Reports */}
        <button className="group relative bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg p-6 text-center transition-all shadow-md hover:shadow-lg transform hover:scale-105">
          <div className="flex flex-col items-center gap-3">
            <BarChart3 className="w-8 h-8" />
            <div>
              <p className="font-semibold text-lg">View Reports</p>
              <p className="text-amber-100 text-sm">& History</p>
            </div>
          </div>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity"></div>
        </button>

        {/* Audit Logs */}
        <button className="group relative bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg p-6 text-center transition-all shadow-md hover:shadow-lg transform hover:scale-105">
          <div className="flex flex-col items-center gap-3">
            <FileText className="w-8 h-8" />
            <div>
              <p className="font-semibold text-lg">Audit & Consent</p>
              <p className="text-purple-100 text-sm">Logs</p>
            </div>
          </div>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity"></div>
        </button>
      </div>
    </div>
  );
}
