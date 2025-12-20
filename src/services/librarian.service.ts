import { apiClient } from '../lib/api-client';
import type { Librarian, PaginatedResponse, ApiResponse } from '../types';

export const librarianService = {
  getLibrarians: async (params?: { page?: number; limit?: number; keyword?: string }): Promise<PaginatedResponse<Librarian>> => {
    try {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.keyword) query.append('keyword', params.keyword);

      const response = await apiClient.get<PaginatedResponse<Librarian>>(`/librarians?${query.toString()}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch librarians:', error);
      return {
        status: 'error',
        data: [],
        meta: { current_page: 1, per_page: 10, total: 0, last_page: 1, timestamp: new Date().toISOString() }
      };
    }
  },

  getLibrarianById: async (id: string): Promise<Librarian | undefined> => {
    try {
      const response = await apiClient.get<{ data: Librarian }>(`/librarians/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch librarian:', error);
      return undefined;
    }
  },

  addLibrarian: async (librarian: Pick<Librarian, 'name' | 'user_number'> & { email?: string, password?: string }): Promise<ApiResponse<Librarian>> => {
    const response = await apiClient.post<ApiResponse<Librarian>>('/librarians', librarian);
    return response;
  },

  updateLibrarian: async (id: string, librarian: Partial<Librarian>): Promise<ApiResponse<Librarian>> => {
    const response = await apiClient.put<ApiResponse<Librarian>>(`/librarians/${id}`, librarian);
    return response;
  },

  deleteLibrarian: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/librarians/${id}`);
    return response;
  }
};
