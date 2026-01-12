import api from './api';

export const hostService = {
  getProfile: async () => {
    return await api.get('/host/profile');
  },

  createProfile: async (data) => {
    return await api.post('/host/profile', data);
  },

  updateProfile: async (data) => {
    return await api.put('/host/profile', data);
  },

  uploadPhotos: async (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('photos', file));
    return await api.upload('/host/photos', formData);
  },
  deletePhoto: async (photoUrl) => {
    return api.delete('/host/photos', { photoUrl });
  },
  getRequests: async () => {
    return await api.get('/host/requests');
  },

  getConversations: async () => {
    return await api.get('/host/conversations');
  },

  getBookings: async () => {
    return await api.get('/host/bookings');
  },

  acceptRequest: async (requestId) => {
    return await api.put(`/host/requests/${requestId}/accept`);
  },

  rejectRequest: async (requestId) => {
    return await api.put(`/host/requests/${requestId}/reject`);
  },

  verifyCheckout: async (requestId) => {
    return await api.put(`/host/requests/${requestId}/verify-checkout`);
  },

  getReviews: async () => {
    return await api.get('/host/reviews');
  },
};