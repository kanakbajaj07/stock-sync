/**
 * Product validation rules
 */

const validateProduct = (productData) => {
  const errors = {};

  // Name validation
  if (!productData.name || productData.name.trim() === '') {
    errors.name = 'Product name is required';
  }

  // SKU validation
  if (!productData.skuCode || productData.skuCode.trim() === '') {
    errors.skuCode = 'SKU code is required';
  } else if (!/^[A-Z0-9-]+$/i.test(productData.skuCode)) {
    errors.skuCode = 'SKU code can only contain letters, numbers, and hyphens';
  }

  // Category validation
  if (!productData.category || productData.category.trim() === '') {
    errors.category = 'Category is required';
  }

  // UOM validation
  if (!productData.uom || productData.uom.trim() === '') {
    errors.uom = 'Unit of measure is required';
  }

  // Reorder level validation
  if (productData.reorderLevel !== undefined && productData.reorderLevel !== null) {
    if (productData.reorderLevel < 0) {
      errors.reorderLevel = 'Reorder level cannot be negative';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

module.exports = {
  validateProduct,
};

