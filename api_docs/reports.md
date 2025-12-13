# Library Reports API - Frontend Implementation Guide

> **For Antigravity Agent**: This document is optimized for easy implementation on the frontend. All endpoints are production-ready and tested.

---

## 🔐 Authentication & Authorization

**All endpoints require:**
- **Authentication**: JWT Bearer token via `Authorization: Bearer <token>`  
- **Authorization**: User must have role `admin` or `librarian`

**Base URL**: `/api/library/reports`

---

## 📊 Available Endpoints (Phase 1.5)

| # | Endpoint | Method | Purpose | Auth Required |
|---|----------|--------|---------|---------------|
| 1 | `/overview` | GET | Get library statistics summary | ✅ admin\|librarian |
| 2 | `/categories` | GET | Get books grouped by category | ✅ admin\|librarian |
| 3 | `/inventory` | GET | Get paginated book inventory with status | ✅ admin\|librarian |
| 4 | `/in-demand` | GET | Get currently most borrowed books | ✅ admin\|librarian |

---

## 1️⃣ Overview Endpoint

### Request

```http
GET /api/library/reports/overview
Authorization: Bearer <your-jwt-token>
```

### Response

```json
{
  "success": true,
  "message": "Library overview retrieved successfully",
  "data": {
    "total_book_titles": 150,
    "total_book_items": 450,
    "total_categories": 12
  }
}
```

### TypeScript Types

```typescript
interface LibraryOverviewResponse {
  success: boolean;
  message: string;
  data: {
    total_book_titles: number;        // Unique book titles
    total_book_items: number;         // Total physical copies
    total_categories: number;         // Number of categories
  };
}
```

### Frontend Implementation Notes

- **Use for**: Dashboard cards, statistics widgets
- **Refresh frequency**: On page load, after CRUD operations
- **No parameters required**

---

## 2️⃣ Category Distribution Endpoint

### Request

```http
GET /api/library/reports/categories
Authorization: Bearer <your-jwt-token>
```

### Response

```json
{
  "success": true,
  "message": "Category distribution report generated successfully",
  "data": [
    {
      "category_name": "Programming",
      "total_book_titles": 45,
      "total_book_items": 120
    },
    {
      "category_name": "Science Fiction",
      "total_book_titles": 30,
      "total_book_items": 90
    }
  ]
}
```

### TypeScript Types

```typescript
interface CategoryDistribution {
  category_name: string;
  total_book_titles: number;       // Number of unique titles in this category
  total_book_items: number;        // Total physical copies in this category
}

interface CategoryDistributionResponse {
  success: boolean;
  message: string;
  data: CategoryDistribution[];
}
```

### Frontend Implementation Notes

- **Use for**: Pie charts, bar charts, category analytics dashboard
- **Sorting**: Already sorted by `total_book_titles` DESC
- **Chart libraries**: Perfect for Chart.js, Recharts, ApexCharts
- **Example chart data**:
  ```typescript
  const chartData = response.data.map(cat => ({
    name: cat.category_name,
    value: cat.total_book_items
  }));
  ```

---

## 3️⃣ Book Inventory Endpoint (Enhanced)

### Request

```http
GET /api/library/reports/inventory?per_page=15&page=1
Authorization: Bearer <your-jwt-token>
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `per_page` | number | 15 | Items per page (pagination) |
| `page` | number | 1 | Current page number |

### Response

```json
{
  "success": true,
  "message": "Book inventory report generated successfully",
  "data": [
    {
      "book_id": "uuid-123",
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "publisher": "Prentice Hall",
      "year": 2008,
      "isbn": "978-0132350884",
      "category": "Programming",
      "total_items": 5,
      "borrowed_count": 3,
      "available_count": 2,
      "lost_count": 0,
      "availability_percentage": 40.0,
      "items": [
        {
          "item_id": "uuid-item-1",
          "code": "BK-001-001",
          "condition": "good",
          "status": "borrowed",
          "is_borrowed": true,
          "is_available": false,
          "is_lost": false,
          "created_at": "2025-01-15T10:00:00.000000Z"
        },
        {
          "item_id": "uuid-item-2",
          "code": "BK-001-002",
          "condition": "excellent",
          "status": "available",
          "is_borrowed": false,
          "is_available": true,
          "is_lost": false,
          "created_at": "2025-01-15T10:00:00.000000Z"
        }
      ]
    }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 10,
    "per_page": 15,
    "total": 150
  }
}
```

### TypeScript Types

```typescript
interface BookItem {
  item_id: string;
  code: string;
  condition: string;                // "good" | "excellent" | "poor" | "Unknown"
  status: string;                   // "borrowed" | "available" | "lost" | "unknown"
  is_borrowed: boolean;             // Convenience flag
  is_available: boolean;            // Convenience flag
  is_lost: boolean;                 // Convenience flag
  created_at: string;               // ISO 8601 format
}

interface BookInventoryItem {
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
  items: BookItem[];
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface BookInventoryResponse {
  success: boolean;
  message: string;
  data: BookInventoryItem[];
  pagination: Pagination;
}
```

### Frontend Implementation Notes

- **Use for**: Inventory tables, book detail views, availability checking
- **Pagination**: Handled server-side, implement page controls
- **Status indicators**: Use `is_borrowed`, `is_available`, `is_lost` for UI badges
- **Availability visualization**: 
  - Use `availability_percentage` for progress bars
  - Green: > 50%, Yellow: 20-50%, Red: < 20%
- **Filter suggestions**: Add client-side filters by category, status
- **Example UI Badge**:
  ```typescript
  const StatusBadge = ({ item }: { item: BookItem }) => {
    if (item.is_borrowed) return <Badge color="red">Borrowed</Badge>;
    if (item.is_available) return <Badge color="green">Available</Badge>;
    if (item.is_lost) return <Badge color="gray">Lost</Badge>;
    return <Badge>Unknown</Badge>;
  };
  ```

---

## 4️⃣ In-Demand Books Endpoint

### Request

```http
GET /api/library/reports/in-demand?limit=10
Authorization: Bearer <your-jwt-token>
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 10 | Maximum number of books to return |

### Response

```json
{
  "success": true,
  "message": "In-demand books report generated successfully",
  "data": [
    {
      "book_id": "uuid-123",
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "publisher": "Prentice Hall",
      "isbn": "978-0132350884",
      "category": "Programming",
      "total_items": 5,
      "currently_borrowed": 4,
      "currently_available": 1,
      "demand_percentage": 80.0
    },
    {
      "book_id": "uuid-456",
      "title": "The Pragmatic Programmer",
      "author": "Andrew Hunt",
      "publisher": "Addison-Wesley",
      "isbn": "978-0201616224",
      "category": "Programming",
      "total_items": 3,
      "currently_borrowed": 3,
      "currently_available": 0,
      "demand_percentage": 100.0
    }
  ],
  "note": "This shows books with the most copies currently borrowed (snapshot)"
}
```

### TypeScript Types

```typescript
interface InDemandBook {
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

interface InDemandBooksResponse {
  success: boolean;
  message: string;
  data: InDemandBook[];
  note: string;
}
```

### Frontend Implementation Notes

- **Use for**: "Trending Books" widget, demand heatmaps, restocking alerts
- **Important**: This is a **current snapshot**, not historical popularity
- **Sorting**: Already sorted by `currently_borrowed` DESC
- **Only includes**: Books with at least 1 copy currently borrowed
- **Limit parameter**: Default 10, adjust based on UI space
- **Visual indicators**:
  - `demand_percentage >= 80%`: High demand (red/orange)
  - `demand_percentage >= 50%`: Medium demand (yellow)
  - `demand_percentage < 50%`: Normal demand (green)
- **Example widget**:
  ```typescript
  const TrendingBooks = ({ books }: { books: InDemandBook[] }) => (
    <div>
      <h3>📚 Currently In-Demand</h3>
      {books.map(book => (
        <div key={book.book_id}>
          <span>{book.title}</span>
          <ProgressBar value={book.demand_percentage} />
          <span>{book.currently_borrowed}/{book.total_items} borrowed</span>
        </div>
      ))}
    </div>
  );
  ```

---

## 🎨 UI/UX Recommendations

### Dashboard Layout Suggestions

```
┌─────────────────────────────┬─────────────────────────────┐
│  📊 Library Overview        │  📈 Category Distribution   │
│  (Endpoint 1)               │  (Endpoint 2 - Pie Chart)   │
│  - Total Titles: 150        │                             │
│  - Total Items: 450         │                             │
│  - Categories: 12           │                             │
└─────────────────────────────┴─────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│  🔥 Currently In-Demand Books (Endpoint 4)               │
│  1. Clean Code ████████████░░ 80% (4/5 borrowed)         │
│  2. The Pragmatic Programmer ██████████████ 100%         │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│  📚 Book Inventory (Endpoint 3 - Table with Pagination)  │
│  [Search] [Filter by Category ▼]                        │
│  ┌──────┬────────┬──────────┬────────────┬─────────┐    │
│  │Title │ Author │ Category │ Avail/Total│ Status  │    │
│  └──────┴────────┴──────────┴────────────┴─────────┘    │
│  [< Prev] Page 1 of 10 [Next >]                         │
└──────────────────────────────────────────────────────────┘
```

---

## 🔄 Error Handling

All endpoints follow the same error response format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Display data |
| 401 | Unauthorized | Redirect to login |
| 403 | Forbidden | Show "Access Denied" (wrong role) |
| 500 | Server Error | Show error message, retry option |

### Frontend Error Handling Example

```typescript
async function fetchLibraryReports() {
  try {
    const response = await api.get('/library/reports/overview', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // Redirect to login
      router.push('/login');
    } else if (error.response?.status === 403) {
      // Show access denied
      showToast('You do not have permission to view reports', 'error');
    } else {
      // Show generic error
      showToast(error.message || 'Failed to load reports', 'error');
    }
  }
}
```

---

## 📦 Sample React/TypeScript Implementation

```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

// Types (copy from sections above)
interface LibraryOverviewResponse {
  success: boolean;
  message: string;
  data: {
    total_book_titles: number;
    total_book_items: number;
    total_categories: number;
  };
}

// API Service
const libraryReportsAPI = {
  getOverview: () => 
    axios.get<LibraryOverviewResponse>('/api/library/reports/overview'),
  
  getCategories: () => 
    axios.get<CategoryDistributionResponse>('/api/library/reports/categories'),
  
  getInventory: (page = 1, perPage = 15) => 
    axios.get<BookInventoryResponse>('/api/library/reports/inventory', {
      params: { page, per_page: perPage }
    }),
  
  getInDemand: (limit = 10) => 
    axios.get<InDemandBooksResponse>('/api/library/reports/in-demand', {
      params: { limit }
    }),
};

// Component Example
export function LibraryDashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await libraryReportsAPI.getOverview();
        setOverview(response.data.data);
      } catch (error) {
        console.error('Failed to load overview:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard 
        title="Book Titles" 
        value={overview.total_book_titles} 
        icon="📚"
      />
      <StatCard 
        title="Physical Copies" 
        value={overview.total_book_items} 
        icon="📖"
      />
      <StatCard 
        title="Categories" 
        value={overview.total_categories} 
        icon="📂"
      />
    </div>
  );
}
```

---

## 🚀 Quick Start Checklist

- [ ] Set up axios/fetch with JWT interceptor
- [ ] Copy TypeScript types to your project
- [ ] Implement API service layer (libraryReportsAPI)
- [ ] Create dashboard layout components
- [ ] Add Chart.js/Recharts for category distribution
- [ ] Implement pagination for inventory table
- [ ] Add status badges and progress bars
- [ ] Test error handling (401, 403, 500)
- [ ] Add loading states
- [ ] Implement auto-refresh (optional)

---

## ❓ FAQ for Frontend Developers

**Q: Why is there no borrowing history or overdue books?**  
A: Phase 1.5 only includes current inventory tracking. Full transaction history (borrowing, returns, overdue) will come in Phase 2 when the backend transaction system is complete.

**Q: What's the difference between `/inventory` and `/in-demand`?**  
A: `/inventory` shows ALL books with pagination and detailed item status. `/in-demand` shows TOP books currently borrowed (no pagination, already filtered and sorted).

**Q: Can I filter or search the inventory?**  
A: Server-side filtering is not implemented yet. Use client-side filtering or request backend to add query parameters.

**Q: What does `availability_percentage` mean?**  
A: It's `(available_count / total_items) * 100`. Shows what percentage of copies are available right now.

**Q: Should I cache these responses?**  
A: Light caching (5-10 seconds) is fine for `/overview` and `/categories`. Don't cache `/inventory` and `/in-demand` as they show real-time status.

---

## 📞 Need Help?

If implementing with Antigravity agent:
1. Copy the relevant TypeScript types section
2. Specify which endpoint you want to integrate
3. Ask for component examples or chart implementations
4. Antigravity will generate code based on this spec

**Last Updated**: December 13, 2025  
**API Version**: 1.5.0 (Phase 1.5)  
**Backend Base**: Laravel 10 + JWT Auth
