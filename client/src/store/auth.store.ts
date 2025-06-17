import { create } from 'zustand';
import axiosInstance from '../axiosInstance';

interface User {
  id: string;
  name: string;
  email: string;
  // Add other user fields as necessary
}

interface AuthState {
  user: User | null;
  token: string | null;
  error: string | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<any>;
  resetPassword: (token: string, newPassword: string) => Promise<any>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('authToken') || null,
  error: null,

  login: async (identifier, password): Promise<boolean> => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        identifier,
        password,
      });
      const { token, user } = response.data;

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        token,
        user: user,
        error: null,
      });
      return true;
    } catch (error) {
      set({
        error: error.message || 'Login failed',
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
    });
  },

  requestPasswordReset: async (email: string): Promise<any> => {
    try {
      const response = await axiosInstance.post(
        '/auth/request-password-reset',
        { email }
      );
      set({ error: null });
      return response.data;
    } catch (error) {
      set({
        error: error.message || 'Password reset request failed',
      });
      throw error;
    }
  },

  resetPassword: async (token: string, newPassword: string): Promise<any> => {
    try {
      const response = await axiosInstance.post('/auth/reset-password', {
        token,
        newPassword,
      });
      set({ error: null });
      return response.data;
    } catch (error) {
      set({
        error: error.message || 'Password reset failed',
      });
      throw error;
    }
  },
}));
