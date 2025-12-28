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

  getReviews: async () => {
    return await api.get('/traveler/reviews');
  },

  submitReview: async (data) => {
    return await api.post('/traveler/reviews', data);
  },
};