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


export const reportService = {
  /**
   * Get most borrowed books
   * Uses /popular-books endpoint which returns books by total borrow count
   */
  getMostBorrowedBooks: async (): Promise<{ title: string; count: number }[]> => {
    try {
      const response = await reportService.getPopularBooks(10);
      return response.data.map(book => ({
        title: book.title,
        count: book.total_borrowed
      }));
    } catch (error) {
      console.error('Failed to fetch most borrowed books:', error);
      // Fallback to empty array on error
      return [];
    }
  },

  /**
   * Get longest borrowed books
   * Returns books ranked by average borrow duration (longest to shortest)
   * @param limit - Maximum number of books to return (default: 10)
   * @returns List of books with average borrow days
   */
  getLongestBorrowedBooks: async (limit: number = 10): Promise<{ title: string; days: number }[]> => {
    try {
      const query = new URLSearchParams();
      query.append('limit', limit.toString());

      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: {
          book_id: number;
          title: string;
          author: string;
          publisher: string;
          year: number;
          isbn: string;
          category: string | null;
          total_copies: number;
          currently_borrowed: number;
          total_borrows: number;
          avg_borrow_days: number;
          min_borrow_days: number;
          max_borrow_days: number;
        }[];
        note?: string;
      }>(`/library/reports/longest-borrowed-books?${query.toString()}`);

      return response.data.map(book => ({
        title: book.title,
        days: Math.round(book.avg_borrow_days * 10) / 10 // Round to 1 decimal place
      }));
    } catch (error) {
      console.error('Failed to fetch longest borrowed books:', error);
      return [];
    }
  },

  /**
   * Get most borrowed categories
   * Aggregates from category distribution and borrowing data
   */
  getMostBorrowedCategories: async (): Promise<{ name: string; count: number }[]> => {
    try {
      // Use category distribution as a proxy for now
      // This shows categories by total book items, not borrow count
      // TODO: Backend should provide endpoint with actual borrow counts per category
      const response = await reportService.getCategoryDistribution();
      return response.data
        .map(cat => ({
          name: cat.category_name,
          count: cat.total_book_items // Using items count as proxy
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    } catch (error) {
      console.error('Failed to fetch most borrowed categories:', error);
      return [];
    }
  },

  /**
   * Get longest borrowed categories
   * Returns categories ranked by average borrow duration (longest to shortest)
   * @param limit - Maximum number of categories to return (default: 10)
   * @returns List of categories with average borrow days
   */
  getLongestBorrowedCategories: async (limit: number = 10): Promise<{ name: string; days: number }[]> => {
    try {
      const query = new URLSearchParams();
      query.append('limit', limit.toString());

      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: {
          category_id: number;
          category_name: string;
          description: string | null;
          total_borrows: number;
          total_books: number;
          avg_borrow_days: number;
          min_borrow_days: number;
          max_borrow_days: number;
        }[];
        note?: string;
      }>(`/library/reports/longest-borrowed-categories?${query.toString()}`);

      return response.data.map(category => ({
        name: category.category_name,
        days: Math.round(category.avg_borrow_days * 10) / 10 // Round to 1 decimal place
      }));
    } catch (error) {
      console.error('Failed to fetch longest borrowed categories:', error);
      return [];
    }
  },

  /**
   * Get category report details
   * @param categoryId - Category ID to get details for
   * @returns Category statistics and monthly trends
   */
  getCategoryReportDetails: async (categoryId: string): Promise<{
    monthlyBorrows: { month: string; count: number }[];
    totalBooks: number;
    totalBorrows: number;
  }> => {
    try {
      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: {
          category_info: {
            id: string;
            name: string;
            description: string | null;
          };
          statistics: {
            total_books: number;
            total_borrows: number;
            average_borrows_per_book: number;
          };
          monthly_borrows: {
            month: string;
            month_name: string;
            count: number;
          }[];
          top_books: {
            book_id: string;
            title: string;
            author: string;
            total_borrows: number;
            currently_borrowed: number;
          }[];
        };
      }>(`/library/reports/categories/${categoryId}/details`);

      // Transform response to match frontend interface
      return {
        monthlyBorrows: response.data.monthly_borrows.map(m => ({
          month: m.month_name,
          count: m.count
        })),
        totalBooks: response.data.statistics.total_books,
        totalBorrows: response.data.statistics.total_borrows
      };
    } catch (error) {
      console.error('Failed to fetch category details:', error);
      throw error;
    }
  },

  /**
   * Get book report details
   * @param bookId - Book master ID to get details for
   * @returns Book statistics, monthly trends, and item history
   */
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
    try {
      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: {
          book_info: {
            id: string;
            title: string;
            author: string;
            publisher: string;
            year: number;
            isbn: string;
            category: string | null;
          };
          statistics: {
            total_copies: number;
            currently_borrowed: number;
            total_lifetime_borrows: number;
            average_borrow_days: number;
          };
          monthly_borrows: {
            month: string;
            month_name: string;
            count: number;
          }[];
          items: {
            id: string;
            code: string;
            condition: string;
            status: string;
            created_at: string;
            history: {
              id: string;
              student_id: string;
              student_name: string;
              student_number: string;
              borrow_date: string;
              due_date: string;
              return_date: string | null;
              status: 'borrowed' | 'returned' | 'overdue';
              return_condition: string | null;
              days_borrowed: number;
            }[];
          }[];
        };
      }>(`/library/reports/books/${bookId}/details`);

      // Transform response to match frontend interface
      return {
        monthlyBorrows: response.data.monthly_borrows.map(m => ({
          month: m.month_name,
          count: m.count
        })),
        totalCopies: response.data.statistics.total_copies,
        currentlyBorrowed: response.data.statistics.currently_borrowed,
        totalLifetimeBorrows: response.data.statistics.total_lifetime_borrows,
        items: response.data.items.map(item => ({
          id: item.id,
          code: item.code,
          condition: item.condition,
          status: item.status,
          history: item.history.map(h => ({
            id: h.id,
            studentName: h.student_name,
            borrowDate: new Date(h.borrow_date),
            returnDate: h.return_date ? new Date(h.return_date) : undefined,
            status: h.status.charAt(0).toUpperCase() + h.status.slice(1) as 'Borrowed' | 'Returned' | 'Overdue',
            returnCondition: h.return_condition || undefined
          }))
        }))
      };
    } catch (error) {
      console.error('Failed to fetch book details:', error);
      throw error;
    }
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
