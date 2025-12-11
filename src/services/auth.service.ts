import { apiClient } from '../lib/api-client';
import type { Admin, User } from '../types';

export const authService = {
  login: async (user_number: string, password: string): Promise<Admin | null> => {
    try {
      const response = await apiClient.post<{ data: { user: User; token: { access_token: string } } }>('/auth/login', {
        user_number,
        password,
      });

      const { user, token } = response.data;
      localStorage.setItem('token', token.access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return user as Admin; 
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    }
  },

  getProfile: async (): Promise<Admin | null> => {
    try {
      const response = await apiClient.get<{ data: User }>('/auth/me');
      return response.data as Admin;
    } catch (error) {
       console.error('Get profile failed:', error);
       return null;
    }
  },

  logout: async (): Promise<boolean> => {
    try {
      await apiClient.post('/auth/logout', {});
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
  },
};
