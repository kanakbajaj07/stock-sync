/**
 * Shared constants across the application
 */

// User Roles
const USER_ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
};

// Document Types
const DOCUMENT_TYPES = {
  RECEIPT: 'RECEIPT',
  DELIVERY: 'DELIVERY',
  INTERNAL_TRANSFER: 'INTERNAL_TRANSFER',
  ADJUSTMENT: 'ADJUSTMENT',
};

// Document Status
const DOCUMENT_STATUS = {
  DRAFT: 'DRAFT',
  VALIDATED: 'VALIDATED',
  CANCELLED: 'CANCELLED',
};

// Location Types
const LOCATION_TYPES = {
  WAREHOUSE: 'WAREHOUSE',
  RACK: 'RACK',
  SHELF: 'SHELF',
  ZONE: 'ZONE',
  SUPPLIER: 'SUPPLIER',
  CUSTOMER: 'CUSTOMER',
};

// Common Units of Measure
const UNITS_OF_MEASURE = [
  'pcs', // Pieces
  'kg',  // Kilograms
  'g',   // Grams
  'l',   // Liters
  'ml',  // Milliliters
  'm',   // Meters
  'cm',  // Centimeters
  'box', // Box
  'pack', // Pack
  'unit', // Unit
];

// Product Categories (Example - customize as needed)
const PRODUCT_CATEGORIES = [
  'Electronics',
  'Furniture',
  'Clothing',
  'Food & Beverages',
  'Raw Materials',
  'Office Supplies',
  'Tools & Equipment',
  'Other',
];

module.exports = {
  USER_ROLES,
  DOCUMENT_TYPES,
  DOCUMENT_STATUS,
  LOCATION_TYPES,
  UNITS_OF_MEASURE,
  PRODUCT_CATEGORIES,
};

