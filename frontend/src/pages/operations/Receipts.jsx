import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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

// TypeScript types (for reference/documentation)
// type ReceiptLine = {
//   id: string;
//   productName: string;
//   skuCode: string;
//   quantity: number;
//   unitCost: number;
//   totalValue: number;
// };
//
// type ReceiptRow = {
//   documentNumber: string;
//   supplierName: string;
//   contactPerson: string;
//   phone: string;
//   email: string;
//   sourceAddress: string;
//   destinationLocation: string;
//   productName: string;
//   skuCode: string;
//   quantity: number;
//   scheduledDate: string;
//   completedDate: string | null;
//   status: "DRAFT" | "VALIDATED" | "CANCELLED";
//   priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
//   unitCost: number;
//   totalValue: number;
//   paymentTerms: string;
//   createdBy: string;
//   createdAt: string;
//   notes: string;
//   isOverdue: boolean;
//   lines?: ReceiptLine[];
// };
//
// type ReceiptsPageProps = {
//   onNavigate?: (route: string) => void;
//   rows?: ReceiptRow[];
//   onReceiptValidate?: (row: ReceiptRow) => void;
// };

// Helper function to check if overdue
const checkIsOverdue = (scheduledDate, status) => {
  if (status === 'VALIDATED' || status === 'CANCELLED') return false;
  return isBefore(parseISO(scheduledDate), startOfDay(new Date()));
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const config = {
    DRAFT: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    VALIDATED: { label: 'Received', color: 'bg-green-100 text-green-800' },
    CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  };

  const { label, color } = config[status];
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
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[priority]}`}>
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
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by document #, supplier, product, SKU..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
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
            <option value="DRAFT">Pending</option>
            <option value="VALIDATED">Received</option>
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

// Receipt Detail Modal Component
const ReceiptDetailModal = ({ receipt, onClose, onValidate, onCancel }) => {
  const [lines, setLines] = useState(receipt.lines || [
    {
      id: '1',
      productName: receipt.productName,
      skuCode: receipt.skuCode,
      quantity: receipt.quantity,
      unitCost: receipt.unitCost,
      totalValue: receipt.totalValue,
    }
  ]);

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newLine, setNewLine] = useState({
    productName: '',
    skuCode: '',
    quantity: 0,
    unitCost: 0,
  });

  const totalReceiptValue = lines.reduce((sum, line) => sum + line.totalValue, 0);

  const handleAddLine = () => {
    if (newLine.productName && newLine.skuCode && newLine.quantity > 0) {
      const line = {
        id: Date.now().toString(),
        ...newLine,
        totalValue: newLine.quantity * newLine.unitCost,
      };
      setLines([...lines, line]);
      setNewLine({ productName: '', skuCode: '', quantity: 0, unitCost: 0 });
      setShowAddProduct(false);
    }
  };

  const handleRemoveLine = (id) => {
    setLines(lines.filter(line => line.id !== id));
  };

  const handleValidate = () => {
    onValidate({ ...receipt, lines, totalValue: totalReceiptValue });
  };

  const handlePrint = () => {
    console.log('Print Receipt:', receipt.documentNumber);
    console.log('Lines:', lines);
  };

  // Status flow steps
  const steps = ['Draft', 'Ready', 'Done'];
  const currentStep = receipt.status === 'DRAFT' ? 0 : receipt.status === 'VALIDATED' ? 2 : 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{receipt.documentNumber}</h2>
            <p className="text-sm text-gray-600">Receipt Details</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Status Flow */}
          <div className="mb-6">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {steps.map((step, index) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      {index < currentStep ? <Check size={20} /> : index + 1}
                    </div>
                    <span className={`text-sm mt-2 ${index <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                      {step}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 flex-1 mx-2 ${index < currentStep ? 'bg-blue-600' : 'bg-gray-300'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Status & Priority Badges */}
          <div className="flex items-center gap-3 mb-6 justify-center">
            <StatusBadge status={receipt.status} />
            <PriorityBadge priority={receipt.priority} />
            {receipt.isOverdue && (
              <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                <AlertTriangle size={14} />
                Overdue
              </span>
            )}
          </div>

          {/* Supplier Information */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Building size={18} className="text-blue-600" />
              Supplier Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-gray-600 flex items-center gap-1">
                  <User size={14} />
                  Supplier Name
                </label>
                <p className="font-medium">{receipt.supplierName}</p>
              </div>
              <div>
                <label className="text-gray-600">Contact Person</label>
                <p className="font-medium">{receipt.contactPerson}</p>
              </div>
              <div>
                <label className="text-gray-600 flex items-center gap-1">
                  <Phone size={14} />
                  Phone
                </label>
                <p className="font-medium">{receipt.phone}</p>
              </div>
              <div>
                <label className="text-gray-600 flex items-center gap-1">
                  <Mail size={14} />
                  Email
                </label>
                <p className="font-medium">{receipt.email}</p>
              </div>
              <div className="col-span-2">
                <label className="text-gray-600 flex items-center gap-1">
                  <MapPin size={14} />
                  Source Address
                </label>
                <p className="font-medium">{receipt.sourceAddress}</p>
              </div>
            </div>
          </div>

          {/* Destination Information */}
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin size={18} className="text-green-600" />
              Destination
            </h3>
            <p className="font-medium">{receipt.destinationLocation}</p>
          </div>

          {/* Products Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Products</h3>
              {receipt.status === 'DRAFT' && (
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  Add Product
                </button>
              )}
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">SKU</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Quantity</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Unit Cost</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Total</th>
                    {receipt.status === 'DRAFT' && (
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Action</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {lines.map(line => (
                    <tr key={line.id}>
                      <td className="px-4 py-3 text-sm font-medium">{line.productName}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">{line.skuCode}</td>
                      <td className="px-4 py-3 text-sm text-right">{line.quantity}</td>
                      <td className="px-4 py-3 text-sm text-right">₹{line.unitCost.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">₹{line.totalValue.toLocaleString()}</td>
                      {receipt.status === 'DRAFT' && (
                        <td className="px-4 py-3 text-center">
                          {lines.length > 1 && (
                            <button
                              onClick={() => handleRemoveLine(line.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={receipt.status === 'DRAFT' ? 4 : 4} className="px-4 py-3 text-sm font-semibold text-right">
                      Total Receipt Value:
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-right text-green-600">
                      ₹{totalReceiptValue.toLocaleString()}
                    </td>
                    {receipt.status === 'DRAFT' && <td></td>}
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Add Product Form */}
            {showAddProduct && (
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Add New Product</h4>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={newLine.productName}
                    onChange={(e) => setNewLine({ ...newLine, productName: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="SKU Code"
                    value={newLine.skuCode}
                    onChange={(e) => setNewLine({ ...newLine, skuCode: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={newLine.quantity || ''}
                    onChange={(e) => setNewLine({ ...newLine, quantity: parseInt(e.target.value) || 0 })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Unit Cost"
                    value={newLine.unitCost || ''}
                    onChange={(e) => setNewLine({ ...newLine, unitCost: parseFloat(e.target.value) || 0 })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleAddLine}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddProduct(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <label className="text-gray-600">Scheduled Date</label>
              <p className="font-medium">{format(parseISO(receipt.scheduledDate), 'MMM dd, yyyy')}</p>
            </div>
            {receipt.completedDate && (
              <div>
                <label className="text-gray-600">Completed Date</label>
                <p className="font-medium">{format(parseISO(receipt.completedDate), 'MMM dd, yyyy')}</p>
              </div>
            )}
            <div>
              <label className="text-gray-600">Payment Terms</label>
              <p className="font-medium">{receipt.paymentTerms}</p>
            </div>
            <div>
              <label className="text-gray-600">Created By</label>
              <p className="font-medium">{receipt.createdBy}</p>
            </div>
          </div>

          {/* Notes */}
          {receipt.notes && (
            <div className="mb-6">
              <label className="text-gray-600 text-sm mb-2 block">Notes</label>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-gray-700">{receipt.notes}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {receipt.status === 'DRAFT' && (
              <>
                <button
                  onClick={handleValidate}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  <Check size={20} />
                  Validate & Receive
                </button>
                <button
                  onClick={() => onCancel(receipt)}
                  className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  <X size={20} />
                  Cancel
                </button>
              </>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              <Printer size={20} />
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// List View Component
const ReceiptsList = ({ rows, onRowClick }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Document #</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Supplier</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Destination</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Product</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Quantity</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Scheduled Date</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Priority</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Total Value</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Alert</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.length > 0 ? (
              rows.map((row, index) => (
                <tr
                  key={index}
                  onClick={() => onRowClick(row)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-mono font-medium text-gray-900">{row.documentNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{row.supplierName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{row.destinationLocation}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{row.productName}</p>
                      <p className="text-xs text-gray-500 font-mono">{row.skuCode}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{row.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {format(parseISO(row.scheduledDate), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <PriorityBadge priority={row.priority} />
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-green-600">
                    ₹{row.totalValue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.isOverdue && (
                      <AlertTriangle size={18} className="text-red-600 mx-auto" />
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="px-4 py-12 text-center text-gray-500">
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
const Receipts = ({ onNavigate, rows, onReceiptValidate }) => {
  const navigate = useNavigate();

  // Mock data
  const mockRows = rows || [
    {
      documentNumber: 'PO-2025-001',
      supplierName: 'TechVendor Inc.',
      contactPerson: 'John Smith',
      phone: '+1-555-0123',
      email: 'john.smith@techvendor.com',
      sourceAddress: '123 Tech Street, Silicon Valley, CA 94025',
      destinationLocation: 'Warehouse A - Rack A-01',
      productName: 'Dell Laptop XPS 15',
      skuCode: 'LAPTOP-001',
      quantity: 10,
      scheduledDate: '2025-11-25T00:00:00Z',
      completedDate: null,
      status: 'DRAFT',
      priority: 'HIGH',
      unitCost: 75000,
      totalValue: 750000,
      paymentTerms: 'Net 30',
      createdBy: 'Sarah Johnson',
      createdAt: '2025-11-20T10:00:00Z',
      notes: 'Bulk order for Q4 inventory replenishment. Please verify serial numbers upon receipt.',
      isOverdue: false,
    },
    {
      documentNumber: 'PO-2025-002',
      supplierName: 'Office Supplies Co.',
      contactPerson: 'Mary Wilson',
      phone: '+1-555-0456',
      email: 'mary.w@officesupplies.com',
      sourceAddress: '456 Business Ave, New York, NY 10001',
      destinationLocation: 'Warehouse A - Rack C-03',
      productName: 'Office Chair Executive',
      skuCode: 'CHAIR-078',
      quantity: 25,
      scheduledDate: '2025-11-20T00:00:00Z',
      completedDate: null,
      status: 'DRAFT',
      priority: 'URGENT',
      unitCost: 8000,
      totalValue: 200000,
      paymentTerms: 'Net 15',
      createdBy: 'Mike Brown',
      createdAt: '2025-11-15T14:30:00Z',
      notes: 'URGENT: Required for new office setup. Contact supplier for expedited shipping.',
      isOverdue: true,
    },
    {
      documentNumber: 'PO-2025-003',
      supplierName: 'Electronics Hub',
      contactPerson: 'David Lee',
      phone: '+1-555-0789',
      email: 'david.lee@electronichub.com',
      sourceAddress: '789 Digital Plaza, Austin, TX 78701',
      destinationLocation: 'Warehouse B - Rack B-12',
      productName: 'Samsung Monitor 27" 4K',
      skuCode: 'MON-102',
      quantity: 15,
      scheduledDate: '2025-11-18T00:00:00Z',
      completedDate: '2025-11-18T15:30:00Z',
      status: 'VALIDATED',
      priority: 'NORMAL',
      unitCost: 35000,
      totalValue: 525000,
      paymentTerms: 'Net 45',
      createdBy: 'Lisa Davis',
      createdAt: '2025-11-10T09:00:00Z',
      notes: 'Received in perfect condition. All units tested and working.',
      isOverdue: false,
    },
    {
      documentNumber: 'PO-2025-004',
      supplierName: 'Print Solutions Ltd.',
      contactPerson: 'Tom Harris',
      phone: '+1-555-0321',
      email: 'tom.h@printsolutions.com',
      sourceAddress: '321 Print Lane, Boston, MA 02101',
      destinationLocation: 'Warehouse A - Rack B-09',
      productName: 'HP Printer LaserJet Pro',
      skuCode: 'PRINT-045',
      quantity: 5,
      scheduledDate: '2025-11-15T00:00:00Z',
      completedDate: null,
      status: 'CANCELLED',
      priority: 'LOW',
      unitCost: 25000,
      totalValue: 125000,
      paymentTerms: 'Net 30',
      createdBy: 'Tom Brown',
      createdAt: '2025-11-12T11:00:00Z',
      notes: 'Order cancelled due to supplier stock unavailability. Reordering from alternate supplier.',
      isOverdue: false,
    },
  ].map(row => ({ ...row, isOverdue: checkIsOverdue(row.scheduledDate, row.status) }));

  const [receiptsData, setReceiptsData] = useState(mockRows);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Navigation handler
  const handleNavigate = (route) => {
    if (onNavigate) {
      onNavigate(route);
    } else {
      navigate(route);
    }
  };

  // Filter data
  const filteredData = useMemo(() => {
    return receiptsData.filter(row => {
      const matchesSearch = 
        row.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.skuCode.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesDate = true;
      if (dateFrom && dateTo) {
        const rowDate = parseISO(row.scheduledDate);
        matchesDate = rowDate >= parseISO(dateFrom) && rowDate <= parseISO(dateTo);
      } else if (dateFrom) {
        matchesDate = parseISO(row.scheduledDate) >= parseISO(dateFrom);
      } else if (dateTo) {
        matchesDate = parseISO(row.scheduledDate) <= parseISO(dateTo);
      }

      const matchesStatus = statusFilter === 'ALL' || row.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || row.priority === priorityFilter;

      return matchesSearch && matchesDate && matchesStatus && matchesPriority;
    });
  }, [receiptsData, searchQuery, dateFrom, dateTo, statusFilter, priorityFilter]);

  // Handle validate receipt
  const handleValidate = (receipt) => {
    const updated = {
      ...receipt,
      status: 'VALIDATED',
      completedDate: new Date().toISOString(),
      isOverdue: false,
    };

    setReceiptsData(receiptsData.map(r => 
      r.documentNumber === receipt.documentNumber ? updated : r
    ));

    setSelectedReceipt(null);
    onReceiptValidate?.(updated);
    console.log('Receipt validated:', updated);
  };

  // Handle cancel receipt
  const handleCancel = (receipt) => {
    const updated = {
      ...receipt,
      status: 'CANCELLED',
      isOverdue: false,
    };

    setReceiptsData(receiptsData.map(r => 
      r.documentNumber === receipt.documentNumber ? updated : r
    ));

    setSelectedReceipt(null);
    console.log('Receipt cancelled:', updated);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Receipts</h1>
          <p className="text-gray-600 mt-1">Manage incoming stock from suppliers</p>
        </div>

        {/* Filters */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
        />

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Total Receipts</p>
            <p className="text-2xl font-bold text-gray-900">{filteredData.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Total Value</p>
            <p className="text-2xl font-bold text-green-600">
              ₹{filteredData.reduce((sum, row) => sum + row.totalValue, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {filteredData.filter(r => r.status === 'DRAFT').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Overdue</p>
            <p className="text-2xl font-bold text-red-600">
              {filteredData.filter(r => r.isOverdue).length}
            </p>
          </div>
        </div>

        {/* Receipts List */}
        <ReceiptsList rows={filteredData} onRowClick={setSelectedReceipt} />
      </div>

      {/* Detail Modal */}
      {selectedReceipt && (
        <ReceiptDetailModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          onValidate={handleValidate}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default Receipts;
