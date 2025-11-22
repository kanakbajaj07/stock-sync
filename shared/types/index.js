/**
 * Shared TypeScript-style type definitions (JSDoc format for JavaScript)
 * These types are shared between frontend and backend
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 * @property {'ADMIN' | 'MANAGER' | 'STAFF'} role
 * @property {boolean} isActive
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} skuCode
 * @property {string} description
 * @property {string} category
 * @property {string} uom - Unit of Measure
 * @property {number} reorderLevel
 * @property {boolean} isActive
 */

/**
 * @typedef {Object} Location
 * @property {string} id
 * @property {string} name
 * @property {'WAREHOUSE' | 'RACK' | 'SHELF' | 'ZONE' | 'SUPPLIER' | 'CUSTOMER'} type
 * @property {string} description
 * @property {boolean} isActive
 */

/**
 * @typedef {Object} StockLevel
 * @property {string} id
 * @property {string} productId
 * @property {string} locationId
 * @property {number} quantity
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} StockLedger
 * @property {string} id
 * @property {string} productId
 * @property {string} sourceLocationId
 * @property {string} destinationLocationId
 * @property {number} quantity
 * @property {'RECEIPT' | 'DELIVERY' | 'INTERNAL_TRANSFER' | 'ADJUSTMENT'} documentType
 * @property {string} documentNumber
 * @property {'DRAFT' | 'VALIDATED' | 'CANCELLED'} status
 * @property {string} notes
 * @property {string} createdBy
 * @property {Date} validatedAt
 * @property {Date} createdAt
 */

module.exports = {};

