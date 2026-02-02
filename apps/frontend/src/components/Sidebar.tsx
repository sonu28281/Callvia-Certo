import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  UserCheck,
  Phone,
  FileText,
  Users,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  Building2,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Wallet', href: '/wallet', icon: Wallet },
  { name: 'KYC Verification', href: '/kyc', icon: UserCheck },
  { name: 'Voice Verification', href: '/voice', icon: Phone },
  { name: 'Audit Logs', href: '/audit-logs', icon: FileText },
  { name: 'Tenants', href: '/tenants', icon: Users },
  { name: 'Company Profile', href: '/profile', icon: Building2 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ open, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, userProfile } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          bg-white border-r border-gray-200
          transform transition-all duration-300 ease-in-out
          ${collapsed ? 'w-20' : 'w-64'}
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Shield className={`h-8 w-8 text-primary-600 transition-transform duration-300 hover:rotate-12 ${collapsed ? 'mx-auto' : ''}`} />
              {!collapsed && (
                <span className="text-lg font-semibold text-gray-900 animate-fade-in">
                  Callvia Certo
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Collapse Toggle (Desktop only) */}
          <div className="hidden lg:flex justify-center py-2 border-b border-gray-200">
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-110"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => onClose()}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg
                    transition-all duration-300 group relative
                    ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:scale-105'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                  title={collapsed ? item.name : ''}
                >
                  <item.icon
                    className={`w-5 h-5 ${collapsed ? '' : 'mr-3'} transition-transform duration-300 ${
                      isActive ? 'text-primary-600 animate-pulse' : 'text-gray-400 group-hover:scale-110'
                    }`}
                  />
                  {!collapsed && <span className="animate-fade-in">{item.name}</span>}
                  {item.badge && !collapsed && (
                    <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {item.badge}
                    </span>
                  )}
                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                  whitespace-nowrap pointer-events-none z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            {!collapsed && userProfile && (
              <div className="px-3 py-2 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userProfile.displayName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userProfile.email}
                </p>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg
                text-red-700 hover:bg-red-50 transition-all duration-300
                ${collapsed ? 'justify-center' : ''}
              `}
              title={collapsed ? 'Logout' : ''}
            >
              <LogOut className={`w-5 h-5 ${collapsed ? '' : 'mr-3'}`} />
              {!collapsed && <span>Logout</span>}
            </button>

            <div className="text-xs text-gray-500 text-center">
              Version 1.0.0 • Phase 4
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
