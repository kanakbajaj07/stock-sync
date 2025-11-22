import api from './api';

export const dashboardService = {
  /**
   * Get dashboard KPIs
   */
  getKPIs: async () => {
    const response = await api.get('/dashboard/kpis');
    return response.data;
  },
};

