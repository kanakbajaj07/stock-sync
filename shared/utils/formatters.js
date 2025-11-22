/**
 * Shared utility functions for formatting data
 */

/**
 * Format a date to a readable string
 * @param {Date|string} date
 * @param {string} format - 'short' | 'long' | 'time'
 * @returns {string}
 */
const formatDate = (date, format = 'short') => {
  if (!date) return '';
  
  const d = new Date(date);
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    case 'long':
      return d.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    case 'time':
      return d.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    default:
      return d.toLocaleDateString();
  }
};

/**
 * Format a number to a readable string
 * @param {number} num
 * @param {number} decimals
 * @returns {string}
 */
const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined) return '0';
  return Number(num).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Format quantity with unit
 * @param {number} quantity
 * @param {string} uom
 * @returns {string}
 */
const formatQuantity = (quantity, uom) => {
  return `${formatNumber(quantity, 2)} ${uom}`;
};

/**
 * Capitalize first letter of a string
 * @param {string} str
 * @returns {string}
 */
const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert snake_case to Title Case
 * @param {string} str
 * @returns {string}
 */
const snakeToTitle = (str) => {
  if (!str) return '';
  return str
    .split('_')
    .map(word => capitalize(word))
    .join(' ');
};

module.exports = {
  formatDate,
  formatNumber,
  formatQuantity,
  capitalize,
  snakeToTitle,
};

