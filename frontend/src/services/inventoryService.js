import api from './api';

export const inventoryService = {
  /**
   * Get stock levels
   */
  getStockLevels: async (params = {}) => {
    const response = await api.get('/inventory/stock-levels', { params });
    return response.data;
  },

  /**
   * Get stock ledger (movement history)
   */
  getStockLedger: async (params = {}) => {
    const response = await api.get('/inventory/stock-ledger', { params });
    return response.data;
  },

  /**
   * Get low stock alerts
   */
  getLowStock: async () => {
    const response = await api.get('/inventory/low-stock');
    return response.data;
  },
};

