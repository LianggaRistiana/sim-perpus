import { apiClient } from '../lib/api-client';
import type { Category, PaginatedResponse, ApiResponse } from '../types';

export const categoryService = {
  getCategories: async (params?: { page?: number; limit?: number; keyword?: string }): Promise<PaginatedResponse<Category>> => {
    try {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.keyword) query.append('keyword', params.keyword);

      const response = await apiClient.get<PaginatedResponse<Category>>(`/categories?${query.toString()}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return {
        status: 'error',
        data: [],
        meta: { current_page: 1, per_page: 10, total: 0, last_page: 1, timestamp: new Date().toISOString() }
      };
    }
  },
  getCategoryById: async (id: string): Promise<Category | undefined> => {
    try {
      const response = await apiClient.get<{ data: Category }>(`/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch category:', error);
      return undefined;
    }
  },
  addCategory: async (category: Omit<Category, 'id'>): Promise<ApiResponse<Category>> => {
    const response = await apiClient.post<ApiResponse<Category>>('/categories', category);
    console.log(response);
    return response;
  },
  updateCategory: async (id: string, category: Partial<Category>): Promise<ApiResponse<Category> | null> => {
    try {
      // Ensure id is removed from payload
      const { id: _, ...payload } = category as any;
      const response = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, payload);
      return response;
    } catch (error) {
      console.error('Failed to update category:', error);
      return null;
    }
  },
  deleteCategory: async (id: string): Promise<ApiResponse<null> | null> => {
    try {
      const response = await apiClient.delete<ApiResponse<null>>(`/categories/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to delete category:', error);
      return null;
    }
  },
};
