import { Palette, Globe, Bell, Lock } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account and white-label settings
        </p>
      </div>

      {/* White-Label Settings */}
      <div className="card">
        <div className="flex items-center mb-6">
          <Palette className="w-5 h-5 text-primary-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">
            White-Label Branding
          </h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand Name
            </label>
            <input
              type="text"
              defaultValue="Acme Corp Verification"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Brand Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                defaultValue="#3b82f6"
                className="w-12 h-12 rounded-lg border border-gray-300"
              />
              <input
                type="text"
                defaultValue="#3b82f6"
                className="input flex-1"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo URL
            </label>
            <input
              type="url"
              placeholder="https://example.com/logo.png"
              className="input"
            />
          </div>
          <button className="btn btn-primary">
            Save Branding Settings
          </button>
        </div>
      </div>

      {/* Domain Settings */}
      <div className="card">
        <div className="flex items-center mb-6">
          <Globe className="w-5 h-5 text-primary-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">
            Domain Settings
          </h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Domain
            </label>
            <input
              type="text"
              defaultValue="verify.acmecorp.com"
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">
              Configure your DNS settings to point to our servers
            </p>
          </div>
          <button className="btn btn-primary">
            Update Domain
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card">
        <div className="flex items-center mb-6">
          <Bell className="w-5 h-5 text-primary-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">
            Notifications
          </h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Email Notifications
              </p>
              <p className="text-xs text-gray-500">
                Receive updates via email
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 text-primary-600 border-gray-300 rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Low Balance Alerts
              </p>
              <p className="text-xs text-gray-500">
                Alert when wallet balance is low
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 text-primary-600 border-gray-300 rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Verification Completed
              </p>
              <p className="text-xs text-gray-500">
                Notify when verifications are completed
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 text-primary-600 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="card">
        <div className="flex items-center mb-6">
          <Lock className="w-5 h-5 text-primary-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">
            Security
          </h2>
        </div>
        <div className="space-y-4">
          <button className="btn btn-secondary">
            Change Password
          </button>
          <button className="btn btn-secondary">
            Configure 2FA
          </button>
          <button className="btn btn-danger">
            Revoke API Keys
          </button>
        </div>
      </div>
    </div>
  );
}
