import api from './api';

export const operationService = {
  /**
   * Create receipt (incoming stock)
   */
  createReceipt: async (data) => {
    const response = await api.post('/operations/receipt', data);
    return response.data;
  },

  /**
   * Create delivery (outgoing stock)
   */
  createDelivery: async (data) => {
    const response = await api.post('/operations/delivery', data);
    return response.data;
  },

  /**
   * Create internal transfer
   */
  createTransfer: async (data) => {
    const response = await api.post('/operations/transfer', data);
    return response.data;
  },

  /**
   * Validate operation (CRITICAL - Updates stock)
   */
  validateOperation: async (moveId) => {
    const response = await api.post(`/operations/validate/${moveId}`);
    return response.data;
  },

  /**
   * Get all operations
   */
  getOperations: async (params = {}) => {
    const response = await api.get('/operations', { params });
    return response.data;
  },

  /**
   * Get single operation
   */
  getOperation: async (moveId) => {
    const response = await api.get(`/operations/${moveId}`);
    return response.data;
  },

  /**
   * Cancel operation
   */
  cancelOperation: async (moveId) => {
    const response = await api.delete(`/operations/${moveId}`);
    return response.data;
  },
};

