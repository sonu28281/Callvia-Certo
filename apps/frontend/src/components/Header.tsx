import { Menu, Bell, User, ChevronDown, Wallet } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  
  // TODO: Get wallet balance from API
  const mockWalletBalance = 1250.50;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const displayName = userProfile?.displayName || user?.email?.split('@')[0] || 'User';
  const roleDisplay = userProfile?.role === 'PLATFORM_ADMIN' 
    ? 'Super Admin' 
    : userProfile?.role === 'TENANT_ADMIN'
    ? 'Tenant Admin'
    : 'User';

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6">
      <div className="flex items-center justify-between w-full">
        {/* Left side */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">
            Welcome back, {displayName}
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Wallet Balance */}
          <div className="hidden md:flex items-center px-4 py-2 bg-accent-50 rounded-lg">
            <Wallet className="w-5 h-5 text-accent-600 mr-2" />
            <div className="text-right">
              <div className="text-xs text-gray-600">Wallet Balance</div>
              <div className="text-sm font-semibold text-accent-700">
                ₹{mockWalletBalance.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                userProfile?.role === 'PLATFORM_ADMIN' 
                  ? 'bg-purple-100' 
                  : 'bg-primary-100'
              }`}>
                <User className={`w-5 h-5 ${
                  userProfile?.role === 'PLATFORM_ADMIN' 
                    ? 'text-purple-600' 
                    : 'text-primary-600'
                }`} />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900">
                  {displayName}
                </div>
                <div className="text-xs text-gray-500">{roleDisplay}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="text-sm font-medium text-gray-900">
                    {displayName}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {userProfile?.email || user?.email}
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      userProfile?.role === 'PLATFORM_ADMIN' 
                        ? 'bg-purple-100 text-purple-800'
                        : userProfile?.role === 'TENANT_ADMIN'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {roleDisplay}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigate('/profile');
                    setShowUserMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Company Profile
                </button>
                <button
                  onClick={() => {
                    navigate('/settings');
                    setShowUserMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Settings
                </button>
                <button
                  onClick={() => {
                    navigate('/wallet');
                    setShowUserMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Wallet
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 border-t border-gray-200"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
