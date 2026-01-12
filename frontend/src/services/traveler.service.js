import api from './api';

export const travelerService = {
  searchHosts: async (params) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(`/traveler/search?${query}`);
  },

  getHostDetails: async (hostId) => {
    return await api.get(`/traveler/hosts/${hostId}`);
  },

  sendRequest: async (data) => {
    return await api.post('/traveler/requests', data);
  },

  getRequests: async () => {
    return await api.get('/traveler/requests');
  },

  requestCheckout: async (requestId) => {
    return await api.put(`/traveler/requests/${requestId}/checkout`);
  },

  createReview: async (requestId, data) => {
    return await api.post('/traveler/reviews', {
      request_id: requestId,
      ...data,
    });
  },

  getReviews: async () => {
    return await api.get('/traveler/reviews');
  },

  addFavorite: async (hostId) => {
    return await api.post(`/traveler/favorites/${hostId}`);
  },

  removeFavorite: async (hostId) => {
    return await api.delete(`/traveler/favorites/${hostId}`);
  },

  getFavorites: async () => {
    return await api.get('/traveler/favorites');
  },
};