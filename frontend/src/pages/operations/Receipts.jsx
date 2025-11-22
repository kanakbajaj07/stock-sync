import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { operationService } from '../../services/operationService';
import { productService } from '../../services/productService';
import { locationService } from '../../services/locationService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Package, 
  BarChart3, 
  Settings, 
  Search,
  Filter,
  Calendar,
  X,
  Check,
  Printer,
  AlertTriangle,
  Plus,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  Building
} from 'lucide-react';
import { format, parseISO, isBefore, startOfDay } from 'date-fns';

// Helper function to check if overdue
const checkIsOverdue = (scheduledDate, status) => {
  if (!scheduledDate || status === 'VALIDATED' || status === 'CANCELLED') return false;
  return isBefore(parseISO(scheduledDate), startOfDay(new Date()));
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const config = {
    DRAFT: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    VALIDATED: { label: 'Received', color: 'bg-green-100 text-green-800' },
    CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  };

  const { label, color } = config[status] || config['DRAFT'];
  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>;
};

// Priority Badge Component
const PriorityBadge = ({ priority }) => {
  const colors = {
    LOW: 'bg-gray-100 text-gray-600',
    NORMAL: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-orange-100 text-orange-700',
    URGENT: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[priority] || colors['NORMAL']}`}>
      {priority}
    </span>
  );
};

// Create Receipt Modal
const CreateReceiptModal = ({ onClose, onCreate, products, locations }) => {
  const [formData, setFormData] = useState({
    productId: '',
    locationId: '',
    quantity: '',
    documentNumber: '',
    supplierName: '', // Stored in notes/contact for now
    notes: '',
    scheduledDate: '',
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
          <h3 className="text-xl font-semibold text-gray-900">Create New Receipt</h3>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination Location *</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.locationId}
              onChange={(e) => setFormData({...formData, locationId: e.target.value})}
              required
            >
              <option value="">Select Location</option>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">PO Number</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.documentNumber}
                onChange={(e) => setFormData({...formData, documentNumber: e.target.value})}
                placeholder="PO-..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.supplierName}
              onChange={(e) => setFormData({...formData, supplierName: e.target.value})}
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
              Create Receipt
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

// List View Component
const ReceiptsList = ({ rows, onValidate, onCancel }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Document #</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Supplier/Contact</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Destination</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Product</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Quantity</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.length > 0 ? (
              rows.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono font-medium text-gray-900">{row.documentNumber || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{row.contactName || row.supplierName || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{row.destinationLocation}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{row.productName}</p>
                      <p className="text-xs text-gray-500 font-mono">{row.skuCode}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{row.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {format(parseISO(row.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.status === 'DRAFT' && (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); onValidate(row.id); }}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Validate"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onCancel(row.id); }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Cancel"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-4 py-12 text-center text-gray-500">
                  No receipts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main Receipts Page Component
const Receipts = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch Data
  const { data: receiptsResponse, isLoading: loadingReceipts } = useQuery({
    queryKey: ['receipts'],
    queryFn: () => operationService.getOperations({ type: 'RECEIPT' }),
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
    mutationFn: operationService.createReceipt,
    onSuccess: () => {
      toast.success('Receipt created successfully');
      queryClient.invalidateQueries(['receipts']);
      setShowCreateModal(false);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to create receipt'),
  });

  const validateMutation = useMutation({
    mutationFn: operationService.validateOperation,
    onSuccess: () => {
      toast.success('Receipt validated successfully');
      queryClient.invalidateQueries(['receipts']);
      queryClient.invalidateQueries(['stock-levels']); // Update stock
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Validation failed'),
  });

  const cancelMutation = useMutation({
    mutationFn: operationService.cancelOperation,
    onSuccess: () => {
      toast.success('Receipt cancelled');
      queryClient.invalidateQueries(['receipts']);
    },
    onError: (error) => toast.error('Failed to cancel receipt'),
  });

  // Transform data
  const receiptsData = useMemo(() => {
    if (!receiptsResponse?.data) return [];
    return receiptsResponse.data.map(item => ({
      id: item.id,
      documentNumber: item.documentNumber,
      productName: item.product.name,
      skuCode: item.product.skuCode,
      destinationLocation: item.destinationLocation?.name || '-',
      quantity: item.quantity,
      status: item.status,
      createdAt: item.createdAt,
      contactName: item.contactName,
      supplierName: item.contactName, // Fallback
    }));
  }, [receiptsResponse]);

  const products = productsResponse?.data || [];
  const locations = locationsResponse?.data || [];

  // Filter logic
  const filteredData = receiptsData.filter(row => 
    row.documentNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.productName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loadingReceipts) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Receipts</h1>
            <p className="text-gray-600 mt-1">Manage incoming stock</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
          >
            <Plus size={20} />
            Create Receipt
          </button>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search receipts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <ReceiptsList 
          rows={filteredData} 
          onValidate={(id) => validateMutation.mutate(id)}
          onCancel={(id) => cancelMutation.mutate(id)}
        />
      </div>

      {showCreateModal && (
        <CreateReceiptModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(data) => createMutation.mutate(data)}
          products={products}
          locations={locations}
        />
      )}
    </div>
  );
};

export default Receipts;
