import React, { useState, useMemo } from 'react';
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
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Printer,
  Plus,
  Trash2
} from 'lucide-react';
import { format, parseISO, isBefore, isWithinInterval } from 'date-fns';

/**
 * @typedef {Object} DeliveryRow
 * @property {string} documentNumber - "DO-2024-001"
 * @property {string} customerName - "Acme Corporation"
 * @property {string} contactPerson - "Mike Wilson"
 * @property {string} phone
 * @property {string} email
 * @property {string} sourceLocation - warehouse
 * @property {string} destinationAddress
 * @property {string} productName
 * @property {string} skuCode
 * @property {number} quantity
 * @property {string} scheduledDate
 * @property {string | null} completedDate
 * @property {"DRAFT" | "VALIDATED" | "CANCELLED"} status
 * @property {"LOW" | "NORMAL" | "HIGH" | "URGENT"} priority
 * @property {string | null} trackingNumber
 * @property {number} totalValue
 * @property {string} createdBy
 * @property {string} createdAt
 * @property {string} notes
 * @property {boolean} isOverdue
 */

/**
 * @typedef {Object} DeliveryLine
 * @property {string} id
 * @property {string} productName
 * @property {string} skuCode
 * @property {number} quantity
 * @property {number} [unitCost]
 * @property {number} [totalValue]
 * @property {boolean} inStock - Availability status
 */

// Mock data
const MOCK_DELIVERIES = [
  {
    documentNumber: 'DO-2024-001',
    customerName: 'Acme Corporation',
    contactPerson: 'Mike Wilson',
    phone: '+1-555-0101',
    email: 'mike.wilson@acme.com',
    sourceLocation: 'Main Warehouse',
    destinationAddress: '123 Business Park, New York, NY 10001',
    productName: 'Dell Laptop',
    skuCode: 'LAP-DELL-001',
    quantity: 5,
    scheduledDate: '2024-11-20',
    completedDate: null,
    status: 'DRAFT',
    priority: 'HIGH',
    trackingNumber: null,
    totalValue: 4500.00,
    createdBy: 'John Doe',
    createdAt: '2024-11-15T10:00:00Z',
    notes: 'Customer requested early morning delivery',
    isOverdue: true
  },
  {
    documentNumber: 'DO-2024-002',
    customerName: 'Tech Solutions Inc',
    contactPerson: 'Sarah Johnson',
    phone: '+1-555-0202',
    email: 'sarah.j@techsolutions.com',
    sourceLocation: 'East Warehouse',
    destinationAddress: '456 Tech Valley, San Francisco, CA 94105',
    productName: 'HP Printer',
    skuCode: 'PRT-HP-002',
    quantity: 3,
    scheduledDate: '2024-11-25',
    completedDate: '2024-11-24T14:30:00Z',
    status: 'VALIDATED',
    priority: 'NORMAL',
    trackingNumber: 'TRK-987654321',
    totalValue: 1200.00,
    createdBy: 'Jane Smith',
    createdAt: '2024-11-18T09:15:00Z',
    notes: 'Delivered successfully',
    isOverdue: false
  },
  {
    documentNumber: 'DO-2024-003',
    customerName: 'Global Enterprises',
    contactPerson: 'Robert Chen',
    phone: '+1-555-0303',
    email: 'robert.chen@global-ent.com',
    sourceLocation: 'Main Warehouse',
    destinationAddress: '789 Commerce St, Chicago, IL 60601',
    productName: 'Office Chair',
    skuCode: 'FUR-CHAIR-003',
    quantity: 10,
    scheduledDate: '2024-11-18',
    completedDate: null,
    status: 'CANCELLED',
    priority: 'LOW',
    trackingNumber: null,
    totalValue: 2500.00,
    createdBy: 'John Doe',
    createdAt: '2024-11-10T11:30:00Z',
    notes: 'Cancelled by customer',
    isOverdue: false
  },
  {
    documentNumber: 'DO-2024-004',
    customerName: 'Startup Hub',
    contactPerson: 'Emily Davis',
    phone: '+1-555-0404',
    email: 'emily@startuphub.io',
    sourceLocation: 'West Warehouse',
    destinationAddress: '321 Innovation Dr, Austin, TX 78701',
    productName: 'Samsung Monitor',
    skuCode: 'MON-SAM-004',
    quantity: 8,
    scheduledDate: '2024-11-28',
    completedDate: null,
    status: 'DRAFT',
    priority: 'URGENT',
    trackingNumber: null,
    totalValue: 3200.00,
    createdBy: 'Jane Smith',
    createdAt: '2024-11-20T13:45:00Z',
    notes: 'Rush delivery required',
    isOverdue: false
  }
];

// Mock stock data for availability checking
const MOCK_STOCK = {
  'LAP-DELL-001': 3,  // Out of stock for quantity 5
  'PRT-HP-002': 10,   // In stock
  'FUR-CHAIR-003': 15, // In stock
  'MON-SAM-004': 10   // In stock
};

// Filter Bar
function FilterBar({ filters, onFiltersChange }) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 py-4">
        {/* Search bar */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by document, customer, product, SKU..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="DRAFT">Pending</option>
                <option value="VALIDATED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => onFiltersChange({ ...filters, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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

// Deliveries List Table
function DeliveriesList({ deliveries, onRowClick }) {
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
              Scheduled Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Priority
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Value
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Alerts
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {deliveries.map((delivery) => (
            <tr
              key={delivery.documentNumber}
              onClick={() => onRowClick(delivery)}
              className="hover:bg-gray-50 cursor-pointer"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                {delivery.documentNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {delivery.customerName}
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
                {format(parseISO(delivery.scheduledDate), 'MMM dd, yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={delivery.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <PriorityBadge priority={delivery.priority} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${delivery.totalValue.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {delivery.isOverdue && delivery.status !== 'VALIDATED' && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1 w-fit">
                    <AlertCircle className="w-3 h-3" />
                    Overdue
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Delivery Detail Modal
function DeliveryDetailModal({ delivery, onClose, onValidate }) {
  const [localDelivery, setLocalDelivery] = useState(delivery);
  const [deliveryLines, setDeliveryLines] = useState([
    {
      id: '1',
      productName: delivery.productName,
      skuCode: delivery.skuCode,
      quantity: delivery.quantity,
      unitCost: delivery.totalValue / delivery.quantity,
      totalValue: delivery.totalValue,
      inStock: (MOCK_STOCK[delivery.skuCode] || 0) >= delivery.quantity
    }
  ]);

  // Calculate current status step based on delivery status
  const getStatusStep = () => {
    if (localDelivery.status === 'CANCELLED') return 0;
    if (localDelivery.status === 'DRAFT') {
      // Check if all products are in stock
      const allInStock = deliveryLines.every(line => line.inStock);
      return allInStock ? 1 : 0; // Draft or Waiting
    }
    if (localDelivery.status === 'VALIDATED') return 3; // Done
    return 1;
  };

  const statusStep = getStatusStep();

  // Status flow configuration
  const statusSteps = [
    { label: 'Draft', icon: FileText, step: 0 },
    { label: 'Waiting', icon: Clock, step: 1 },
    { label: 'Ready', icon: CheckCircle, step: 2 },
    { label: 'Done', icon: Truck, step: 3 }
  ];

  // Check if all products are available
  const allProductsAvailable = deliveryLines.every(line => line.inStock);

  const handleValidate = () => {
    if (!allProductsAvailable) {
      alert('Cannot validate: Some products are out of stock');
      return;
    }

    const updatedDelivery = {
      ...localDelivery,
      status: 'VALIDATED',
      completedDate: new Date().toISOString(),
      trackingNumber: `TRK-${Date.now()}`
    };
    setLocalDelivery(updatedDelivery);
    onValidate?.(updatedDelivery);
  };

  const handleCancel = () => {
    const updatedDelivery = {
      ...localDelivery,
      status: 'CANCELLED'
    };
    setLocalDelivery(updatedDelivery);
  };

  const handlePrint = () => {
    console.log('Print delivery:', localDelivery);
    alert('Print functionality - see console');
  };

  const handleAddProduct = () => {
    setDeliveryLines([
      ...deliveryLines,
      {
        id: Date.now().toString(),
        productName: '',
        skuCode: '',
        quantity: 1,
        unitCost: 0,
        totalValue: 0,
        inStock: false
      }
    ]);
  };

  const handleRemoveProduct = (id) => {
    setDeliveryLines(deliveryLines.filter(line => line.id !== id));
  };

  const handleLineChange = (id, field, value) => {
    setDeliveryLines(deliveryLines.map(line => {
      if (line.id === id) {
        const updated = { ...line, [field]: value };
        
        // Recalculate total if quantity or unitCost changes
        if (field === 'quantity' || field === 'unitCost') {
          updated.totalValue = (updated.quantity || 0) * (updated.unitCost || 0);
        }
        
        // Check stock availability if SKU changes
        if (field === 'skuCode') {
          updated.inStock = (MOCK_STOCK[value] || 0) >= (updated.quantity || 0);
        }
        
        return updated;
      }
      return line;
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Delivery Detail</h2>
            <p className="text-sm text-gray-500">{localDelivery.documentNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Flow */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = statusStep >= step.step;
              const isCurrent = statusStep === step.step;
              
              return (
                <React.Fragment key={step.label}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-blue-200' : ''}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium ${
                        isActive ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-4 ${
                        statusStep > step.step ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Customer Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Customer Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <p className="text-sm text-gray-900">{localDelivery.customerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person
                </label>
                <p className="text-sm text-gray-900">{localDelivery.contactPerson}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <p className="text-sm text-gray-900 flex items-center gap-1">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {localDelivery.phone}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-sm text-gray-900 flex items-center gap-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {localDelivery.email}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination Address
                </label>
                <p className="text-sm text-gray-900 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {localDelivery.destinationAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Source Information */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Source Information</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source Location
              </label>
              <p className="text-sm text-gray-900">{localDelivery.sourceLocation}</p>
            </div>
          </div>

          {/* Products Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Products</h3>
              <button
                onClick={handleAddProduct}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      SKU
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Quantity
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Unit Cost
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Availability
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {deliveryLines.map((line) => (
                    <tr 
                      key={line.id}
                      className={!line.inStock ? 'bg-red-50' : ''}
                    >
                      <td className="px-4 py-2 text-sm">
                        <input
                          type="text"
                          value={line.productName}
                          onChange={(e) => handleLineChange(line.id, 'productName', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                          placeholder="Product name"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <input
                          type="text"
                          value={line.skuCode}
                          onChange={(e) => handleLineChange(line.id, 'skuCode', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                          placeholder="SKU"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <input
                          type="number"
                          value={line.quantity}
                          onChange={(e) => handleLineChange(line.id, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded"
                          min="1"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <input
                          type="number"
                          value={line.unitCost}
                          onChange={(e) => handleLineChange(line.id, 'unitCost', parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded"
                          step="0.01"
                          min="0"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm font-medium">
                        ${line.totalValue?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {line.inStock ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            In Stock
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                            Out of Stock
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleRemoveProduct(line.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          disabled={deliveryLines.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!allProductsAvailable && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">Stock Unavailable</p>
                  <p className="text-sm text-red-700">
                    Some products are out of stock. Status is set to "Waiting" until stock is available.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled Date
              </label>
              <p className="text-sm text-gray-900">
                {format(parseISO(localDelivery.scheduledDate), 'MMMM dd, yyyy')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <PriorityBadge priority={localDelivery.priority} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created By
              </label>
              <p className="text-sm text-gray-900">{localDelivery.createdBy}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created At
              </label>
              <p className="text-sm text-gray-900">
                {format(parseISO(localDelivery.createdAt), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
            {localDelivery.trackingNumber && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tracking Number
                </label>
                <p className="text-sm text-gray-900">{localDelivery.trackingNumber}</p>
              </div>
            )}
            {localDelivery.completedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Completed Date
                </label>
                <p className="text-sm text-gray-900">
                  {format(parseISO(localDelivery.completedDate), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            )}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <p className="text-sm text-gray-900">{localDelivery.notes}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleCancel}
            disabled={localDelivery.status === 'CANCELLED'}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XCircle className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={handleValidate}
            disabled={!allProductsAvailable || localDelivery.status === 'VALIDATED'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4" />
            Validate Delivery
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Deliveries Page Component
export default function Deliveries({ 
  onNavigate, 
  rows = MOCK_DELIVERIES,
  onDeliveryValidate 
}) {
  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
    priority: 'ALL',
    dateFrom: '',
    dateTo: ''
  });

  const [selectedDelivery, setSelectedDelivery] = useState(null);

  // Filter deliveries
  const filteredDeliveries = useMemo(() => {
    return rows.filter((delivery) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          delivery.documentNumber.toLowerCase().includes(searchLower) ||
          delivery.customerName.toLowerCase().includes(searchLower) ||
          delivery.productName.toLowerCase().includes(searchLower) ||
          delivery.skuCode.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== 'ALL' && delivery.status !== filters.status) {
        return false;
      }

      // Priority filter
      if (filters.priority !== 'ALL' && delivery.priority !== filters.priority) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom && filters.dateTo) {
        const deliveryDate = parseISO(delivery.scheduledDate);
        const fromDate = parseISO(filters.dateFrom);
        const toDate = parseISO(filters.dateTo);

        if (!isWithinInterval(deliveryDate, { start: fromDate, end: toDate })) {
          return false;
        }
      }

      return true;
    });
  }, [rows, filters]);

  const handleRowClick = (delivery) => {
    setSelectedDelivery(delivery);
  };

  const handleCloseModal = () => {
    setSelectedDelivery(null);
  };

  const handleValidate = (delivery) => {
    onDeliveryValidate?.(delivery);
    // Update the row in the list (in real app, this would refetch or update state)
    console.log('Delivery validated:', delivery);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Page Header */}
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Deliveries</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage outgoing deliveries and customer orders
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                Total: <span className="font-semibold text-gray-900">{filteredDeliveries.length}</span> deliveries
              </div>
            </div>
          </div>

          <FilterBar filters={filters} onFiltersChange={setFilters} />

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
              <div className="text-2xl font-bold text-gray-900">
                {rows.filter(d => d.status === 'DRAFT').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <div className="text-2xl font-bold text-gray-900">
                {rows.filter(d => d.status === 'VALIDATED').length}
              </div>
              <div className="text-sm text-gray-600">Delivered</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
              <div className="text-2xl font-bold text-gray-900">
                {rows.filter(d => d.isOverdue && d.status !== 'VALIDATED').length}
              </div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
              <div className="text-2xl font-bold text-gray-900">
                {rows.filter(d => d.priority === 'URGENT').length}
              </div>
              <div className="text-sm text-gray-600">Urgent</div>
            </div>
          </div>

          {/* Deliveries List */}
          <div className="bg-white rounded-lg shadow">
            <DeliveriesList 
              deliveries={filteredDeliveries}
              onRowClick={handleRowClick}
            />
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDelivery && (
        <DeliveryDetailModal
          delivery={selectedDelivery}
          onClose={handleCloseModal}
          onValidate={handleValidate}
        />
      )}
    </div>
  );
}
