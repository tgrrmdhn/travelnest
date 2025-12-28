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

  getKycRequests: async () => {
    try {
      const response = await api.get('/admin/kyc');
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message 
      };
    }
  },

  approveKyc: async (userId) => {
    try {
      const response = await api.put(`/admin/kyc/${userId}/approve`);
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message 
      };
    }
  },

  rejectKyc: async (userId) => {
    try {
      const response = await api.put(`/admin/kyc/${userId}/reject`);
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message 
      };
    }
  },

  getReports: async () => {
    try {
      const response = await api.get('/admin/reports');
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message 
      };
    }
  },

  sendBroadcast: async (data) => {
    try {
      const response = await api.post('/admin/broadcast', data);
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message 
      };
    }
  },

  getActivityLogs: async (params) => {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await api.get(`/admin/activity-logs?${query}`);
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message 
      };
    }
  },
};