import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Settings, 
  BarChart3, 
  Package, 
  LayoutDashboard,
  DollarSign,
  AlertTriangle,
  ShoppingCart,
  Archive
} from 'lucide-react';

// TypeScript interfaces (for reference/documentation)
// type DashboardKpis = {
//   totalProducts: number;
//   totalStockValue: number;
//   lowStockCount: number;
//   pendingReceipts: number;
//   pendingDeliveries: number;
//   reservedValue: number;
//   availableValue: number;
// };
//
// type LowStockRow = {
//   productName: string;
//   skuCode: string;
//   category: string;
//   onHand: number;
//   reorderLevel: number;
//   location: string;
// };
//
// type ActivityItem = {
//   reference: string;
//   date: string;
//   type: "RECEIPT" | "DELIVERY" | "INTERNAL_TRANSFER" | "ADJUSTMENT";
//   product: string;
//   quantity: number;
//   status: string;
//   createdBy: string;
// };
//
// type DashboardPageProps = {
//   onNavigate?: (route: string) => void;
//   kpis?: DashboardKpis;
//   lowStockItems?: LowStockRow[];
//   recentActivity?: ActivityItem[];
// };

// KPI Summary Card Component
const KpiCard = ({ label, value, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
    yellow: 'bg-yellow-500',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">
            {typeof value === 'number' && label.toLowerCase().includes('value')
              ? `₹${value.toLocaleString()}`
              : value.toLocaleString()}
          </p>
        </div>
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
};

// Low Stock Alerts Table Component
const LowStockAlertsTable = ({ lowStockItems }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-red-50 border-b border-red-200">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-red-600" size={20} />
          <h2 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">SKU</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">On Hand</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Reorder Level</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {lowStockItems.length > 0 ? (
              lowStockItems.map((item, index) => (
                <tr
                  key={index}
                  className={`
                    hover:bg-gray-50 transition-colors
                    ${item.onHand === 0 ? 'bg-red-50' : ''}
                  `}
                >
                  <td className="px-6 py-4 font-medium text-gray-900">{item.productName}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm font-mono">{item.skuCode}</td>
                  <td className="px-6 py-4 text-gray-700">
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm">{item.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`
                      inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                      ${item.onHand === 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}
                    `}>
                      {item.onHand}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{item.reorderLevel}</td>
                  <td className="px-6 py-4 text-gray-600">{item.location}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => console.log('Reorder:', item.productName)}
                      className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                    >
                      Reorder
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  No low stock alerts
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Recent Activity Feed Component
const RecentActivityFeed = ({ activities, selectedFilter, onFilterChange }) => {
  const typeColors = {
    RECEIPT: 'bg-green-100 text-green-800',
    DELIVERY: 'bg-blue-100 text-blue-800',
    INTERNAL_TRANSFER: 'bg-purple-100 text-purple-800',
    ADJUSTMENT: 'bg-orange-100 text-orange-800',
  };

  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-800',
    VALIDATED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  const filteredActivities = selectedFilter === 'ALL'
    ? activities
    : activities.filter(activity => activity.type === selectedFilter);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <select
            value={selectedFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All</option>
            <option value="RECEIPT">Receipts</option>
            <option value="DELIVERY">Deliveries</option>
            <option value="INTERNAL_TRANSFER">Transfers</option>
            <option value="ADJUSTMENT">Adjustments</option>
          </select>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity, index) => (
            <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium text-gray-900">
                    {activity.reference}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${typeColors[activity.type]}`}>
                    {activity.type.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{activity.date}</span>
              </div>
              
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">{activity.product}</span>
                <span className="text-gray-500"> × {activity.quantity}</span>
              </p>
              
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[activity.status]}`}>
                  {activity.status}
                </span>
                <span className="text-xs text-gray-500">by {activity.createdBy}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-12 text-center text-gray-500">
            No activities found
          </div>
        )}
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = ({ onNavigate, kpis, lowStockItems, recentActivity }) => {
  const navigate = useNavigate();
  const [activityFilter, setActivityFilter] = useState('ALL');

  // Navigation handler
  const handleNavigate = (route) => {
    if (onNavigate) {
      onNavigate(route);
    } else {
      navigate(route);
    }
  };

  // Mock KPIs data
  const mockKpis = kpis || {
    totalProducts: 125,
    totalStockValue: 1250000,
    lowStockCount: 8,
    pendingReceipts: 12,
    pendingDeliveries: 7,
    reservedValue: 350000,
    availableValue: 900000,
  };

  // Mock Low Stock Items
  const mockLowStockItems = lowStockItems || [
    {
      productName: 'Office Chair Premium',
      skuCode: 'SKU-001',
      category: 'Furniture',
      onHand: 0,
      reorderLevel: 10,
      location: 'WH-A-01',
    },
    {
      productName: 'Desk Lamp LED',
      skuCode: 'SKU-045',
      category: 'Electronics',
      onHand: 3,
      reorderLevel: 15,
      location: 'WH-A-12',
    },
    {
      productName: 'Filing Cabinet',
      skuCode: 'SKU-078',
      category: 'Furniture',
      onHand: 5,
      reorderLevel: 20,
      location: 'WH-B-03',
    },
    {
      productName: 'Keyboard Wireless',
      skuCode: 'SKU-102',
      category: 'Electronics',
      onHand: 2,
      reorderLevel: 25,
      location: 'WH-A-08',
    },
  ];

  // Mock Recent Activity
  const mockRecentActivity = recentActivity || [
    {
      reference: 'RCP-2025-001',
      date: '2025-11-22 14:30',
      type: 'RECEIPT',
      product: 'Office Desk',
      quantity: 50,
      status: 'VALIDATED',
      createdBy: 'John Doe',
    },
    {
      reference: 'DEL-2025-089',
      date: '2025-11-22 13:15',
      type: 'DELIVERY',
      product: 'Conference Table',
      quantity: 3,
      status: 'DRAFT',
      createdBy: 'Jane Smith',
    },
    {
      reference: 'TRF-2025-045',
      date: '2025-11-22 11:00',
      type: 'INTERNAL_TRANSFER',
      product: 'Storage Cabinet',
      quantity: 10,
      status: 'VALIDATED',
      createdBy: 'Mike Johnson',
    },
    {
      reference: 'ADJ-2025-012',
      date: '2025-11-22 09:45',
      type: 'ADJUSTMENT',
      product: 'Office Chair',
      quantity: 2,
      status: 'VALIDATED',
      createdBy: 'Sarah Williams',
    },
    {
      reference: 'RCP-2025-002',
      date: '2025-11-21 16:20',
      type: 'RECEIPT',
      product: 'Monitor 24inch',
      quantity: 25,
      status: 'VALIDATED',
      createdBy: 'Tom Brown',
    },
    {
      reference: 'DEL-2025-090',
      date: '2025-11-21 15:00',
      type: 'DELIVERY',
      product: 'Bookshelf',
      quantity: 8,
      status: 'CANCELLED',
      createdBy: 'Lisa Davis',
    },
  ];

  const kpiData = [
    { label: 'Total Products', value: mockKpis.totalProducts, icon: Package, color: 'blue' },
    { label: 'Total Stock Value', value: mockKpis.totalStockValue, icon: DollarSign, color: 'green' },
    { label: 'Low Stock Items', value: mockKpis.lowStockCount, icon: AlertTriangle, color: 'red' },
    { label: 'Pending Receipts', value: mockKpis.pendingReceipts, icon: TrendingUp, color: 'purple' },
    { label: 'Pending Deliveries', value: mockKpis.pendingDeliveries, icon: TrendingDown, color: 'orange' },
    { label: 'Reserved Stock Value', value: mockKpis.reservedValue, icon: Archive, color: 'indigo' },
    { label: 'Available Stock Value', value: mockKpis.availableValue, icon: ShoppingCart, color: 'yellow' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your inventory management system</p>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          {kpiData.map((kpi, index) => (
            <KpiCard
              key={index}
              label={kpi.label}
              value={kpi.value}
              icon={kpi.icon}
              color={kpi.color}
            />
          ))}
        </div>

        {/* Main Content: Low Stock Alerts + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Low Stock Alerts - 2 columns on large screens */}
          <div className="lg:col-span-2">
            <LowStockAlertsTable lowStockItems={mockLowStockItems} />
          </div>

          {/* Recent Activity Feed - 1 column on large screens */}
          <div className="lg:col-span-1">
            <RecentActivityFeed
              activities={mockRecentActivity}
              selectedFilter={activityFilter}
              onFilterChange={setActivityFilter}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

