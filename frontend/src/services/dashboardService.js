import api from './api';

export const dashboardService = {
  /**
   * Get dashboard KPIs
   */
  getKPIs: async () => {
    const response = await api.get('/dashboard/kpis');
    return response.data;
  },

  /**
   * Get dashboard analytics
   */
  getAnalytics: async () => {
    const response = await api.get('/dashboard/analytics');
    return response.data;
  },
};
