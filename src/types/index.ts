export type Role = "admin" | "librarian";

export interface User {
  id: string;
  name: string;
  user_number: string;
  role: Role;
  username?: string; // Optional as it might not be in the me response directly or named differently
}

export interface Librarian {
  id: string;
  name: string;
  user_number: string;
  email: string;
  role: 'librarian';
}

export interface Admin extends User {
  // Extending User for compatibility with existing code where possible
  // Adjusting based on existing usage
  passwordHash?: string;
  createdAt?: Date;
}

export interface Student {
  id: string;
  user_number: string;
  name: string;
}

export interface Category {
  id: string;
  code?: string;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  status: string;
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    timestamp: string;
  };
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface ApiResponseMeta<T> {
  status: string;
  message: string;
  meta: T;
}

export interface BookMaster {
  id: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  categoryId: string;
  isbn: string;
  bookItemQuantity?: number; // Added for creation payload
  category?: Category;
}

export interface BookItem {
  id: string;
  masterId: string;
  code: string;
  condition: string;
  status: string;
  createdAt: Date;
  book_master?: BookMaster;
}

export interface BorrowTransaction {
  id: string;
  adminId: string;
  studentId: string;
  borrowedAt: Date;
  dueDate: Date;
  status: string;
}

export interface BorrowDetail {
  id: string;
  borrowId: string;
  bookItemId: string;
  conditionAtBorrow: string;
}

export interface ReturnTransaction {
  id: string;
  borrowId: string;
  adminId: string;
  returnedAt: Date;
}

export interface ReturnDetail {
  id: string;
  returnId: string;
  bookItemId: string;
  conditionAtReturn: string;
  notes: string;
}

export interface BookReportItem {
  id: string;
  title: string;
  value: number; // count or days
}

export interface CategoryReportItem {
  id: string;
  name: string;
  value: number; // count or days
}

// Library Report Types
export interface LibraryOverview {
  total_book_titles: number;
  total_book_items: number;
  total_categories: number;
  total_borrowed: number;
  total_overdue: number;
}

export interface CategoryDistributionItem {
  category_name: string;
  total_book_titles: number;
  total_book_items: number;
}

export interface InventoryBookItem {
  item_id: string;
  code: string;
  condition: string;                // "good" | "excellent" | "poor" | "Unknown"
  status: string;                   // "borrowed" | "available" | "lost" | "unknown"
  is_borrowed: boolean;             // Convenience flag
  is_available: boolean;            // Convenience flag
  is_lost: boolean;                 // Convenience flag
  created_at: string;               // ISO 8601 format
}

export interface InventoryBook {
  book_id: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  isbn: string;
  category: string | null;
  total_items: number;
  borrowed_count: number;           // NEW: Count of borrowed items
  available_count: number;          // NEW: Count of available items
  lost_count: number;               // NEW: Count of lost items
  availability_percentage: number;  // NEW: (available / total) * 100
  items: InventoryBookItem[];
}

export interface InventoryPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface LibraryOverviewResponse {
  success: boolean;
  message: string;
  data: LibraryOverview;
}

export interface CategoryDistributionResponse {
  success: boolean;
  message: string;
  data: CategoryDistributionItem[];
}

export interface InventoryReportResponse {
  status: string;
  data: InventoryBook[];
  error: null;
  meta: {
    timestamp: string;
    page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

// In-Demand Books Types
export interface InDemandBook {
  book_id: string;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  category: string | null;
  total_items: number;
  currently_borrowed: number;       // How many copies are borrowed RIGHT NOW
  currently_available: number;      // How many copies are available RIGHT NOW
  demand_percentage: number;        // (currently_borrowed / total_items) * 100
}

export interface InDemandBooksResponse {
  success: boolean;
  message: string;
  data: InDemandBook[];
  note: string;
}

// Popular Books Report Types
export interface PopularBook {
  id: string;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  category: string | null;
  total_borrowed: number;
}

export interface PopularBooksResponse {
  success: boolean;
  message: string;
  data: PopularBook[];
}

// Student Activity Report Types
export interface StudentActivity {
  id: string;
  name: string;
  email: string;
  user_number: string;
  total_borrowings: number;
  active_borrowings: number;
  returned_count: number;
}

export interface StudentActivityResponse {
  success: boolean;
  message: string;
  data: StudentActivity[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

// Borrowing Trends Report Types
export interface MonthlyTrend {
  month: number;
  month_name: string;
  total_borrowings: number;
  active: number;
  returned: number;
}

export interface BorrowingTrendsResponse {
  success: boolean;
  message: string;
  data: {
    year: number;
    monthly_trends: MonthlyTrend[];
  };
}

// Student Borrowing History Types
export interface BorrowingHistoryBook {
  title: string;
  author: string;
  isbn: string;
  item_code: string;
  category: string;
}

export interface BorrowingHistoryTransaction {
  transaction_id: string;
  transaction_code: string;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  status: 'borrowed' | 'returned';
  books: BorrowingHistoryBook[];
}

export interface StudentHistoryResponse {
  success: boolean;
  message: string;
  data: {
    student: {
      id: string;
      name: string;
      email: string;
      user_number: string;
    };
    history: BorrowingHistoryTransaction[];
  };
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

// Overdue Books Report Types
export interface OverdueBookItem {
  title: string;
  isbn: string;
  code: string;
}

export interface OverdueBook {
  transaction_id: string;
  transaction_code: string;
  borrower: {
    name: string;
    number: string;
    email: string;
  };
  borrow_date: string;
  due_date: string;
  days_overdue: number;
  books: OverdueBookItem[];
}

export interface OverdueBooksResponse {
  success: boolean;
  message: string;
  data: OverdueBook[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

