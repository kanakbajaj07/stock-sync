import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { 
  LayoutDashboard, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  ArrowLeftRight,
  BarChart3,
  History,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { filterNavigationByRole, getRoleDisplayName } from '../../utils/roleConfig';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isMobile } = useDeviceDetection();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Icon mapping
  const iconMap = {
    LayoutDashboard,
    Package,
    TrendingUp,
    TrendingDown,
    ArrowLeftRight,
    BarChart3,
    History,
    Users,
    FileText,
    Settings,
  };

  // Full navigation configuration
  const allNavigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: 'LayoutDashboard',
      roles: ['ADMIN', 'MANAGER', 'STAFF']
    },
    { 
      name: 'Products', 
      href: '/products', 
      icon: 'Package',
      roles: ['ADMIN', 'MANAGER']
    },
    { 
      name: 'Stock', 
      href: '/stock', 
      icon: 'BarChart3',
      roles: ['ADMIN', 'MANAGER', 'STAFF']
    },
    { 
      name: 'Operations', 
      icon: 'ArrowLeftRight',
      roles: ['ADMIN', 'MANAGER', 'STAFF'],
      children: [
        { 
          name: 'Receipts', 
          href: '/operations/receipts', 
          icon: 'TrendingUp',
          roles: ['ADMIN', 'MANAGER', 'STAFF']
        },
        { 
          name: 'Deliveries', 
          href: '/operations/deliveries', 
          icon: 'TrendingDown',
          roles: ['ADMIN', 'MANAGER', 'STAFF']
        },
        { 
          name: 'Transfers', 
          href: '/operations/transfers', 
          icon: 'ArrowLeftRight',
          roles: ['ADMIN', 'MANAGER', 'STAFF']
        },
      ]
    },
    { 
      name: 'Move History', 
      href: '/inventory/ledger', 
      icon: 'History',
      roles: ['ADMIN', 'MANAGER']
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: 'Settings',
      roles: ['ADMIN', 'MANAGER']
    }
  ];

  // Filter navigation based on user role
  const navigation = useMemo(() => {
    if (!user?.role) return [];
    return filterNavigationByRole(allNavigation, user.role);
  }, [user?.role]);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-30 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <h1 className="text-xl font-bold text-primary-600">StockMaster</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = iconMap[item.icon];
              
              return (
                <div key={item.name}>
                  {item.children ? (
                    <div className="mb-2">
                      <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-700">
                        {Icon && <Icon size={18} className="mr-3" />}
                        {item.name}
                      </div>
                      <div className="ml-6 space-y-1">
                        {item.children.map((child) => {
                          const ChildIcon = iconMap[child.icon];
                          return (
                            <Link
                              key={child.name}
                              to={child.href}
                              className={`
                                flex items-center px-3 py-2 text-sm rounded-lg transition-colors
                                ${isActive(child.href)
                                  ? 'bg-primary-50 text-primary-600 font-medium'
                                  : 'text-gray-600 hover:bg-gray-100'
                                }
                              `}
                              onClick={() => setSidebarOpen(false)}
                            >
                              {ChildIcon && <ChildIcon size={16} className="mr-2" />}
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className={`
                        flex items-center px-3 py-2 text-sm rounded-lg transition-colors
                        ${isActive(item.href)
                          ? 'bg-primary-50 text-primary-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                        }
                      `}
                      onClick={() => setSidebarOpen(false)}
                    >
                      {Icon && <Icon size={18} className="mr-3" />}
                      {item.name}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold text-sm">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {getRoleDisplayName(user?.role)}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              {navigation.find(n => isActive(n.href))?.name || 
               navigation.flatMap(n => n.children || []).find(c => isActive(c.href))?.name || 
               'StockMaster IMS'}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
