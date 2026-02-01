import { Menu, Bell, User, ChevronDown, Wallet } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // TODO: Get from API
  const mockWalletBalance = 1250.50;
  const mockUser = {
    name: 'John Doe',
    role: 'Tenant Admin',
    tenant: 'Acme Corp',
  };

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
            Welcome back, {mockUser.name}
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
                ${mockWalletBalance.toFixed(2)}
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
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900">
                  {mockUser.name}
                </div>
                <div className="text-xs text-gray-500">{mockUser.role}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <div className="text-sm font-medium text-gray-900">
                    {mockUser.tenant}
                  </div>
                  <div className="text-xs text-gray-500">{mockUser.role}</div>
                </div>
                <a
                  href="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Settings
                </a>
                <a
                  href="/wallet"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Wallet
                </a>
                <button
                  onClick={() => {/* TODO: Implement logout */}}
                  className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
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
