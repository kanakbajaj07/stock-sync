/**
 * Operation validation rules
 */

const validateOperation = (operationData) => {
  const errors = {};

  // Product validation
  if (!operationData.productId) {
    errors.productId = 'Product is required';
  }

  // Quantity validation
  if (!operationData.quantity || operationData.quantity <= 0) {
    errors.quantity = 'Quantity must be greater than 0';
  }

  // Document type specific validations
  switch (operationData.documentType) {
    case 'RECEIPT':
      if (!operationData.destinationLocationId) {
        errors.destinationLocationId = 'Destination location is required for receipts';
      }
      break;

    case 'DELIVERY':
      if (!operationData.sourceLocationId) {
        errors.sourceLocationId = 'Source location is required for deliveries';
      }
      break;

    case 'INTERNAL_TRANSFER':
      if (!operationData.sourceLocationId) {
        errors.sourceLocationId = 'Source location is required for transfers';
      }
      if (!operationData.destinationLocationId) {
        errors.destinationLocationId = 'Destination location is required for transfers';
      }
      if (operationData.sourceLocationId === operationData.destinationLocationId) {
        errors.locations = 'Source and destination locations must be different';
      }
      break;

    default:
      errors.documentType = 'Invalid document type';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

module.exports = {
  validateOperation,
};

