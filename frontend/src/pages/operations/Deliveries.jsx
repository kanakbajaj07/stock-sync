import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { operationService } from '../../services/operationService';
import { productService } from '../../services/productService';
import { locationService } from '../../services/locationService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  Package, 
  Search, 
  Calendar, 
  Filter,
  X,
  Truck,
  User,
  MapPin,
  Phone,
  Mail,
  FileText,
  Check, // Changed from CheckCircle
  Clock,
  AlertCircle,
  Printer,
  Plus,
  Trash2
} from 'lucide-react';
import { format, parseISO, isBefore, isWithinInterval, startOfDay } from 'date-fns';

// Status Badge
function StatusBadge({ status }) {
  const config = {
    DRAFT: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    VALIDATED: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
    CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  };

  const { label, color } = config[status] || config.DRAFT;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

// Priority Badge
function PriorityBadge({ priority }) {
  const config = {
    LOW: { color: 'bg-gray-100 text-gray-800' },
    NORMAL: { color: 'bg-blue-100 text-blue-800' },
    HIGH: { color: 'bg-orange-100 text-orange-800' },
    URGENT: { color: 'bg-red-100 text-red-800' }
  };

  const { color } = config[priority] || config.NORMAL;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {priority}
    </span>
  );
}

// Create Delivery Modal
const CreateDeliveryModal = ({ onClose, onCreate, products, locations }) => {
  const [formData, setFormData] = useState({
    productId: '',
    locationId: '',
    quantity: '',
    documentNumber: '',
    customerName: '',
    notes: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.productId || !formData.locationId || !formData.quantity) {
      toast.error('Please fill in required fields');
      return;
    }
    onCreate({
      ...formData,
      quantity: parseFloat(formData.quantity),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Create New Delivery</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.productId}
              onChange={(e) => setFormData({...formData, productId: e.target.value})}
              required
            >
              <option value="">Select Product</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.skuCode})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source Location *</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.locationId}
              onChange={(e) => setFormData({...formData, locationId: e.target.value})}
              required
            >
              <option value="">Select Source Location</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DO Number</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.documentNumber}
                onChange={(e) => setFormData({...formData, documentNumber: e.target.value})}
                placeholder="DO-..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.customerName}
              onChange={(e) => setFormData({...formData, customerName: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Create Delivery
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Deliveries List Table
function DeliveriesList({ deliveries, onValidate, onCancel }) {
  if (deliveries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>No deliveries found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Document Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Source Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantity
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {deliveries.map((delivery) => (
            <tr
              key={delivery.id}
              className="hover:bg-gray-50"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                {delivery.documentNumber || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {delivery.customerName || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {delivery.sourceLocation}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div>{delivery.productName}</div>
                <div className="text-xs text-gray-500">{delivery.skuCode}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {delivery.quantity}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {format(parseISO(delivery.createdAt), 'MMM dd, yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={delivery.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {delivery.status === 'DRAFT' && (
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onValidate(delivery.id)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                      title="Validate"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => onCancel(delivery.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Cancel"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Main Deliveries Page Component
export default function Deliveries() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch Data
  const { data: deliveriesResponse, isLoading: loadingDeliveries } = useQuery({
    queryKey: ['deliveries'],
    queryFn: () => operationService.getOperations({ type: 'DELIVERY' }),
  });

  const { data: productsResponse } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getProducts,
  });

  const { data: locationsResponse } = useQuery({
    queryKey: ['locations'],
    queryFn: locationService.getLocations,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: operationService.createDelivery,
    onSuccess: () => {
      toast.success('Delivery created successfully');
      queryClient.invalidateQueries(['deliveries']);
      setShowCreateModal(false);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to create delivery'),
  });

  const validateMutation = useMutation({
    mutationFn: operationService.validateOperation,
    onSuccess: () => {
      toast.success('Delivery validated successfully');
      queryClient.invalidateQueries(['deliveries']);
      queryClient.invalidateQueries(['stock-levels']);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Validation failed'),
  });

  const cancelMutation = useMutation({
    mutationFn: operationService.cancelOperation,
    onSuccess: () => {
      toast.success('Delivery cancelled');
      queryClient.invalidateQueries(['deliveries']);
    },
    onError: (error) => toast.error('Failed to cancel delivery'),
  });

  // Transform data
  const deliveriesData = useMemo(() => {
    if (!deliveriesResponse?.data) return [];
    return deliveriesResponse.data.map(item => ({
      id: item.id,
      documentNumber: item.documentNumber,
      productName: item.product.name,
      skuCode: item.product.skuCode,
      sourceLocation: item.sourceLocation?.name || '-',
      quantity: item.quantity,
      status: item.status,
      createdAt: item.createdAt,
      customerName: item.contactName,
      priority: item.priority || 'NORMAL',
    }));
  }, [deliveriesResponse]);

  const products = productsResponse?.data || [];
  const locations = locationsResponse?.data || [];

  // Filter logic
  const filteredData = deliveriesData.filter(row => 
    row.documentNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.productName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loadingDeliveries) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Page Header */}
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Deliveries</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage outgoing deliveries
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
            >
              <Plus size={20} />
              Create Delivery
            </button>
          </div>

          {/* Search */}
          <div className="mb-6 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search deliveries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Deliveries List */}
          <div className="bg-white rounded-lg shadow">
            <DeliveriesList 
              deliveries={filteredData}
              onValidate={(id) => validateMutation.mutate(id)}
              onCancel={(id) => cancelMutation.mutate(id)}
            />
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateDeliveryModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(data) => createMutation.mutate(data)}
          products={products}
          locations={locations}
        />
      )}
    </div>
  );
}
