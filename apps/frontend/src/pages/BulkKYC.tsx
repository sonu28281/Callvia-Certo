import { useState } from 'react';
import { Upload, Download, FileText, CheckCircle, XCircle, AlertCircle, Users } from 'lucide-react';

export default function BulkKYC() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setResults(null);
    }
  };

  const handleProcess = async () => {
    if (!uploadedFile) return;

    setProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setResults({
        total: 50,
        success: 48,
        failed: 2,
        details: [
          { email: 'john@example.com', status: 'success', sessionId: 'kyc_001' },
          { email: 'jane@example.com', status: 'success', sessionId: 'kyc_002' },
          { email: 'invalid-email', status: 'failed', error: 'Invalid email format' },
          // ... more results
        ],
      });
      setProcessing(false);
    }, 2000);
  };

  const downloadTemplate = () => {
    // Create CSV template
    const csvContent = 'name,email,phone,documentTypes\nJohn Doe,john@example.com,+1234567890,passport|driving_license\nJane Smith,jane@example.com,+0987654321,national_id';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kyc_bulk_upload_template.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bulk KYC Upload</h1>
            <p className="text-sm text-gray-600">Send KYC links to multiple customers at once</p>
          </div>
        </div>
        <button
          onClick={downloadTemplate}
          className="btn btn-secondary flex items-center gap-2"
        >
          <Download className="h-5 w-5" />
          Download CSV Template
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How it works:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
          <li>Download the CSV template by clicking the button above</li>
          <li>Fill in your customers' information:
            <ul className="list-disc list-inside ml-6 mt-1">
              <li><strong>name:</strong> Customer full name</li>
              <li><strong>email:</strong> Customer email address</li>
              <li><strong>phone:</strong> Customer phone number (optional)</li>
              <li><strong>documentTypes:</strong> Required documents separated by | (e.g., passport|driving_license)</li>
            </ul>
          </li>
          <li>Upload the filled CSV file</li>
          <li>Review and confirm</li>
          <li>All customers will receive KYC verification links via email</li>
        </ol>
      </div>

      {/* Upload Area */}
      <div className="card">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-400 transition-colors">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {uploadedFile ? (
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {uploadedFile.name}
                </p>
                <p className="text-sm text-gray-500">
                  {(uploadedFile.size / 1024).toFixed(2)} KB
                </p>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="text-sm text-red-600 hover:underline mt-2"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Click to upload CSV file
                </p>
                <p className="text-sm text-gray-500">
                  or drag and drop
                </p>
              </div>
            )}
          </label>
        </div>

        {uploadedFile && !processing && !results && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleProcess}
              className="btn btn-primary"
            >
              Process and Send Links
            </button>
          </div>
        )}
      </div>

      {/* Processing */}
      {processing && (
        <div className="card text-center py-12 animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-900">Processing your file...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-6">
            <div className="card bg-blue-50 border-blue-200">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{results.total}</p>
                  <p className="text-sm text-gray-600">Total Records</p>
                </div>
              </div>
            </div>

            <div className="card bg-green-50 border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{results.success}</p>
                  <p className="text-sm text-gray-600">Successfully Sent</p>
                </div>
              </div>
            </div>

            <div className="card bg-red-50 border-red-200">
              <div className="flex items-center gap-3">
                <XCircle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{results.failed}</p>
                  <p className="text-sm text-gray-600">Failed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Results</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Session ID / Error
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {results.details.map((row: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{row.email}</td>
                      <td className="py-3 px-4">
                        {row.status === 'success' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3" />
                            Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="h-3 w-3" />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {row.sessionId || row.error}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                setUploadedFile(null);
                setResults(null);
              }}
              className="btn btn-primary"
            >
              Upload Another File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
