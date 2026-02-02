import { Plus, Upload, BarChart3, FileText } from 'lucide-react';

interface QuickActionsProps {
  onStartVerification: () => void;
  onBulkUpload: () => void;
}

export default function QuickActions({ onStartVerification, onBulkUpload }: QuickActionsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="text-base font-bold text-gray-900 mb-3">🚀 Quick Actions</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Start New Verification */}
        <button
          onClick={onStartVerification}
          className="group relative bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg p-4 text-center transition-all shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <div className="flex flex-col items-center gap-2">
            <Plus className="w-6 h-6" />
            <div>
              <p className="font-semibold text-sm">Start New</p>
              <p className="text-blue-100 text-xs">Verification</p>
            </div>
          </div>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity"></div>
        </button>

        {/* Bulk Upload */}
        <button
          onClick={onBulkUpload}
          className="group relative bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg p-4 text-center transition-all shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-6 h-6" />
            <div>
              <p className="font-semibold text-sm">Bulk Upload</p>
              <p className="text-emerald-100 text-xs">(CSV)</p>
            </div>
          </div>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity"></div>
        </button>

        {/* View Reports */}
        <button className="group relative bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg p-4 text-center transition-all shadow-md hover:shadow-lg transform hover:scale-105">
          <div className="flex flex-col items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            <div>
              <p className="font-semibold text-sm">View Reports</p>
              <p className="text-amber-100 text-xs">& History</p>
            </div>
          </div>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity"></div>
        </button>

        {/* Audit Logs */}
        <button className="group relative bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg p-4 text-center transition-all shadow-md hover:shadow-lg transform hover:scale-105">
          <div className="flex flex-col items-center gap-2">
            <FileText className="w-6 h-6" />
            <div>
              <p className="font-semibold text-sm">Audit & Consent</p>
              <p className="text-purple-100 text-xs">Logs</p>
            </div>
          </div>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity"></div>
        </button>
      </div>
    </div>
  );
}
