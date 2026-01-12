import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');

      if (storedUser && storedToken) {
        // Verify token with backend
        const response = await authService.getCurrentUser();
        
        if (response.success) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        } else {
          // Token invalid, clear storage
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData, token) => {
    try {
      console.log('AuthContext: Setting user and token', userData);
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      
      // Update state
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log('AuthContext: User set, isAuthenticated set to true');
      
      return { success: true };
    } catch (error) {
      console.error('AuthContext: Login error', error);
      return { 
        success: false, 
        message: error.message 
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/login'; // Force redirect to login
    } catch (error) {
      console.error('Logout error:', error);
      // Clear state anyway
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/login';
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
