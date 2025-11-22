import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../../services/inventoryService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Package, 
  BarChart3, 
  Settings, 
  Search,
  Edit2,
  X,
  Save,
  Filter,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

// Helper function to compute stock status
const computeStockStatus = (onHand, reorderLevel) => {
  if (onHand === 0) return 'Out of Stock';
  if (onHand > 0 && onHand <= reorderLevel) return 'Low Stock';
  return 'In Stock';
};

// Search and Filter Bar Component
const SearchFilterBar = ({ 
  searchQuery, 
  onSearchChange, 
  categoryFilter, 
  onCategoryChange, 
  statusFilter, 
  onStatusChange,
  categories 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="ALL">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Edit Stock Modal Component
const EditStockModal = ({ row, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    onHandQuantity: row.onHandQuantity,
    reservedQuantity: row.reservedQuantity,
    // reorderLevel is on Product, location is fixed for this record
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Available quantity will be calculated on backend or derived
    const updatedRow = {
      ...row,
      ...formData,
    };
    
    onSave(updatedRow);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Edit Stock - {row.productName}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Product Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">SKU:</span>
              <span className="ml-2 font-mono font-medium">{row.skuCode}</span>
            </div>
            <div>
              <span className="text-gray-600">Category:</span>
              <span className="ml-2 font-medium">{row.category}</span>
            </div>
            <div>
              <span className="text-gray-600">Brand:</span>
              <span className="ml-2 font-medium">{row.brand}</span>
            </div>
            <div>
              <span className="text-gray-600">Location:</span>
              <span className="ml-2 font-medium">{row.location}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                On Hand Quantity *
              </label>
              <input
                type="number"
                value={formData.onHandQuantity}
                onChange={(e) => setFormData({ ...formData, onHandQuantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reserved Quantity *
              </label>
              <input
                type="number"
                value={formData.reservedQuantity}
                onChange={(e) => setFormData({ ...formData, reservedQuantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max={formData.onHandQuantity}
                required
              />
            </div>
          </div>

          {/* Computed Values Preview */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Preview After Update:</h4>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Available:</span>
                <span className="ml-2 font-medium">{formData.onHandQuantity - formData.reservedQuantity} {row.uom}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Value:</span>
                <span className="ml-2 font-medium">₹{(formData.onHandQuantity * row.unitCost).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                  computeStockStatus(formData.onHandQuantity, row.reorderLevel) === 'Out of Stock' ? 'bg-red-100 text-red-800' :
                  computeStockStatus(formData.onHandQuantity, row.reorderLevel) === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {computeStockStatus(formData.onHandQuantity, row.reorderLevel)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Save Changes
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

// Stock Status Badge Component
const StockStatusBadge = ({ status }) => {
  const colors = {
    'In Stock': 'bg-green-100 text-green-800',
    'Low Stock': 'bg-yellow-100 text-yellow-800',
    'Out of Stock': 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
      {status}
    </span>
  );
};

// Mobile Card View Component
const StockMobileCard = ({ row, onEdit }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{row.productName}</h3>
          <p className="text-sm text-gray-600 font-mono">{row.skuCode}</p>
        </div>
        <StockStatusBadge status={row.stockStatus} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <span className="text-gray-600">On Hand:</span>
          <span className="ml-2 font-medium">{row.onHandQuantity} {row.uom}</span>
        </div>
        <div>
          <span className="text-gray-600">Available:</span>
          <span className="ml-2 font-medium">{row.availableQuantity} {row.uom}</span>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-2"
      >
        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        {expanded ? 'Less details' : 'More details'}
      </button>

      {expanded && (
        <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm mb-3">
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-gray-600">Category:</span> {row.category}</div>
            <div><span className="text-gray-600">Brand:</span> {row.brand}</div>
            <div><span className="text-gray-600">Reserved:</span> {row.reservedQuantity} {row.uom}</div>
            <div><span className="text-gray-600">Location:</span> {row.location}</div>
            <div><span className="text-gray-600">Unit Cost:</span> ₹{row.unitCost.toLocaleString()}</div>
            <div><span className="text-gray-600">Total Value:</span> ₹{row.totalValue.toLocaleString()}</div>
          </div>
        </div>
      )}

      <button
        onClick={() => onEdit(row)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Edit2 size={16} />
        Edit Stock
      </button>
    </div>
  );
};

// Desktop Table Component
const StockTable = ({ rows, onEdit }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Product Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">SKU</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Brand</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">On Hand</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Reserved</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Available</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Unit Cost</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Total Value</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Location</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.length > 0 ? (
              rows.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.productName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-mono">{row.skuCode}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{row.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{row.brand}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{row.onHandQuantity} {row.uom}</td>
                  <td className="px-4 py-3 text-sm text-right text-orange-600">{row.reservedQuantity} {row.uom}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-green-600">{row.availableQuantity} {row.uom}</td>
                  <td className="px-4 py-3 text-sm text-right">₹{row.unitCost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">₹{row.totalValue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{row.location}</td>
                  <td className="px-4 py-3 text-center">
                    <StockStatusBadge status={row.stockStatus} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onEdit(row)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="12" className="px-4 py-12 text-center text-gray-500">
                  No stock data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main Stock Page Component
const Stock = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editingRow, setEditingRow] = useState(null);

  // Fetch Stock Levels
  const { data: stockResponse, isLoading } = useQuery({
    queryKey: ['stock-levels'],
    queryFn: () => inventoryService.getStockLevels(),
  });

  // Transform API data to display format
  const stockData = useMemo(() => {
    if (!stockResponse?.data) return [];
    
    return stockResponse.data.map(item => ({
      id: item.id,
      productId: item.productId,
      locationId: item.locationId,
      productName: item.product.name,
      skuCode: item.product.skuCode,
      barcode: item.product.barcode || '-',
      category: item.product.category,
      brand: item.product.brand || '-',
      unitCost: item.product.unitCost || 0,
      sellingPrice: item.product.sellingPrice || 0,
      onHandQuantity: item.onHandQuantity,
      reservedQuantity: item.reservedQuantity,
      availableQuantity: item.availableQuantity,
      totalValue: (item.onHandQuantity * (item.product.unitCost || 0)),
      uom: item.product.uom,
      reorderLevel: item.product.reorderLevel || 0,
      location: item.location.name,
      lastCountDate: item.lastCountDate,
      isActive: item.product.isActive,
      stockStatus: computeStockStatus(item.onHandQuantity, item.product.reorderLevel || 0),
    }));
  }, [stockResponse]);

  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(stockData.map(row => row.category))];
  }, [stockData]);

  // Filter stock data
  const filteredData = useMemo(() => {
    return stockData.filter(row => {
      const matchesSearch = 
        row.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.skuCode.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'ALL' || row.category === categoryFilter;
      const matchesStatus = statusFilter === 'ALL' || row.stockStatus === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [stockData, searchQuery, categoryFilter, statusFilter]);

  // Mock update mutation (since we don't have direct edit API yet, mostly handled via operations)
  // However, for "Adjustments", we might need an endpoint. 
  // For now, I'll just show a toast as "Stock updated" implies an Adjustment operation usually.
  const handleUpdateStock = (updatedRow) => {
    // In a real app, this would call an adjustment API
    // updateStockMutation.mutate(updatedRow);
    
    toast.success('Stock update feature coming soon (Use Adjustments in Operations)');
    setEditingRow(null);
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-gray-600 mt-1">Complete inventory overview with detailed stock levels</p>
        </div>

        {/* Search and Filters */}
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          categories={categories}
        />

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Total Items</p>
            <p className="text-2xl font-bold text-gray-900">{filteredData.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Total Value</p>
            <p className="text-2xl font-bold text-green-600">
              ₹{filteredData.reduce((sum, row) => sum + row.totalValue, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Low Stock</p>
            <p className="text-2xl font-bold text-yellow-600">
              {filteredData.filter(row => row.stockStatus === 'Low Stock').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Out of Stock</p>
            <p className="text-2xl font-bold text-red-600">
              {filteredData.filter(row => row.stockStatus === 'Out of Stock').length}
            </p>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <StockTable rows={filteredData} onEdit={setEditingRow} />
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          {filteredData.length > 0 ? (
            filteredData.map((row, index) => (
              <StockMobileCard key={index} row={row} onEdit={setEditingRow} />
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
              No stock data found
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingRow && (
        <EditStockModal
          row={editingRow}
          onSave={handleUpdateStock}
          onClose={() => setEditingRow(null)}
        />
      )}
    </div>
  );
};

export default Stock;
