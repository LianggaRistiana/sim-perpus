import { apiClient } from '../lib/api-client';
import type { BookMaster, BookItem, PaginatedResponse, ApiResponse } from '../types';



export const bookService = {
  getBooks: async (params?: { page?: number; limit?: number; keyword?: string; category_id?: string }): Promise<PaginatedResponse<BookMaster>> => {
    try {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.keyword) query.append('keyword', params.keyword);
      if (params?.category_id) query.append('category_id', params.category_id);

      const response = await apiClient.get<PaginatedResponse<BookMaster>>(`/books?${query.toString()}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch books:', error);
      return {
        status: 'error',
        data: [],
        meta: { page: 1, per_page: 10, total: 0, last_page: 1, timestamp: new Date().toISOString() }
      };
    }
  },
  getBookById: async (id: string): Promise<BookMaster | undefined> => {
    try {
      const response = await apiClient.get<{ data: BookMaster }>(`/books/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch book:', error);
      return undefined;
    }
  },
  addBook: async (book: Omit<BookMaster, 'id'> & { bookItemQuantity?: number }): Promise<ApiResponse<BookMaster>> => {
    const response = await apiClient.post<ApiResponse<BookMaster>>('/books', book);
    return response;
  },
  updateBook: async (id: string, book: Partial<BookMaster>): Promise<ApiResponse<BookMaster> | null> => {
    try {
      const response = await apiClient.put<ApiResponse<BookMaster>>(`/books/${id}`, book);
      return response;
    } catch (error) {
      console.error('Failed to update book:', error);
      return null;
    }
  },
  deleteBook: async (id: string): Promise<ApiResponse<null> | null> => {
    try {
      const response = await apiClient.delete<ApiResponse<null>>(`/books/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to delete book:', error);
      return null;
    }
  },

  // Book Items
  getBookItems: async (masterId?: string): Promise<BookItem[]> => {
    try {
      if (masterId) {
        const response = await apiClient.get<{ data: BookItem[] }>(`/books/${masterId}/items`);
        return response.data;
      }
      // If no masterId, maybe get all? Not sure if supported, but preserving signature.
      return [];
    } catch (error) {
      console.error('Failed to fetch book items:', error);
      return [];
    }
  },
  addBookItem: async (item: Omit<BookItem, 'id' | 'createdAt'>): Promise<ApiResponse<BookItem>> => {
    const response = await apiClient.post<ApiResponse<BookItem>>('/book-items', item);
    return response;
  },
  updateBookItem: async (id: string, item: Partial<BookItem>): Promise<ApiResponse<BookItem> | null> => {
    try {
      const response = await apiClient.put<ApiResponse<BookItem>>(`/book-items/${id}`, item);
      return response;
    } catch (error) {
      console.error('Failed to update book item:', error);
      return null;
    }
  },
  deleteBookItem: async (id: string): Promise<ApiResponse<null> | null> => {
    try {
      const response = await apiClient.delete<ApiResponse<null>>(`/book-items/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to delete book item:', error);
      return null;
    }
  },
  
  getDamagedBooks: async (): Promise<BookItem[]> => {
    try {
      // Assuming endpoint for damaged books or filter
      const response = await apiClient.get<{ data: BookItem[] }>('/book-items?condition=damaged');
      return response.data; 
    } catch {
      return [];
    }
  },
};
