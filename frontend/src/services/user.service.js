import api from './api';

export const userService = {
  getProfile: async () => {
    return await api.get('/user/profile');
  },

  updateProfile: async (data) => {
    return await api.put('/user/profile', data);
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return await api.upload('/user/avatar', formData);
  },

  getUsers: async (params) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(`/user?${query}`);
  },

  banUser: async (userId) => {
    return await api.put(`/user/${userId}/ban`);
  },

  unbanUser: async (userId) => {
    return await api.put(`/user/${userId}/unban`);
  },
};