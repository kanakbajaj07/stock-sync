import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  ArrowLeftRight,
  BarChart3,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const MainLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { 
      name: 'Operations', 
      icon: ArrowLeftRight,
      children: [
        { name: 'Receipts', href: '/operations/receipts', icon: TrendingUp },
        { name: 'Deliveries', href: '/operations/deliveries', icon: TrendingDown },
        { name: 'Transfers', href: '/operations/transfers', icon: ArrowLeftRight },
      ]
    },
    { 
      name: 'Inventory', 
      icon: BarChart3,
      children: [
        { name: 'Stock Levels', href: '/stock' },
        { name: 'Move History', href: '/inventory/ledger' },
      ]
    },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

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
            {navigation.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <div className="mb-2">
                    <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-700">
                      <item.icon size={18} className="mr-3" />
                      {item.name}
                    </div>
                    <div className="ml-6 space-y-1">
                      {item.children.map((child) => (
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
                          {child.icon && <child.icon size={16} className="mr-2" />}
                          {child.name}
                        </Link>
                      ))}
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
                    <item.icon size={18} className="mr-3" />
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Mobile menu button */}
        <div className="lg:hidden fixed top-4 left-4 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Page content */}
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

