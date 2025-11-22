import api from './api';

export const locationService = {
  /**
   * Get all locations
   */
  getLocations: async (params = {}) => {
    const response = await api.get('/locations', { params });
    return response.data;
  },

  /**
   * Get single location
   */
  getLocation: async (id) => {
    const response = await api.get(`/locations/${id}`);
    return response.data;
  },

  /**
   * Create new location
   */
  createLocation: async (locationData) => {
    const response = await api.post('/locations', locationData);
    return response.data;
  },

  /**
   * Update location
   */
  updateLocation: async (id, locationData) => {
    const response = await api.put(`/locations/${id}`, locationData);
    return response.data;
  },

  /**
   * Delete location
   */
  deleteLocation: async (id) => {
    const response = await api.delete(`/locations/${id}`);
    return response.data;
  },
};

