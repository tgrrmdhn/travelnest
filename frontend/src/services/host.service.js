import api from './api';

export const hostService = {
  getProfile: async () => {
    return await api.get('/host/profile');
  },

  updateProfile: async (data) => {
    return await api.put('/host/profile', data);
  },

  uploadPhotos: async (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('photos', file));
    return await api.upload('/host/photos', formData);
  },

  getRequests: async () => {
    return await api.get('/host/requests');
  },

  acceptRequest: async (requestId) => {
    return await api.put(`/host/requests/${requestId}/accept`);
  },

  rejectRequest: async (requestId) => {
    return await api.put(`/host/requests/${requestId}/reject`);
  },

  getReviews: async () => {
    return await api.get('/host/reviews');
  },
};