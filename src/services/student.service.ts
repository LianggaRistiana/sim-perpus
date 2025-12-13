import { apiClient } from '../lib/api-client';
import type { Student, Admin, PaginatedResponse, ApiResponse } from '../types';
import { admins } from './mock-db';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const studentService = {
  getStudents: async (params?: { page?: number; limit?: number; keyword?: string }): Promise<PaginatedResponse<Student>> => {
    try {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.keyword) query.append('keyword', params.keyword);

      const response = await apiClient.get<PaginatedResponse<Student>>(`/students?${query.toString()}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch students:', error);
      return {
        status: 'error',
        data: [],
        meta: { page: 1, per_page: 10, total: 0, last_page: 1, timestamp: new Date().toISOString() }
      };
    }
  },

  getStudentById: async (id: string): Promise<Student | undefined> => {
    try {
      const response = await apiClient.get<{ data: Student }>(`/students/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch student:', error);
      return undefined;
    }
  },

  addStudent: async (student: Omit<Student, 'id'>): Promise<ApiResponse<Student>> => {
    const response = await apiClient.post<ApiResponse<Student>>('/students', student);
    return response;
  },

  updateStudent: async (id: string, student: Partial<Student>): Promise<ApiResponse<Student> | null> => {
    try {
        const response = await apiClient.put<ApiResponse<Student>>(`/students/${id}`, student);
        return response;
    } catch (error) {
        console.error('Failed to update student:', error);
        return null;
    }
  },

  deleteStudent: async (id: string): Promise<ApiResponse<null> | null> => {
    try {
      const response = await apiClient.delete<ApiResponse<null>>(`/students/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to delete student:', error);
      return null;
    }
  },

  batchCreateStudents: async (students: Omit<Student, 'id'>[]): Promise<ApiResponse<Student[]>> => {
     const response = await apiClient.post<ApiResponse<Student[]>>('/students/batch', { students });
     return response;
  },
  
  // Admins (Mock implementation retained as no API endpoint was specified)
  getAdmins: async (): Promise<Admin[]> => {
    await delay(500);
    return admins;
  },

  // Reports (Mock implementation retained for dashboard/analytics)
  getMostActiveStudents: async (): Promise<{ name: string; count: number }[]> => {
    await delay(500);
    return [
      { name: 'John Doe', count: 15 },
      { name: 'Jane Smith', count: 12 },
      { name: 'Alice Johnson', count: 8 },
    ].sort((a, b) => b.count - a.count);
  },
  
  getStudentReportDetails: async (_studentId: string): Promise<{
    monthlyActivity: { month: string; count: number }[];
    totalBorrows: number;
    currentlyBorrowed: number;
    overdueCount: number;
  }> => {
    await delay(500);
    // Mock data based on student ID
    return {
      monthlyActivity: [
        { month: 'Jan', count: Math.floor(Math.random() * 10) },
        { month: 'Feb', count: Math.floor(Math.random() * 10) },
        { month: 'Mar', count: Math.floor(Math.random() * 10) },
        { month: 'Apr', count: Math.floor(Math.random() * 10) },
        { month: 'May', count: Math.floor(Math.random() * 10) },
        { month: 'Jun', count: Math.floor(Math.random() * 10) },
      ],
      totalBorrows: Math.floor(Math.random() * 50),
      currentlyBorrowed: Math.floor(Math.random() * 3),
      overdueCount: Math.floor(Math.random() * 2),
    };
  }
};
