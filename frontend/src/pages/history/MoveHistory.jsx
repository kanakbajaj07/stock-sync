import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '../../services/inventoryService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Package, 
  BarChart3, 
  Settings, 
  Search,
  Filter,
  List,
  LayoutGrid,
  X,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { format, parseISO, isWithinInterval } from 'date-fns';

// Document Type Badge
const DocumentTypeBadge = ({ type }) => {
  const colors = {
    RECEIPT: 'bg-green-100 text-green-800',
    DELIVERY: 'bg-blue-100 text-blue-800',
    INTERNAL_TRANSFER: 'bg-purple-100 text-purple-800',
    ADJUSTMENT: 'bg-orange-100 text-orange-800',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[type]}`}>
      {type?.replace('_', ' ')}
    </span>
  );
};

// Status Badge
const StatusBadge = ({ status }) => {
  const colors = {
    DRAFT: 'bg-gray-100 text-gray-800',
    VALIDATED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status]}`}>
      {status}
    </span>
  );
};

// Priority Badge
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

// Filter Bar Component
const FilterBar = ({ 
  searchQuery, 
  onSearchChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by document #, product, or SKU..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Types</option>
            <option value="RECEIPT">Receipt</option>
            <option value="DELIVERY">Delivery</option>
            <option value="INTERNAL_TRANSFER">Internal Transfer</option>
            <option value="ADJUSTMENT">Adjustment</option>
          </select>
        </div>

        {/* Date From */}
        <div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="From Date"
            />
          </div>
        </div>

        {/* Date To */}
        <div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="To Date"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="VALIDATED">Validated</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Detail Modal Component
const DetailModal = ({ row, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Movement Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Header Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-semibold text-gray-900">{row.documentNumber}</h4>
            <div className="flex gap-2">
              <DocumentTypeBadge type={row.documentType} />
              <StatusBadge status={row.status} />
              <PriorityBadge priority={row.priority} />
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Created on {format(parseISO(row.createdAt), 'MMM dd, yyyy HH:mm')}
          </p>
        </div>

        {/* Product Info */}
        <div className="mb-6">
          <h5 className="text-sm font-semibold text-gray-700 mb-3">Product Information</h5>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600">Product Name</label>
              <p className="font-medium">{row.productName}</p>
            </div>
            <div>
              <label className="text-xs text-gray-600">SKU Code</label>
              <p className="font-mono font-medium">{row.skuCode}</p>
            </div>
            <div>
              <label className="text-xs text-gray-600">Quantity</label>
              <p className="font-medium">{row.quantity}</p>
            </div>
            <div>
              <label className="text-xs text-gray-600">Unit Cost</label>
              <p className="font-medium">₹{(row.unitCost || 0).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-xs text-gray-600">Total Value</label>
              <p className="font-semibold text-green-600">₹{(row.totalValue || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Location & Contact Info */}
        <div className="mb-6">
          <h5 className="text-sm font-semibold text-gray-700 mb-3">Location & Contact</h5>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600">From Location</label>
              <p className="font-medium">{row.sourceLocation || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-600">To Location</label>
              <p className="font-medium">{row.destinationLocation || 'N/A'}</p>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-600">Contact</label>
              <p className="font-medium">{row.contactName || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Audit Info */}
        <div className="mb-6">
          <h5 className="text-sm font-semibold text-gray-700 mb-3">Audit Information</h5>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600">Created By</label>
              <p className="font-medium">{row.createdBy}</p>
            </div>
            {row.validatedBy && (
              <div>
                <label className="text-xs text-gray-600">Validated By</label>
                <p className="font-medium">{row.validatedBy}</p>
              </div>
            )}
            {row.validatedAt && (
              <div className="col-span-2">
                <label className="text-xs text-gray-600">Validated At</label>
                <p className="font-medium">{format(parseISO(row.validatedAt), 'MMM dd, yyyy HH:mm')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {row.notes && (
          <div>
            <h5 className="text-sm font-semibold text-gray-700 mb-2">Notes</h5>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-gray-700">{row.notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// List View Component
const ListView = ({ rows, onRowClick }) => {
  const getRowColor = (type) => {
    if (type === 'RECEIPT') return 'border-l-4 border-green-500 bg-green-50';
    if (type === 'DELIVERY') return 'border-l-4 border-red-500 bg-red-50';
    return 'border-l-4 border-purple-500 bg-purple-50';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Document #</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Product</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">From</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">To</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Contact</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Quantity</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Total Value</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.length > 0 ? (
              rows.map((row, index) => (
                <tr
                  key={index}
                  onClick={() => onRowClick(row)}
                  className={`cursor-pointer hover:bg-gray-100 transition-colors ${getRowColor(row.documentType)}`}
                >
                  <td className="px-4 py-3 text-sm font-mono font-medium text-gray-900">{row.documentNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {format(parseISO(row.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    <DocumentTypeBadge type={row.documentType} />
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{row.productName}</p>
                      <p className="text-xs text-gray-500 font-mono">{row.skuCode}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{row.sourceLocation || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{row.destinationLocation || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{row.contactName || '-'}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{row.quantity}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">₹{(row.totalValue || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <PriorityBadge priority={row.priority} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="px-4 py-12 text-center text-gray-500">
                  No movement history found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Kanban View Component
const KanbanView = ({ rows, onRowClick }) => {
  const groupedByStatus = {
    DRAFT: rows.filter(r => r.status === 'DRAFT'),
    VALIDATED: rows.filter(r => r.status === 'VALIDATED'),
    CANCELLED: rows.filter(r => r.status === 'CANCELLED'),
  };

  const KanbanCard = ({ row }) => (
    <div
      onClick={() => onRowClick(row)}
      className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-mono font-semibold text-gray-900">{row.documentNumber}</span>
        <DocumentTypeBadge type={row.documentType} />
      </div>
      <p className="text-sm font-medium text-gray-900 mb-1">{row.productName}</p>
      <p className="text-xs text-gray-500 font-mono mb-2">{row.skuCode}</p>
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>Qty: {row.quantity}</span>
        <span>₹{(row.totalValue || 0).toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-500">{format(parseISO(row.createdAt), 'MMM dd')}</span>
        <PriorityBadge priority={row.priority} />
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Draft Column */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Draft</h3>
          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm font-medium">
            {groupedByStatus.DRAFT.length}
          </span>
        </div>
        <div className="space-y-3">
          {groupedByStatus.DRAFT.map((row, index) => (
            <KanbanCard key={index} row={row} />
          ))}
          {groupedByStatus.DRAFT.length === 0 && (
            <p className="text-center text-gray-400 py-8">No drafts</p>
          )}
        </div>
      </div>

      {/* Validated Column */}
      <div className="bg-green-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Validated</h3>
          <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-sm font-medium">
            {groupedByStatus.VALIDATED.length}
          </span>
        </div>
        <div className="space-y-3">
          {groupedByStatus.VALIDATED.map((row, index) => (
            <KanbanCard key={index} row={row} />
          ))}
          {groupedByStatus.VALIDATED.length === 0 && (
            <p className="text-center text-gray-400 py-8">No validated</p>
          )}
        </div>
      </div>

      {/* Cancelled Column */}
      <div className="bg-red-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Cancelled</h3>
          <span className="bg-red-200 text-red-800 px-2 py-1 rounded text-sm font-medium">
            {groupedByStatus.CANCELLED.length}
          </span>
        </div>
        <div className="space-y-3">
          {groupedByStatus.CANCELLED.map((row, index) => (
            <KanbanCard key={index} row={row} />
          ))}
          {groupedByStatus.CANCELLED.length === 0 && (
            <p className="text-center text-gray-400 py-8">No cancelled</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Move History Page Component
const MoveHistory = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [selectedRow, setSelectedRow] = useState(null);

  // Fetch Data
  const { data: historyResponse, isLoading } = useQuery({
    queryKey: ['move-history'],
    queryFn: () => inventoryService.getStockLedger(),
  });

  // Transform Data
  const moveData = useMemo(() => {
    if (!historyResponse?.data) return [];
    return historyResponse.data.map(item => ({
      id: item.id,
      documentNumber: item.documentNumber || '-',
      createdAt: item.createdAt,
      documentType: item.documentType,
      productName: item.product.name,
      skuCode: item.product.skuCode,
      sourceLocation: item.sourceLocation?.name || '-',
      destinationLocation: item.destinationLocation?.name || '-',
      contactName: item.contactName || '-',
      quantity: item.quantity,
      unitCost: item.product.unitCost || 0,
      totalValue: (item.quantity * (item.product.unitCost || 0)),
      status: item.status,
      priority: item.priority || 'NORMAL',
      createdBy: `${item.user?.firstName} ${item.user?.lastName}`,
      validatedBy: item.validatedBy || null,
      validatedAt: item.validatedAt || null,
      notes: item.notes || '',
    }));
  }, [historyResponse]);

  // Filter data
  const filteredData = useMemo(() => {
    return moveData.filter(row => {
      // Search filter
      const matchesSearch = 
        row.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.skuCode.toLowerCase().includes(searchQuery.toLowerCase());

      // Date filter
      let matchesDate = true;
      if (dateFrom && dateTo) {
        const rowDate = parseISO(row.createdAt);
        matchesDate = isWithinInterval(rowDate, {
          start: parseISO(dateFrom),
          end: parseISO(dateTo),
        });
      } else if (dateFrom) {
        matchesDate = parseISO(row.createdAt) >= parseISO(dateFrom);
      } else if (dateTo) {
        matchesDate = parseISO(row.createdAt) <= parseISO(dateTo);
      }

      // Type filter
      const matchesType = typeFilter === 'ALL' || row.documentType === typeFilter;

      // Status filter
      const matchesStatus = statusFilter === 'ALL' || row.status === statusFilter;

      // Priority filter
      const matchesPriority = priorityFilter === 'ALL' || row.priority === priorityFilter;

      return matchesSearch && matchesDate && matchesType && matchesStatus && matchesPriority;
    });
  }, [moveData, searchQuery, dateFrom, dateTo, typeFilter, statusFilter, priorityFilter]);

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Move History</h1>
            <p className="text-gray-600 mt-1">Complete history of all stock movements</p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-white rounded-lg shadow-md overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 flex items-center gap-2 transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List size={18} />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-4 py-2 flex items-center gap-2 transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <LayoutGrid size={18} />
              <span className="hidden sm:inline">Kanban</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
        />

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Total Movements</p>
            <p className="text-2xl font-bold text-gray-900">{filteredData.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Total Value</p>
            <p className="text-2xl font-bold text-green-600">
              ₹{filteredData.reduce((sum, row) => sum + row.totalValue, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Validated</p>
            <p className="text-2xl font-bold text-green-600">
              {filteredData.filter(r => r.status === 'VALIDATED').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {filteredData.filter(r => r.status === 'DRAFT').length}
            </p>
          </div>
        </div>

        {/* View Content */}
        {viewMode === 'list' ? (
          <ListView rows={filteredData} onRowClick={setSelectedRow} />
        ) : (
          <KanbanView rows={filteredData} onRowClick={setSelectedRow} />
        )}
      </div>

      {/* Detail Modal */}
      {selectedRow && (
        <DetailModal row={selectedRow} onClose={() => setSelectedRow(null)} />
      )}
    </div>
  );
};

export default MoveHistory;
