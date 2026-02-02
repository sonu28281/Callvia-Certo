import { useState } from 'react';
import { X, Upload, Download, AlertCircle } from 'lucide-react';

interface BulkUploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkUploadModal({ onClose, onSuccess }: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleDownloadTemplate = () => {
    const csvContent = `customer_id,name,aadhaar,pan,bank_account,bank_ifsc
CUST001,John Doe,999999999999,ABCDE1234F,1234567890123,HDFC0000001
CUST002,Jane Smith,888888888888,XYZAB5678C,9876543210987,ICIC0000001
CUST003,Bob Johnson,777777777777,MNOPQ9012D,5555555555555,AXIS0000001`;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    element.setAttribute('download', 'kyc_template.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate processing
      setUploading(false);
      setProcessing(true);

      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Success
      setProcessing(false);
      setProgress(100);

      // Show success and auto-close after 2 seconds
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
      setUploading(false);
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Bulk Upload KYC</h2>
          <button
            onClick={onClose}
            disabled={uploading || processing}
            className="text-gray-500 hover:text-gray-700 transition-colors disabled:text-gray-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!processing ? (
            <div className="space-y-6">
              {/* Step 1: Download Template */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">1</span>
                  Download Template
                </h3>
                <p className="text-sm text-blue-800 mb-3">
                  Start with our CSV template to ensure proper formatting.
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
              </div>

              {/* Step 2: Upload File */}
              <div className="space-y-3">
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                    disabled={uploading || processing}
                  />
                  <label htmlFor="file-input" className="cursor-pointer block">
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-700 font-semibold">
                      {file ? `✅ ${file.name}` : 'Drag and drop CSV or click to select'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Maximum 10,000 rows per file</p>
                  </label>
                </div>

                {file && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-700">
                      <strong>File selected:</strong> {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </p>
                  </div>
                )}
              </div>

              {/* Step 3: Validation Info */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  CSV Format Required
                </h3>
                <ul className="text-sm text-amber-800 space-y-1 ml-6 list-disc">
                  <li>Headers: customer_id, name, aadhaar, pan, bank_account, bank_ifsc</li>
                  <li>Aadhaar: 12 digits</li>
                  <li>PAN: 10 characters (5 letters, 4 numbers, 1 letter)</li>
                  <li>Bank account: numbers only</li>
                  <li>IFSC: 11 characters</li>
                </ul>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Upload Button */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  disabled={uploading}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 disabled:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                    !file || uploading
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {uploading ? 'Uploading...' : 'Upload & Process'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-blue-500 border-r-gray-300 border-b-gray-300 border-l-gray-300 animate-spin"></div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Your File</h3>
              <p className="text-gray-600 mb-6">{progress}% Complete</p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <p className="text-sm text-gray-500">
                {progress < 50 ? 'Validating file format...' :
                 progress < 100 ? 'Processing verifications...' :
                 'Finalizing results...'}
              </p>

              {progress === 100 && (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-700 font-semibold">✅ Processing complete!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
