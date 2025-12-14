# Library Reports API - Frontend Developer Guide

> **Dokumentasi Lengkap**: Panduan implementasi frontend untuk semua endpoint Library Reports yang telah diimplementasikan.

---

## 📋 Daftar Isi

1. [Authentication](#authentication)
2. [API Endpoints](#api-endpoints)
3. [TypeScript Integration](#typescript-integration)
4. [React Hooks Examples](#react-hooks-examples)
5. [Error Handling](#error-handling)
6. [Testing Guide](#testing-guide)

---

## Authentication

### Required Headers

Semua endpoint library reports memerlukan autentikasi:

```typescript
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

### Required Roles
- `admin` atau `librarian`

### Login Endpoint

**POST** `/api/auth/login`

```typescript
const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'password'
  })
});

const { access_token } = await response.json();
localStorage.setItem('token', access_token);
```

---

## API Endpoints

### Base URL
```
http://127.0.0.1:8000/api
```

### 1. Overview Report

Mendapatkan statistik dasar perpustakaan untuk dashboard.

**Endpoint:** `GET /library/reports/overview`

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "message": "Library overview retrieved successfully",
  "data": {
    "total_book_titles": 50,
    "total_book_items": 150,
    "total_categories": 10,
    "total_borrowed": 25,
    "total_overdue": 5
  }
}
```

**Frontend Example:**
```typescript
const getOverview = async () => {
  const response = await apiClient.get('/library/reports/overview');
  return response.data.data;
};
```

**Use Cases:**
- Dashboard statistics cards
- Quick library metrics
- Admin homepage summary

---

### 2. Category Distribution Report

Distribusi buku berdasarkan kategori.

**Endpoint:** `GET /library/reports/categories`

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "message": "Category distribution report generated successfully",
  "data": [
    {
      "category_name": "Fiction",
      "total_book_titles": 25,
      "total_book_items": 75
    },
    {
      "category_name": "Science",
      "total_book_titles": 15,
      "total_book_items": 45
    }
  ]
}
```

**Frontend Example:**
```typescript
interface CategoryDistribution {
  category_name: string;
  total_book_titles: number;
  total_book_items: number;
}

const getCategoryDistribution = async (): Promise<CategoryDistribution[]> => {
  const response = await apiClient.get('/library/reports/categories');
  return response.data.data;
};

// Usage in Chart Component
const CategoryChart = () => {
  const [data, setData] = useState<CategoryDistribution[]>([]);
  
  useEffect(() => {
    getCategoryDistribution().then(setData);
  }, []);
  
  return (
    <BarChart 
      data={data.map(cat => ({
        name: cat.category_name,
        titles: cat.total_book_titles,
        items: cat.total_book_items
      }))}
    />
  );
};
```

---

### 3. Book Inventory Report

Detail inventori lengkap dengan status setiap item.

**Endpoint:** `GET /library/reports/inventory`

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `per_page` | number | 15 | Items per page |
| `page` | number | 1 | Current page |

**Request Example:**
```typescript
GET /library/reports/inventory?per_page=10&page=1
```

**Response:**
```json
{
  "success": true,
  "message": "Book inventory report generated successfully",
  "data": [
    {
      "book_id": 1,
      "title": "Introduction to Algorithms",
      "author": "Thomas H. Cormen",
      "publisher": "MIT Press",
      "year": "2009",
      "isbn": "9780262033848",
      "category": "Computer Science",
      "total_items": 5,
      "borrowed_count": 2,
      "available_count": 3,
      "lost_count": 0,
      "availability_percentage": 60.00,
      "items": [
        {
          "item_id": 1,
          "code": "CS-001-001",
          "condition": "good",
          "status": "borrowed",
          "is_borrowed": true,
          "is_available": false,
          "is_lost": false,
          "created_at": "2024-01-15T10:30:00.000000Z"
        }
      ]
    }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 10,
    "total": 50
  }
}
```

**Frontend Example:**
```typescript
interface BookInventory {
  book_id: number;
  title: string;
  author: string;
  total_items: number;
  borrowed_count: number;
  available_count: number;
  availability_percentage: number;
  items: BookItemDetail[];
}

const getInventory = async (page = 1, perPage = 15) => {
  const response = await apiClient.get(
    `/library/reports/inventory?page=${page}&per_page=${perPage}`
  );
  return {
    data: response.data.data,
    pagination: response.data.pagination
  };
};
```

---

### 4. In-Demand Books Report

Buku yang sedang banyak dipinjam saat ini (real-time snapshot).

**Endpoint:** `GET /library/reports/in-demand`

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 10 | Top N books |

**Response:**
```json
{
  "success": true,
  "message": "In-demand books report generated successfully",
  "data": [
    {
      "book_id": 5,
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "publisher": "Prentice Hall",
      "isbn": "9780132350884",
      "category": "Computer Science",
      "total_items": 8,
      "currently_borrowed": 6,
      "currently_available": 2,
      "demand_percentage": 75.00
    }
  ],
  "note": "This shows books with the most copies currently borrowed (snapshot)"
}
```

**Frontend Example:**
```typescript
const InDemandWidget = () => {
  const [books, setBooks] = useState([]);
  
  useEffect(() => {
    apiClient.get('/library/reports/in-demand?limit=5')
      .then(res => setBooks(res.data.data));
  }, []);
  
  return (
    <div className="in-demand-books">
      <h3>📈 Hot Books Right Now</h3>
      {books.map(book => (
        <div key={book.book_id} className="book-card">
          <h4>{book.title}</h4>
          <div className="demand-badge" 
               style={{ background: book.demand_percentage > 70 ? 'red' : 'orange' }}>
            {book.demand_percentage}% in demand
          </div>
          <p>{book.currently_borrowed} / {book.total_items} borrowed</p>
        </div>
      ))}
    </div>
  );
};
```

---

### 5. Popular Books Report

Buku paling populer berdasarkan histori peminjaman (all-time).

**Endpoint:** `GET /library/reports/popular-books`

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 10 | Top N books |

**Response:**
```json
{
  "success": true,
  "message": "Popular books report generated successfully",
  "data": [
    {
      "id": 1,
      "title": "Harry Potter and the Philosopher's Stone",
      "author": "J.K. Rowling",
      "publisher": "Bloomsbury",
      "isbn": "9780747532699",
      "category": "Fiction",
      "total_borrowed": 45
    }
  ]
}
```

**Difference: In-Demand vs Popular**

| Aspect | In-Demand | Popular |
|--------|-----------|---------|
| Data Source | Current status snapshot | Historical transactions |
| Metric | Currently borrowed items | Total times borrowed |
| Updates | Real-time | Historical accumulation |

---

### 6. Student Activity Report

Statistik aktivitas peminjaman per siswa.

**Endpoint:** `GET /library/reports/student-activity`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | number | No | Filter specific student |
| `per_page` | number | No | Items per page (when no user_id) |
| `page` | number | No | Current page (when no user_id) |

**Request Examples:**
```typescript
// All students (paginated)
GET /library/reports/student-activity?page=1&per_page=20

// Specific student
GET /library/reports/student-activity?user_id=5
```

**Response (All Students):**
```json
{
  "success": true,
  "message": "Student activity report generated successfully",
  "data": [
    {
      "id": 5,
      "name": "John Doe",
      "email": "john.doe@school.com",
      "user_number": "STD2024001",
      "total_borrowings": 12,
      "active_borrowings": 2,
      "returned_count": 10
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total": 45,
    "last_page": 3
  }
}
```

**Frontend Example:**
```typescript
// Service
const getStudentActivity = async (userId?: number, page = 1) => {
  const params = userId 
    ? `user_id=${userId}` 
    : `page=${page}&per_page=15`;
  
  const response = await apiClient.get(
    `/library/reports/student-activity?${params}`
  );
  
  return response.data;
};

// Component
const StudentActivityTable = () => {
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    getStudentActivity(undefined, currentPage)
      .then(res => setStudents(res.data));
  }, [currentPage]);
  
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Total Borrowings</th>
          <th>Active</th>
          <th>Returned</th>
        </tr>
      </thead>
      <tbody>
        {students.map(student => (
          <tr key={student.id}>
            <td>{student.name}</td>
            <td>{student.total_borrowings}</td>
            <td>
              <Badge color={student.active_borrowings > 0 ? 'blue' : 'gray'}>
                {student.active_borrowings}
              </Badge>
            </td>
            <td>{student.returned_count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

---

### 7. Borrowing Trends Report

Tren peminjaman per bulan untuk tahun tertentu.

**Endpoint:** `GET /library/reports/trends`

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `year` | number | Current year | Year for analysis |

**Request Example:**
```typescript
GET /library/reports/trends?year=2024
```

**Response:**
```json
{
  "success": true,
  "message": "Borrowing trends report generated successfully",
  "data": {
    "year": 2024,
    "monthly_trends": [
      {
        "month": 1,
        "month_name": "January",
        "total_borrowings": 45,
        "active": 12,
        "returned": 33
      },
      {
        "month": 2,
        "month_name": "February",
        "total_borrowings": 52,
        "active": 15,
        "returned": 37
      }
    ]
  }
}
```

**Frontend Example:**
```typescript
const TrendsChart = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [trends, setTrends] = useState([]);
  
  useEffect(() => {
    apiClient.get(`/library/reports/trends?year=${year}`)
      .then(res => setTrends(res.data.data.monthly_trends));
  }, [year]);
  
  return (
    <div>
      <select value={year} onChange={e => setYear(e.target.value)}>
        <option value="2024">2024</option>
        <option value="2023">2023</option>
      </select>
      
      <LineChart 
        data={trends.map(t => ({
          month: t.month_name,
          total: t.total_borrowings,
          active: t.active,
          returned: t.returned
        }))}
      />
    </div>
  );
};
```

---

### 8. Overdue Books Report

Daftar buku yang terlambat dikembalikan.

**Endpoint:** `GET /library/reports/overdue-books`

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `per_page` | number | 15 | Items per page |
| `page` | number | 1 | Current page |

**Response:**
```json
{
  "success": true,
  "message": "Overdue books report generated successfully",
  "data": [
    {
      "transaction_id": 123,
      "transaction_code": "BRW20241201001",
      "borrower": {
        "name": "John Doe",
        "number": "STD2024001",
        "email": "john.doe@school.com"
      },
      "borrow_date": "2024-11-20 10:30:00",
      "due_date": "2024-11-27 10:30:00",
      "days_overdue": 17,
      "books": [
        {
          "title": "Clean Code",
          "isbn": "9780132350884",
          "code": "CS-005-001"
        }
      ]
    }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 2,
    "per_page": 15,
    "total": 20
  }
}
```

**Frontend Example:**
```typescript
const OverdueTable = () => {
  const [overdueList, setOverdueList] = useState([]);
  
  useEffect(() => {
    apiClient.get('/library/reports/overdue-books')
      .then(res => setOverdueList(res.data.data));
  }, []);
  
  return (
    <table>
      <thead>
        <tr>
          <th>Borrower</th>
          <th>Books</th>
          <th>Due Date</th>
          <th>Days Overdue</th>
        </tr>
      </thead>
      <tbody>
        {overdueList.map(item => (
          <tr key={item.transaction_id}>
            <td>
              <div>{item.borrower.name}</div>
              <small>{item.borrower.number}</small>
            </td>
            <td>
              {item.books.map(book => (
                <div key={book.code}>{book.title}</div>
              ))}
            </td>
            <td>{new Date(item.due_date).toLocaleDateString()}</td>
            <td>
              <Badge color="red">{item.days_overdue} days</Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

---

### 9. Student Borrowing History

Riwayat peminjaman lengkap untuk siswa tertentu.

**Endpoint:** `GET /library/reports/student/{userId}/history`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | number | Yes (URL) | Student user ID |
| `per_page` | number | No | Items per page |
| `page` | number | No | Current page |

**Request Example:**
```typescript
GET /library/reports/student/5/history?page=1&per_page=10
```

**Response:**
```json
{
  "success": true,
  "message": "Student borrowing history retrieved successfully",
  "data": {
    "student": {
      "id": 5,
      "name": "John Doe",
      "email": "john.doe@school.com",
      "user_number": "STD2024001"
    },
    "history": [
      {
        "transaction_id": 123,
        "transaction_code": "BRW20241201001",
        "borrow_date": "2024-12-01 10:30:00",
        "due_date": "2024-12-08 10:30:00",
        "return_date": null,
        "status": "borrowed",
        "books": [
          {
            "title": "Clean Code",
            "author": "Robert C. Martin",
            "isbn": "9780132350884",
            "item_code": "CS-005-001",
            "category": "Computer Science"
          }
        ]
      }
    ]
  },
  "pagination": {
    "current_page": 1,
    "per_page": 10,
    "total": 12,
    "last_page": 2
  }
}
```

**Error Response (User Not Found):**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## 🆕 Enhancement: Multi-Condition Book Filter

### Updated Book Items Endpoint

**Endpoint:** `GET /api/book-items`

**New Feature:** Support untuk multiple condition filters menggunakan comma-separated values.

**Valid Conditions:** `good`, `fair`, `poor`

**Request Example:**
```typescript
// Single condition (backward compatible)
GET /api/book-items?condition=poor

// Multiple conditions (NEW)
GET /api/book-items?condition=fair,poor
```

**Frontend Example:**
```typescript
// Service
const getPoorConditionBooks = async (): Promise<BookItem[]> => {
  // Backend now handles multiple conditions!
  // Get books in poor condition (you can also add 'fair' if needed)
  const response = await apiClient.get('/book-items?condition=poor');
  return response.data;
};

// Component
const PoorConditionBooksReport = () => {
  const [poorBooks, setPoorBooks] = useState([]);
  
  useEffect(() => {
    getPoorConditionBooks().then(setPoorBooks);
  }, []);
  
  return (
    <div>
      <h3>📋 Poor Condition Books Report</h3>
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Book Title</th>
            <th>Condition</th>
          </tr>
        </thead>
        <tbody>
          {poorBooks.map(item => (
            <tr key={item.id}>
              <td>{item.code}</td>
              <td>{item.master.title}</td>
              <td>
                <Badge color={item.condition === 'poor' ? 'red' : 'orange'}>
                  {item.condition}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

**Benefits:**
- ✅ No more client-side filtering
- ✅ Reduced data transfer
- ✅ Better performance
- ✅ Backward compatible (single value still works)

---

## TypeScript Integration

### API Client Setup

```typescript
// lib/api-client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auto-attach token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### Type Definitions

```typescript
// types/library-reports.ts

export interface OverviewData {
  total_book_titles: number;
  total_book_items: number;
  total_categories: number;
  total_borrowed: number;
  total_overdue: number;
}

export interface CategoryDistribution {
  category_name: string;
  total_book_titles: number;
  total_book_items: number;
}

export interface BookItemDetail {
  item_id: number;
  code: string;
  condition: 'good' | 'fair' | 'poor';
  status: 'available' | 'borrowed' | 'lost';
  is_borrowed: boolean;
  is_available: boolean;
  is_lost: boolean;
  created_at: string;
}

export interface BookInventory {
  book_id: number;
  title: string;
  author: string;
  publisher: string;
  year: string;
  isbn: string;
  category: string;
  total_items: number;
  borrowed_count: number;
  available_count: number;
  lost_count: number;
  availability_percentage: number;
  items: BookItemDetail[];
}

export interface InDemandBook {
  book_id: number;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  category: string;
  total_items: number;
  currently_borrowed: number;
  currently_available: number;
  demand_percentage: number;
}

export interface PopularBook {
  id: number;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  category: string;
  total_borrowed: number;
}

export interface StudentActivity {
  id: number;
  name: string;
  email: string;
  user_number: string;
  total_borrowings: number;
  active_borrowings: number;
  returned_count: number;
}

export interface MonthlyTrend {
  month: number;
  month_name: string;
  total_borrowings: number;
  active: number;
  returned: number;
}

export interface OverdueBook {
  transaction_id: number;
  transaction_code: string;
  borrower: {
    name: string;
    number: string;
    email: string;
  };
  borrow_date: string;
  due_date: string;
  days_overdue: number;
  books: Array<{
    title: string;
    isbn: string;
    code: string;
  }>;
}

export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
```

### Service Layer

```typescript
// services/library-report.service.ts
import apiClient from '@/lib/api-client';
import type {
  OverviewData,
  CategoryDistribution,
  BookInventory,
  InDemandBook,
  PopularBook,
  StudentActivity,
  MonthlyTrend,
  OverdueBook,
  Pagination
} from '@/types/library-reports';

export const libraryReportService = {
  getOverview: async (): Promise<OverviewData> => {
    const response = await apiClient.get('/library/reports/overview');
    return response.data.data;
  },

  getCategoryDistribution: async (): Promise<CategoryDistribution[]> => {
    const response = await apiClient.get('/library/reports/categories');
    return response.data.data;
  },

  getInventory: async (page = 1, perPage = 15) => {
    const response = await apiClient.get(
      `/library/reports/inventory?page=${page}&per_page=${perPage}`
    );
    return {
      data: response.data.data as BookInventory[],
      pagination: response.data.pagination as Pagination
    };
  },

  getInDemandBooks: async (limit = 10): Promise<InDemandBook[]> => {
    const response = await apiClient.get(`/library/reports/in-demand?limit=${limit}`);
    return response.data.data;
  },

  getPopularBooks: async (limit = 10): Promise<PopularBook[]> => {
    const response = await apiClient.get(`/library/reports/popular-books?limit=${limit}`);
    return response.data.data;
  },

  getStudentActivity: async (userId?: number, page = 1, perPage = 15) => {
    const params = userId 
      ? `user_id=${userId}` 
      : `page=${page}&per_page=${perPage}`;
    
    const response = await apiClient.get(`/library/reports/student-activity?${params}`);
    return {
      data: response.data.data as StudentActivity[],
      pagination: response.data.pagination as Pagination | undefined
    };
  },

  getBorrowingTrends: async (year?: number) => {
    const currentYear = year || new Date().getFullYear();
    const response = await apiClient.get(`/library/reports/trends?year=${currentYear}`);
    return {
      year: response.data.data.year,
      trends: response.data.data.monthly_trends as MonthlyTrend[]
    };
  },

  getOverdueBooks: async (page = 1, perPage = 15) => {
    const response = await apiClient.get(
      `/library/reports/overdue-books?page=${page}&per_page=${perPage}`
    );
    return {
      data: response.data.data as OverdueBook[],
      pagination: response.data.pagination as Pagination
    };
  },

  getStudentHistory: async (userId: number, page = 1, perPage = 20) => {
    const response = await apiClient.get(
      `/library/reports/student/${userId}/history?page=${page}&per_page=${perPage}`
    );
    return response.data.data;
  }
};
```

---

## React Hooks Examples

### Custom Hook for Reports

```typescript
// hooks/useLibraryReports.ts
import { useState, useEffect } from 'react';
import { libraryReportService } from '@/services/library-report.service';

export const useOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    libraryReportService.getOverview()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
};

export const useInventory = (page = 1, perPage = 15) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    libraryReportService.getInventory(page, perPage)
      .then(res => {
        setData(res.data);
        setPagination(res.pagination);
      })
      .finally(() => setLoading(false));
  }, [page, perPage]);

  return { data, pagination, loading };
};
```

### Usage in Component

```typescript
// components/DashboardOverview.tsx
import { useOverview } from '@/hooks/useLibraryReports';

const DashboardOverview = () => {
  const { data, loading, error } = useOverview();

  if (loading) return <Spinner />;
  if (error) return <ErrorAlert message={error.message} />;

  return (
    <div className="grid grid-cols-5 gap-4">
      <StatCard 
        title="Book Titles" 
        value={data.total_book_titles}
        icon="📚"
      />
      <StatCard 
        title="Physical Copies" 
        value={data.total_book_items}
        icon="📖"
      />
      <StatCard 
        title="Categories" 
        value={data.total_categories}
        icon="🏷️"
      />
      <StatCard 
        title="Borrowed" 
        value={data.total_borrowed}
        icon="📤"
        color="blue"
      />
      <StatCard 
        title="Overdue" 
        value={data.total_overdue}
        icon="⚠️"
        color="red"
      />
    </div>
  );
};
```

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "message": "Error description here"
}
```

### Common HTTP Status Codes

| Code | Meaning | Cause |
|------|---------|-------|
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | User doesn't have required role |
| 404 | Not Found | Invalid user ID or resource not found |
| 500 | Server Error | Database error or unexpected issue |

### Error Handling Example

```typescript
const fetchWithErrorHandling = async () => {
  try {
    const data = await libraryReportService.getOverview();
    return data;
  } catch (error) {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Redirect to login
          router.push('/login');
          break;
        case 403:
          toast.error('You do not have permission to access this report');
          break;
        case 404:
          toast.error('Resource not found');
          break;
        default:
          toast.error('An error occurred. Please try again.');
      }
    }
    throw error;
  }
};
```

---

## Testing Guide

### Manual Testing Checklist

#### 1. Authentication
- [ ] Login dengan admin account
- [ ] Verify token tersimpan di localStorage
- [ ] Test endpoint dengan valid token
- [ ] Test endpoint tanpa token (should return 401)

#### 2. Overview Report
- [ ] GET `/library/reports/overview`
- [ ] Verify data structure matches documentation
- [ ] Check all counts are numbers

#### 3. Category Distribution
- [ ] GET `/library/reports/categories`
- [ ] Verify data diurutkan by total_book_titles descending
- [ ] Check category names are strings

#### 4. Inventory Report
- [ ] Test with default pagination
- [ ] Test with custom per_page
- [ ] Verify nested items array
- [ ] Check availability_percentage calculation

#### 5. In-Demand vs Popular
- [ ] Compare results from both endpoints
- [ ] Verify in-demand shows current snapshot
- [ ] Verify popular shows historical data

#### 6. Student Activity
- [ ] Test without user_id (should paginate)
- [ ] Test with specific user_id
- [ ] Verify only students with borrowings are shown

#### 7. Borrowing Trends
- [ ] Test with current year
- [ ] Test with previous year
- [ ] Verify monthly_trends is sorted by month

#### 8. Overdue Books
- [ ] Verify only overdue transactions are shown
- [ ] Check days_overdue calculation
- [ ] Test pagination

#### 9. Student History
- [ ] Test with valid user ID
- [ ] Test with invalid user ID (should return 404)
- [ ] Verify transactions sorted by date descending

#### 10. Multi-Condition Filter
- [ ] Test `?condition=poor`
- [ ] Test `?condition=fair`
- [ ] Test `?condition=good`
- [ ] Test `?condition=fair,poor` (multiple)
- [ ] Verify no client-side filtering needed
- [ ] Confirm only valid conditions: good, fair, poor

---

## 🎯 Quick Start Example

```typescript
// App.tsx - Complete Example
import { useState, useEffect } from 'react';
import { libraryReportService } from './services/library-report.service';

function LibraryDashboard() {
  const [overview, setOverview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [inDemand, setInDemand] = useState([]);

  useEffect(() => {
    // Fetch multiple reports in parallel
    Promise.all([
      libraryReportService.getOverview(),
      libraryReportService.getCategoryDistribution(),
      libraryReportService.getInDemandBooks(5)
    ]).then(([overviewData, categoriesData, inDemandData]) => {
      setOverview(overviewData);
      setCategories(categoriesData);
      setInDemand(inDemandData);
    });
  }, []);

  return (
    <div className="dashboard">
      {/* Overview Cards */}
      <section className="overview-section">
        <h2>Library Overview</h2>
        {overview && (
          <div className="stats-grid">
            <StatCard title="Titles" value={overview.total_book_titles} />
            <StatCard title="Items" value={overview.total_book_items} />
            <StatCard title="Borrowed" value={overview.total_borrowed} />
            <StatCard title="Overdue" value={overview.total_overdue} />
          </div>
        )}
      </section>

      {/* Category Chart */}
      <section className="category-section">
        <h2>Books by Category</h2>
        <BarChart data={categories} />
      </section>

      {/* Hot Books */}
      <section className="in-demand-section">
        <h2>📈 Hot Books Right Now</h2>
        <BookList books={inDemand} />
      </section>
    </div>
  );
}
```

---

## 📞 Support

Untuk pertanyaan atau issue terkait implementasi:
1. Check file: `LibraryReportController.php`
2. Check routes: `routes/api.php`
3. Review dokumentasi konsolidasi: `library_reports_consolidated.md`

---

**Last Updated:** 2024-12-14  
**Version:** 1.0  
**Backend:** Laravel 10 + PHP 8.1+  
**Frontend:** TypeScript + React (recommended)
