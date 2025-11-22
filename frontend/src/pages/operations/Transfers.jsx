import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { operationService } from '../../services/operationService';
import { productService } from '../../services/productService';
import { locationService } from '../../services/locationService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  ArrowLeftRight, 
  Search, 
  Filter, 
  Plus, 
  X, 
  Check, 
  MapPin
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

// Status Badge Component
const StatusBadge = ({ status }) => {
  const config = {
    DRAFT: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    VALIDATED: { label: 'Completed', color: 'bg-green-100 text-green-800' },
    CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  };

  const { label, color } = config[status] || config['DRAFT'];
  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>;
};

// Create Transfer Modal
const CreateTransferModal = ({ onClose, onCreate, products, locations }) => {
  const [formData, setFormData] = useState({
    productId: '',
    sourceLocationId: '',
    destinationLocationId: '',
    quantity: '',
    notes: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.productId || !formData.sourceLocationId || !formData.destinationLocationId || !formData.quantity) {
      toast.error('Please fill in required fields');
      return;
    }
    if (formData.sourceLocationId === formData.destinationLocationId) {
      toast.error('Source and Destination locations must be different');
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
          <h3 className="text-xl font-semibold text-gray-900">Create Stock Transfer</h3>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Location *</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.sourceLocationId}
                onChange={(e) => setFormData({...formData, sourceLocationId: e.target.value})}
                required
              >
                <option value="">Select Source</option>
                {locations.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Location *</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.destinationLocationId}
                onChange={(e) => setFormData({...formData, destinationLocationId: e.target.value})}
                required
              >
                <option value="">Select Dest</option>
                {locations.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

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
              Create Transfer
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
const TransfersList = ({ rows, onValidate, onCancel }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Reference</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Product</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">From</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">To</th>
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
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{row.productName}</p>
                      <p className="text-xs text-gray-500 font-mono">{row.skuCode}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} className="text-red-400" />
                      {row.sourceLocation}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} className="text-green-400" />
                      {row.destinationLocation}
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
                          title="Validate Transfer"
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
                  No transfers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main Transfers Page Component
const Transfers = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch Data
  const { data: transfersResponse, isLoading: loadingTransfers } = useQuery({
    queryKey: ['transfers'],
    queryFn: () => operationService.getOperations({ type: 'INTERNAL_TRANSFER' }),
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
    mutationFn: operationService.createTransfer,
    onSuccess: () => {
      toast.success('Transfer created successfully');
      queryClient.invalidateQueries(['transfers']);
      setShowCreateModal(false);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to create transfer'),
  });

  const validateMutation = useMutation({
    mutationFn: operationService.validateOperation,
    onSuccess: () => {
      toast.success('Transfer validated successfully');
      queryClient.invalidateQueries(['transfers']);
      queryClient.invalidateQueries(['stock-levels']);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Validation failed'),
  });

  const cancelMutation = useMutation({
    mutationFn: operationService.cancelOperation,
    onSuccess: () => {
      toast.success('Transfer cancelled');
      queryClient.invalidateQueries(['transfers']);
    },
    onError: (error) => toast.error('Failed to cancel transfer'),
  });

  // Transform data
  const transfersData = useMemo(() => {
    if (!transfersResponse?.data) return [];
    return transfersResponse.data.map(item => ({
      id: item.id,
      documentNumber: item.documentNumber,
      productName: item.product.name,
      skuCode: item.product.skuCode,
      sourceLocation: item.sourceLocation?.name || '-',
      destinationLocation: item.destinationLocation?.name || '-',
      quantity: item.quantity,
      status: item.status,
      createdAt: item.createdAt,
    }));
  }, [transfersResponse]);

  const products = productsResponse?.data || [];
  const locations = locationsResponse?.data || [];

  // Filter logic
  const filteredData = transfersData.filter(row => 
    row.documentNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.productName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loadingTransfers) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transfers</h1>
            <p className="text-gray-600 mt-1">Manage internal stock movements</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
          >
            <Plus size={20} />
            Create Transfer
          </button>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search transfers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <TransfersList 
          rows={filteredData} 
          onValidate={(id) => validateMutation.mutate(id)}
          onCancel={(id) => cancelMutation.mutate(id)}
        />
      </div>

      {showCreateModal && (
        <CreateTransferModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(data) => createMutation.mutate(data)}
          products={products}
          locations={locations}
        />
      )}
    </div>
  );
};

export default Transfers;
