import api from './api';

export const adminService = {
  getStatistics: async () => {
    try {
      const response = await api.get('/admin/statistics');
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message 
      };
    }
  },

  getUsers: async (params) => {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await api.get(`/admin/users?${query}`);
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message 
      };
    }
  },

  banUser: async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/ban`);
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message 
      };
    }
  },

  unbanUser: async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/unban`);
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message 
      };
    }
  },
};