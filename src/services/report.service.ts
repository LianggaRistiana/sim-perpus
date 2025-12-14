import { bookItems, borrowDetails, borrowTransactions, returnTransactions, returnDetails, students } from './mock-db';
import { apiClient } from '../lib/api-client';
import type {
  LibraryOverviewResponse,
  CategoryDistributionResponse,
  InventoryReportResponse,
  InDemandBooksResponse,
  PopularBooksResponse,
  StudentActivityResponse,
  BorrowingTrendsResponse,
  StudentHistoryResponse,
  OverdueBooksResponse,
  BookItem
} from '../types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const reportService = {
  getMostBorrowedBooks: async (): Promise<{ title: string; count: number }[]> => {
    await delay(500);
    return [
      { title: 'The Great Gatsby', count: 15 },
      { title: 'Clean Code', count: 12 },
      { title: 'A Brief History of Time', count: 8 },
      { title: 'Harry Potter', count: 20 },
      { title: 'Lord of the Rings', count: 18 },
    ].sort((a, b) => b.count - a.count);
  },

  getLongestBorrowedBooks: async (): Promise<{ title: string; days: number }[]> => {
    await delay(500);
    return [
      { title: 'Clean Code', days: 45 },
      { title: 'The Great Gatsby', days: 30 },
      { title: 'A Brief History of Time', days: 25 },
      { title: 'Introduction to Algorithms', days: 60 },
      { title: 'Design Patterns', days: 40 },
    ].sort((a, b) => b.days - a.days);
  },

  getMostBorrowedCategories: async (): Promise<{ name: string; count: number }[]> => {
    await delay(500);
    return [
      { name: 'Fiction', count: 45 },
      { name: 'Technology', count: 30 },
      { name: 'Science', count: 25 },
      { name: 'History', count: 15 },
    ].sort((a, b) => b.count - a.count);
  },

  getLongestBorrowedCategories: async (): Promise<{ name: string; days: number }[]> => {
    await delay(500);
    return [
      { name: 'Technology', days: 120 },
      { name: 'Fiction', days: 90 },
      { name: 'Science', days: 60 },
      { name: 'History', days: 45 },
    ].sort((a, b) => b.days - a.days);
  },

  getCategoryReportDetails: async (_categoryId: string): Promise<{
    monthlyBorrows: { month: string; count: number }[];
    totalBooks: number;
    totalBorrows: number;
  }> => {
    await delay(500);
    // Mock data based on category ID (randomized for demo)
    return {
      monthlyBorrows: [
        { month: 'Jan', count: Math.floor(Math.random() * 50) },
        { month: 'Feb', count: Math.floor(Math.random() * 50) },
        { month: 'Mar', count: Math.floor(Math.random() * 50) },
        { month: 'Apr', count: Math.floor(Math.random() * 50) },
        { month: 'May', count: Math.floor(Math.random() * 50) },
        { month: 'Jun', count: Math.floor(Math.random() * 50) },
      ],
      totalBooks: Math.floor(Math.random() * 100),
      totalBorrows: Math.floor(Math.random() * 200),
    };
  },

  getBookReportDetails: async (bookId: string): Promise<{
    monthlyBorrows: { month: string; count: number }[];
    totalCopies: number;
    currentlyBorrowed: number;
    totalLifetimeBorrows: number;
    items: {
      id: string;
      code: string;
      condition: string;
      status: string;
      history: {
        id: string;
        studentName: string;
        borrowDate: Date;
        returnDate?: Date;
        status: 'Borrowed' | 'Returned' | 'Overdue';
        returnCondition?: string;
      }[];
    }[];
  }> => {
    await delay(500);

    // Find items for this book
    const items = bookItems.filter(item => item.masterId === bookId);

    // Map items to include history
    const itemsWithHistory = items.map(item => {
      // Find borrows for this item
      const itemBorrows = borrowDetails.filter(bd => bd.bookItemId === item.id);

      const history = itemBorrows.map(bd => {
        const borrowTx = borrowTransactions.find(bt => bt.id === bd.borrowId);
        if (!borrowTx) return null;

        const returnTx = returnTransactions.find(rt => rt.borrowId === borrowTx.id);
        const returnDetail = returnTx ? returnDetails.find(rd => rd.returnId === returnTx.id && rd.bookItemId === item.id) : undefined;
        const student = students.find(s => s.id === borrowTx.studentId);

        return {
          id: borrowTx.id,
          studentName: student ? student.name : 'Unknown',
          borrowDate: borrowTx.borrowedAt,
          returnDate: returnTx ? returnTx.returnedAt : undefined,
          status: borrowTx.status as 'Borrowed' | 'Returned' | 'Overdue',
          returnCondition: returnDetail ? returnDetail.conditionAtReturn : undefined
        };
      }).filter((h): h is NonNullable<typeof h> => h !== null);

      return {
        id: item.id,
        code: item.code,
        condition: item.condition,
        status: item.status,
        history: history.sort((a, b) => b.borrowDate.getTime() - a.borrowDate.getTime())
      };
    });

    return {
      monthlyBorrows: [
        { month: 'Jan', count: Math.floor(Math.random() * 20) },
        { month: 'Feb', count: Math.floor(Math.random() * 20) },
        { month: 'Mar', count: Math.floor(Math.random() * 20) },
        { month: 'Apr', count: Math.floor(Math.random() * 20) },
        { month: 'May', count: Math.floor(Math.random() * 20) },
        { month: 'Jun', count: Math.floor(Math.random() * 20) },
      ],
      totalCopies: items.length,
      currentlyBorrowed: items.filter(i => i.status === 'Borrowed').length,
      totalLifetimeBorrows: itemsWithHistory.reduce((acc, item) => acc + item.history.length, 0),
      items: itemsWithHistory
    };
  },

  // ===== Library Report API Methods =====

  /**
   * Get library overview statistics
   * @returns Library overview data with total books, items, and categories
   */
  getLibraryOverview: async () => {
    try {
      const response = await apiClient.get<LibraryOverviewResponse>('/library/reports/overview');
      return response;
    } catch (error) {
      console.error('Failed to fetch library overview:', error);
      throw error;
    }
  },

  /**
   * Get category distribution report
   * @returns List of categories with book counts
   */
  getCategoryDistribution: async () => {
    try {
      const response = await apiClient.get<CategoryDistributionResponse>('/library/reports/categories');
      return response;
    } catch (error) {
      console.error('Failed to fetch category distribution:', error);
      throw error;
    }
  },

  /**
   * Get inventory report with pagination
   * @param page - Page number (default: 1)
   * @param perPage - Items per page (default: 15)
   * @returns Paginated inventory data with book items details
   */
  getInventoryReport: async (page: number = 1, perPage: number = 15) => {
    try {
      const query = new URLSearchParams();
      query.append('page', page.toString());
      query.append('per_page', perPage.toString());

      const response = await apiClient.get<InventoryReportResponse>(`/library/reports/inventory?${query.toString()}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch inventory report:', error);
      throw error;
    }
  },

  /**
   * Get in-demand books report
   * @param limit - Maximum number of books to return (default: 10)
   * @returns List of currently most borrowed books
   */
  getInDemand: async (limit: number = 10) => {
    try {
      const query = new URLSearchParams();
      query.append('limit', limit.toString());

      const response = await apiClient.get<InDemandBooksResponse>(`/library/reports/in-demand?${query.toString()}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch in-demand books:', error);
      throw error;
    }
  },

  /**
   * Get popular books report (most borrowed books)
   * @param limit - Maximum number of books to return (default: 10)
   * @returns List of most borrowed books
   */
  getPopularBooks: async (limit: number = 10) => {
    try {
      const query = new URLSearchParams();
      query.append('limit', limit.toString());

      const response = await apiClient.get<PopularBooksResponse>(`/library/reports/popular-books?${query.toString()}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch popular books:', error);
      throw error;
    }
  },

  /**
   * Get student activity report
   * @param params - Optional parameters: user_id for specific student, page and per_page for pagination
   * @returns Student borrowing statistics (paginated or single student)
   */
  getStudentActivity: async (params?: { user_id?: string; page?: number; per_page?: number }) => {
    try {
      const query = new URLSearchParams();
      if (params?.user_id) query.append('user_id', params.user_id);
      if (params?.page) query.append('page', params.page.toString());
      if (params?.per_page) query.append('per_page', params.per_page.toString());

      const response = await apiClient.get<StudentActivityResponse>(`/library/reports/student-activity?${query.toString()}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch student activity:', error);
      throw error;
    }
  },

  /**
   * Get borrowing trends report (monthly statistics)
   * @param year - Year for analysis (default: current year)
   * @returns Monthly borrowing trends for the specified year
   */
  getBorrowingTrends: async (year?: number) => {
    try {
      const query = new URLSearchParams();
      if (year) query.append('year', year.toString());

      const response = await apiClient.get<BorrowingTrendsResponse>(`/library/reports/trends?${query.toString()}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch borrowing trends:', error);
      throw error;
    }
  },

  /**
   * Get student borrowing history
   * @param userId - User ID to get history for
   * @param page - Page number (default: 1)
   * @param perPage - Items per page (default: 20)
   * @returns Complete borrowing history for the student
   */
  getStudentHistory: async (userId: string, page: number = 1, perPage: number = 20) => {
    try {
      const query = new URLSearchParams();
      query.append('page', page.toString());
      query.append('per_page', perPage.toString());

      const response = await apiClient.get<StudentHistoryResponse>(`/library/reports/student/${userId}/history?${query.toString()}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch student history:', error);
      throw error;
    }
  },

  /**
   * Get overdue books report
   * @param page - Page number (default: 1)
   * @param perPage - Items per page (default: 15)
   * @returns List of overdue transactions with borrower details
   */
  getOverdueBooks: async (page: number = 1, perPage: number = 15) => {
    try {
      const query = new URLSearchParams();
      query.append('page', page.toString());
      query.append('per_page', perPage.toString());

      const response = await apiClient.get<OverdueBooksResponse>(`/library/reports/overdue-books?${query.toString()}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch overdue books:', error);
      throw error;
    }
  },

  /**
   * Get damaged books with multi-condition filter support
   * @param conditions - Book conditions to filter (e.g., 'poor', 'damaged', or 'poor,damaged')
   * @returns List of book items in specified conditions
   */
  getDamagedBooks: async (conditions: string = 'poor,damaged') => {
    try {
      const query = new URLSearchParams();
      query.append('condition', conditions);

      const response = await apiClient.get<{ data: BookItem[] }>(`/book-items?${query.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch damaged books:', error);
      throw error;
    }
  },
};
