import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboardService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  Package, 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Box
} from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: dashboardService.getKPIs,
  });

  if (isLoading) {
    return <LoadingSpinner className="h-64" />;
  }

  const kpis = data?.data || {};

  const stats = [
    {
      name: 'Total Products',
      value: kpis.totalProducts || 0,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Locations',
      value: kpis.totalLocations || 0,
      icon: MapPin,
      color: 'bg-green-500',
    },
    {
      name: 'Pending Receipts',
      value: kpis.pendingReceipts || 0,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      name: 'Pending Deliveries',
      value: kpis.pendingDeliveries || 0,
      icon: TrendingDown,
      color: 'bg-orange-500',
    },
    {
      name: 'Low Stock Alerts',
      value: kpis.lowStockCount || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
    {
      name: 'Total Stock Items',
      value: kpis.totalStockItems || 0,
      icon: Box,
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your inventory management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Moves */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Stock Movements</h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Location</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {kpis.recentMoves && kpis.recentMoves.length > 0 ? (
                kpis.recentMoves.map((move) => (
                  <tr key={move.id}>
                    <td className="font-medium">{move.product?.name}</td>
                    <td>
                      <span className={`badge ${
                        move.documentType === 'RECEIPT' ? 'badge-success' :
                        move.documentType === 'DELIVERY' ? 'badge-danger' :
                        'badge-info'
                      }`}>
                        {move.documentType.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{move.quantity} {move.product?.uom}</td>
                    <td className="text-gray-600">
                      {move.sourceLocation?.name || move.destinationLocation?.name}
                    </td>
                    <td>
                      <span className={`badge ${
                        move.status === 'VALIDATED' ? 'badge-success' :
                        move.status === 'DRAFT' ? 'badge-warning' :
                        'badge-gray'
                      }`}>
                        {move.status}
                      </span>
                    </td>
                    <td className="text-gray-600">
                      {format(new Date(move.createdAt), 'MMM dd, yyyy')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-gray-500 py-8">
                    No recent movements
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

