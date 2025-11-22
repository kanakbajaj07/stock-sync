import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboardService';
import { inventoryService } from '../../services/inventoryService';
import { operationService } from '../../services/operationService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
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
import { format, parseISO } from 'date-fns';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';

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
              ? `₹${(value || 0).toLocaleString()}`
              : (value || 0).toLocaleString()}
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {lowStockItems?.length > 0 ? (
              lowStockItems.map((item, index) => (
                <tr
                  key={index}
                  className={`
                    hover:bg-gray-50 transition-colors
                    ${item.onHand === 0 ? 'bg-red-50' : ''}
                  `}
                >
                  <td className="px-6 py-4 font-medium text-gray-900">{item.product?.name}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm font-mono">{item.product?.skuCode}</td>
                  <td className="px-6 py-4 text-gray-700">
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm">{item.product?.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`
                      inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                      ${item.onHandQuantity === 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}
                    `}>
                      {item.onHandQuantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{item.product?.reorderLevel}</td>
                  <td className="px-6 py-4 text-gray-600">{item.location?.name}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
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
    : activities?.filter(activity => activity.documentType === selectedFilter);

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
        {filteredActivities?.length > 0 ? (
          filteredActivities.map((activity, index) => (
            <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium text-gray-900">
                    {activity.documentNumber || 'N/A'}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${typeColors[activity.documentType]}`}>
                    {activity.documentType.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {format(new Date(activity.createdAt), 'MMM dd, HH:mm')}
                </span>
              </div>
              
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">{activity.product?.name}</span>
                <span className="text-gray-500"> × {activity.quantity}</span>
              </p>
              
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[activity.status]}`}>
                  {activity.status}
                </span>
                <span className="text-xs text-gray-500">
                  {activity.user?.firstName} {activity.user?.lastName}
                </span>
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
const Dashboard = () => {
  const navigate = useNavigate();
  const [activityFilter, setActivityFilter] = useState('ALL');

  // Fetch KPIs
  const { data: kpisData, isLoading: loadingKpis } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: dashboardService.getKPIs,
  });

  // Fetch Low Stock Items
  const { data: lowStockData, isLoading: loadingLowStock } = useQuery({
    queryKey: ['dashboard-low-stock'],
    queryFn: inventoryService.getLowStock,
  });

  // Fetch Recent Activity
  const { data: activityData, isLoading: loadingActivity } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: () => operationService.getOperations({ limit: 10, sort: 'createdAt:desc' }),
  });

  if (loadingKpis || loadingLowStock || loadingActivity) {
    return <LoadingSpinner fullScreen />;
  }

  const kpis = kpisData?.data || {
    totalProducts: 0,
    totalStockValue: 0,
    lowStockCount: 0,
    pendingReceipts: 0,
    pendingDeliveries: 0,
    reservedValue: 0,
    availableValue: 0,
    charts: { stockValueByCategory: [], movements: [] }
  };

  const lowStockItems = lowStockData?.data || [];
  const recentActivity = activityData?.data || [];

  const kpiCardsData = [
    { label: 'Total Products', value: kpis.totalProducts, icon: Package, color: 'blue' },
    { label: 'Total Stock Value', value: kpis.totalStockValue, icon: DollarSign, color: 'green' },
    { label: 'Low Stock Items', value: kpis.lowStockCount, icon: AlertTriangle, color: 'red' },
    { label: 'Pending Receipts', value: kpis.pendingReceipts, icon: TrendingUp, color: 'purple' },
    { label: 'Pending Deliveries', value: kpis.pendingDeliveries, icon: TrendingDown, color: 'orange' },
    { label: 'Reserved Stock Value', value: kpis.reservedValue, icon: Archive, color: 'indigo' },
    { label: 'Available Stock Value', value: kpis.availableValue, icon: ShoppingCart, color: 'yellow' },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

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
          {kpiCardsData.map((kpi, index) => (
            <KpiCard
              key={index}
              label={kpi.label}
              value={kpi.value}
              icon={kpi.icon}
              color={kpi.color}
            />
          ))}
        </div>

        {/* Charts Section */}
        {kpis.charts && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Pie Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Stock Value by Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={kpis.charts.stockValueByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {kpis.charts.stockValueByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Stock Trends (Last 7 Days)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={kpis.charts.movements}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => format(parseISO(date), 'MMM dd')} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="receipts" name="Incoming" fill="#10B981" />
                    <Bar dataKey="deliveries" name="Outgoing" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Main Content: Low Stock Alerts + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Low Stock Alerts - 2 columns on large screens */}
          <div className="lg:col-span-2">
            <LowStockAlertsTable lowStockItems={lowStockItems} />
          </div>

          {/* Recent Activity Feed - 1 column on large screens */}
          <div className="lg:col-span-1">
            <RecentActivityFeed
              activities={recentActivity}
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
