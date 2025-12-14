# Library Reports API - Complete Documentation

> **📚 Dokumentasi Lengkap API untuk Library Reports System**  
> Base URL: `/api/library/reports`  
> Authentication: Required (JWT Bearer Token)  
> Roles: `admin` atau `librarian`

---

## 📋 Daftar Isi

1. [Overview Sistem](#overview-sistem)
2. [Authentication](#authentication)
3. [Report Endpoints](#report-endpoints)
   - [Overview Report](#1-overview-report)
   - [Category Distribution Report](#2-category-distribution-report)
   - [Book Inventory Report](#3-book-inventory-report)
   - [In-Demand Books Report](#4-in-demand-books-report)
   - [Popular Books Report](#5-popular-books-report)
   - [Student Activity Report](#6-student-activity-report)
   - [Borrowing Trends Report](#7-borrowing-trends-report)
   - [Student Borrowing History](#8-student-borrowing-history)
   - [Book Report - Damaged Books](#9-book-report---damaged-books)
4. [Frontend Integration Examples](#frontend-integration-examples)
5. [Testing Guide](#testing-guide)
6. [Implementation Status](#implementation-status)
7. [Troubleshooting](#troubleshooting)

---

## Overview Sistem

Library Reports adalah sistem pelaporan untuk perpustakaan sekolah yang menyediakan 8+ endpoint read-only untuk mendapatkan berbagai statistik dan laporan.

### Available Reports

| Report Type | Kegunaan | Data Source |
|-------------|----------|-------------|
| **Overview** | Statistik dasar perpustakaan | Book Masters, Book Items, Categories |
| **Category Distribution** | Distribusi buku per kategori | Books + Categories |
| **Book Inventory** | Detail inventori buku dengan status | Book Items + Status + Condition |
| **In-Demand Books** | Buku yang sedang banyak dipinjam | Current borrowing snapshot |
| **Popular Books** | Buku paling sering dipinjam (historis) | Borrow transaction history |
| **Student Activity** | Statistik aktivitas peminjaman siswa | Users + Borrow transactions |
| **Borrowing Trends** | Tren peminjaman per bulan | Borrow transactions by month |
| **Student History** | Riwayat peminjaman siswa tertentu | Detailed user transactions |
| **Damaged Books** | Buku dalam kondisi rusak | Book Items dengan condition filter |

### Base URL

```
http://127.0.0.1:8000/api
```

---

## Authentication

### Required Headers

**Semua endpoint memerlukan:**

```http
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Required Roles

- `admin` atau `librarian`

### Login Endpoint

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@example.com"
  }
}
```

### Frontend Integration Example

```typescript
// auth.service.ts
const login = async (email: string, password: string) => {
  const response = await apiClient.post('/auth/login', { email, password });
  localStorage.setItem('token', response.data.access_token);
  return response.data;
};

// api-client.ts
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## Report Endpoints

## 1. Overview Report

### Current Implementation

**Endpoint:** `GET /library/reports/overview`

**Usage:** Digunakan untuk dashboard widget yang menampilkan statistik cepat perpustakaan

**Request Parameters:** None

### Expected Response Format

```json
{
  "success": true,
  "message": "Library overview retrieved successfully",
  "data": {
    "total_book_titles": 50,
    "total_book_items": 150,
    "total_categories": 10
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `total_book_titles` | integer | Jumlah unique book titles (book_masters) |
| `total_book_items` | integer | Jumlah physical copies (book_items) |
| `total_categories` | integer | Jumlah kategori buku |

### Frontend Integration

```typescript
// library-report.service.ts
const getOverview = async () => {
  const response = await apiClient.get('/library/reports/overview');
  return {
    bookTitles: response.data.data.total_book_titles,
    bookItems: response.data.data.total_book_items,
    categories: response.data.data.total_categories
  };
};

// LibraryDashboard.tsx
const [stats, setStats] = useState({
  bookTitles: 0,
  bookItems: 0,
  categories: 0
});

useEffect(() => {
  const fetchStats = async () => {
    const data = await libraryReportService.getOverview();
    setStats(data);
  };
  fetchStats();
}, []);
```

### Use Cases

- Dashboard statistics widget
- Quick library health check
- Admin homepage summary

---

## 2. Category Distribution Report

### Current Implementation

**Endpoint:** `GET /library/reports/categories`

**Usage:** Menampilkan distribusi buku berdasarkan kategori untuk analisis koleksi

**Request Parameters:** None

### Expected Response Format

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

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `category_name` | string | Nama kategori |
| `total_book_titles` | integer | Jumlah unique book titles dalam kategori |
| `total_book_items` | integer | Jumlah physical copies dalam kategori |

**Note:** Data diurutkan dari yang paling banyak book titles

### Frontend Integration

```typescript
// CategoryReport.tsx
const [categories, setCategories] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    const response = await api.get('/library/reports/categories');
    setCategories(response.data.data);
  };
  fetchData();
}, []);

// Render chart
<BarChart data={categories.map(cat => ({
  name: cat.category_name,
  titles: cat.total_book_titles,
  items: cat.total_book_items
}))} />
```

### Use Cases

- Category distribution charts (pie/bar chart)
- Collection analysis
- Purchase planning by category

---

## 3. Book Inventory Report

### Current Implementation

**Endpoint:** `GET /library/reports/inventory`

**Usage:** Detail inventori lengkap setiap buku termasuk condition dan status setiap item

**Request Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `per_page` | integer | No | 15 | Items per page |
| `page` | integer | No | 1 | Current page |

**Request Example:**
```
GET /library/reports/inventory?per_page=10&page=1
```

### Expected Response Format

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
          "condition": "Good",
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

### Response Fields

**Book Level:**
| Field | Type | Description |
|-------|------|-------------|
| `book_id` | integer | Book master ID |
| `title` | string | Book title |
| `author` | string | Book author |
| `publisher` | string | Publisher name |
| `year` | string | Publication year |
| `isbn` | string | ISBN code |
| `category` | string | Category name |
| `total_items` | integer | Total physical copies |
| `borrowed_count` | integer | Currently borrowed items |
| `available_count` | integer | Currently available items |
| `lost_count` | integer | Lost items |
| `availability_percentage` | float | (available / total) * 100 |

**Item Level (nested in `items`):**
| Field | Type | Description |
|-------|------|-------------|
| `item_id` | integer | Book item ID |
| `code` | string | Unique item code |
| `condition` | string | Good / Fair / Poor / Damaged |
| `status` | string | available / borrowed / lost |
| `is_borrowed` | boolean | Quick check if borrowed |
| `is_available` | boolean | Quick check if available |
| `is_lost` | boolean | Quick check if lost |
| `created_at` | timestamp | Item creation date |

### Use Cases

- Full inventory management page
- Book availability checking
- Item condition tracking
- Stock level monitoring

---

## 4. In-Demand Books Report

### Current Implementation

**Endpoint:** `GET /library/reports/in-demand`

**Usage:** Menampilkan buku yang sedang dalam permintaan tinggi (banyak dipinjam saat ini)

**Request Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | 10 | Number of top books |

**Request Example:**
```
GET /library/reports/in-demand?limit=5
```

### Expected Response Format

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

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `book_id` | integer | Book master ID |
| `title` | string | Book title |
| `author` | string | Book author |
| `publisher` | string | Publisher name |
| `isbn` | string | ISBN code |
| `category` | string | Category name |
| `total_items` | integer | Total physical copies |
| `currently_borrowed` | integer | Saat ini sedang dipinjam |
| `currently_available` | integer | Saat ini tersedia |
| `demand_percentage` | float | (borrowed / total) * 100 |

**Note:** 
- Data diurutkan dari `currently_borrowed` terbanyak
- Hanya menampilkan buku yang minimal ada 1 item dipinjam

### Use Cases

- "Hot books" dashboard widget
- Real-time demand monitoring
- Purchase recommendations (books with high demand but low stock)
- Homepage featured books section

---

## 5. Popular Books Report

### Current Implementation

**Endpoint:** `GET /library/reports/popular-books`

**Usage:** Buku paling populer berdasarkan total histori peminjaman (all time)

**Request Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | 10 | Number of top books |

**Request Example:**
```
GET /library/reports/popular-books?limit=10
```

### Expected Response Format

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

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Book master ID |
| `title` | string | Book title |
| `author` | string | Book author |
| `publisher` | string | Publisher name |
| `isbn` | string | ISBN code |
| `category` | string | Category name |
| `total_borrowed` | integer | Total kali dipinjam (historis) |

**Note:** 
- Data diurutkan dari `total_borrowed` terbesar
- Berdasarkan **historis lengkap**, bukan snapshot saat ini

### Difference: In-Demand vs Popular

| Aspect | In-Demand | Popular |
|--------|-----------|---------|
| **Data Source** | Current borrowing status | Historical borrow transactions |
| **Metric** | Currently borrowed items | Total times borrowed (all time) |
| **Use Case** | What's hot right now | Best sellers of all time |
| **Example** | "6 out of 8 copies borrowed today" | "Borrowed 45 times in history" |

### Use Cases

- "Best sellers" or "Most popular" section
- Historical popularity analysis
- Collection development insights
- Marketing material (promote popular books)

---

## 6. Student Activity Report

### Current Implementation

**Endpoint:** `GET /library/reports/student-activity`

**Usage:** Statistik aktivitas peminjaman siswa (bisa semua siswa atau specific user)

**Request Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `user_id` | integer | No | - | Filter specific user |
| `per_page` | integer | No | 15 | Items per page (without user_id) |
| `page` | integer | No | 1 | Current page (without user_id) |

**Request Examples:**

```
# All active students (paginated)
GET /library/reports/student-activity?per_page=20&page=1

# Specific student
GET /library/reports/student-activity?user_id=5
```

### Expected Response Format

**All Students:**
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

**Specific Student:**
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
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | User ID |
| `name` | string | Student name |
| `email` | string | Student email |
| `user_number` | string | Student number (NIS) |
| `total_borrowings` | integer | Total transactions (all time) |
| `active_borrowings` | integer | Currently borrowed (status=borrowed) |
| `returned_count` | integer | Completed returns |

**Note:**
- Tanpa `user_id`: Returns paginated list of **students with at least one borrowing**
- Dengan `user_id`: Returns **single student** data (no pagination)

### Use Cases

- Member activity dashboard
- Top borrowers leaderboard
- Student engagement tracking
- User profile activity summary

---

## 7. Borrowing Trends Report

### Current Implementation

**Endpoint:** `GET /library/reports/trends`

**Usage:** Tren peminjaman per bulan untuk analisis pola musiman

**Request Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `year` | integer | No | Current year | Year for analysis |

**Request Example:**
```
GET /library/reports/trends?year=2024
```

### Expected Response Format

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

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `year` | integer | Year being analyzed |
| `monthly_trends` | array | Monthly data |
| `month` | integer | Month number (1-12) |
| `month_name` | string | Month name in English |
| `total_borrowings` | integer | Total transactions that month |
| `active` | integer | Still borrowed (not returned) |
| `returned` | integer | Already returned |

**Note:**
- Data diurutkan by month (January to December)
- Hanya menampilkan bulan yang ada data transaksi
- `active + returned = total_borrowings`

### Use Cases

- Dashboard: Line chart showing borrowing trends over time
- Analytics: Identify peak borrowing months
- Planning: Resource allocation based on seasonal trends
- Reports: Monthly/yearly summary for management

### Chart.js Example

```javascript
const chartData = {
    labels: data.data.monthly_trends.map((t) => t.month_name),
    datasets: [
        {
            label: "Total Borrowings",
            data: data.data.monthly_trends.map((t) => t.total_borrowings),
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
        },
    ],
};
```

---

## 8. Student Borrowing History

### Current Implementation

**Endpoint:** `GET /library/reports/student/{userId}/history`

**Usage:** Menampilkan riwayat peminjaman lengkap seorang siswa

**URL Parameters:**

| Parameter | Type | Description |
| --------- | ------------- | ----------------------------------------- |
| `userId`  | string (UUID) | **Required** - ID user yang ingin dilihat |

**Query Parameters:**

| Parameter  | Type    | Default | Description    |
| ---------- | ------- | ------- | -------------- |
| `per_page` | integer | 20      | Items per page |
| `page`     | integer | 1       | Halaman        |

**Request Example:**

```
GET /library/reports/student/{userId}/history?page=1&per_page=20
```

### Expected Response Format

```json
{
  "success": true,
  "message": "Student borrowing history retrieved successfully",
  "data": {
    "student": {
      "id": "uuid-1",
      "name": "John Doe",
      "email": "john@example.com",
      "user_number": "STD001"
    },
    "history": [
      {
        "transaction_id": "uuid-trans-1",
        "transaction_code": "BRW-20241213001",
        "borrow_date": "2024-12-01",
        "due_date": "2024-12-15",
        "return_date": "2024-12-14",
        "status": "returned",
        "books": [
          {
            "title": "Clean Code",
            "author": "Robert C. Martin",
            "isbn": "978-0132350884",
            "item_code": "BK-001-01",
            "category": "Programming"
          }
        ]
      }
    ]
  },
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total": 15,
    "last_page": 1
  }
}
```

### Response Fields

**Student Object**
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID user |
| `name` | string | Nama lengkap |
| `email` | string | Email |
| `user_number` | string | Nomor induk |

**History Item**
| Field | Type | Description |
|-------|------|-------------|
| `transaction_id` | string | UUID transaksi |
| `transaction_code` | string | Kode transaksi |
| `borrow_date` | string (date) | Tanggal pinjam |
| `due_date` | string (date) | Tanggal jatuh tempo |
| `return_date` | string/null | Tanggal kembali (null jika belum) |
| `status` | string | `borrowed` atau `returned` |
| `books` | array | Daftar buku yang dipinjam |

**Book Object (in books array)**
| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Judul buku |
| `author` | string | Pengarang |
| `isbn` | string | ISBN |
| `item_code` | string | Kode item fisik |
| `category` | string | Kategori |

### Use Cases

- Student Profile Page: Complete borrowing history
- Librarian View: Check student's borrowing patterns
- Student Analytics: Individual reading statistics
- Search & Filter: Find specific transactions

---

## 9. Book Report - Damaged Books

### Overview

Endpoint untuk menampilkan buku-buku dalam kondisi rusak (poor atau damaged).

### Backend Enhancement Required

**Endpoint:** `GET /api/book-items`

**Current Issue:**
- Frontend harus fetch semua buku dengan condition "damaged"
- Kemudian filter lagi di client untuk include "poor"
- Tidak efisien karena data transfer yang tidak perlu

**Requested Enhancement:**
Support multiple condition filters dalam satu request

### Request Format Options

**Option A - Comma-separated values (Recommended):**
```
GET /api/book-items?condition=poor,damaged
```

**Option B - Multiple query parameters:**
```
GET /api/book-items?condition=poor&condition=damaged
```

**Option C - Array notation:**
```
GET /api/book-items?condition[]=poor&condition[]=damaged
```

### Expected Response Format

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid-123",
      "book_master_id": "uuid-456",
      "code": "BK-001-01",
      "condition": "poor",
      "status": "available",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "uuid-789",
      "book_master_id": "uuid-012",
      "code": "BK-002-03",
      "condition": "damaged",
      "status": "available",
      "createdAt": "2024-02-20T14:45:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 100,
    "total": 2,
    "last_page": 1,
    "timestamp": "2024-12-13T15:30:00Z"
  }
}
```

### Filter Logic Requirements

**Include:**
- Books with `condition = 'poor'`
- Books with `condition = 'damaged'`

**Exclude:**
- Books with `condition = 'good'`
- Books with `condition = 'fair'`
- Any other condition values

**SQL Example (for reference):**
```sql
SELECT * FROM book_items 
WHERE condition IN ('poor', 'damaged')
ORDER BY createdAt DESC;
```

### Condition Values Reference

Berdasarkan type definition frontend, nilai condition yang valid:

```typescript
type BookCondition = 'good' | 'fair' | 'poor' | 'damaged';
```

**Color Coding di Frontend:**
- `good` → 🟢 Green badge
- `fair` → 🟡 Yellow badge  
- `poor` → 🟠 Orange badge
- `damaged` → 🔴 Red badge

**Business Logic:**
- **Damaged Books List** = Books with condition "poor" OR "damaged"
- **Normal Books** = Books with condition "good" OR "fair"

### Frontend Integration (After Backend Implementation)

**Service (book.service.ts):**
```typescript
getDamagedBooks: async (): Promise<BookItem[]> => {
    try {
        // Backend now supports multiple conditions
        const response = await apiClient.get<PaginatedResponse<any>>(
            '/book-items?condition=poor,damaged'
        );
        
        return response.data.map(item => ({
            id: item.id,
            masterId: item.book_master_id,
            code: item.code,
            condition: item.condition,
            status: item.status,
            createdAt: new Date(item.createdAt)
        }));
    } catch (error) {
        console.error('Failed to fetch damaged books:', error);
        return [];
    }
}
```

**Component (BookReport.tsx):**
```typescript
const fetchDamagedBooks = async () => {
    const damaged = await api.getDamagedBooks();
    // No more client-side filtering needed!
    // Backend returns only poor and damaged books
    
    const startIndex = (damagedBooksPage - 1) * damagedBooksPerPage;
    const endIndex = startIndex + damagedBooksPerPage;
    setDamagedBooks(damaged.slice(startIndex, endIndex));
    setTotalDamagedBooks(damaged.length);
};
```

---

## Frontend Integration Examples

### React Component Example (TypeScript)

```typescript
import { useState, useEffect } from "react";
import axios from "axios";

interface PopularBook {
    id: string;
    title: string;
    author: string;
    category: string;
    total_borrowed: number;
}

interface ApiResponse {
    success: boolean;
    message: string;
    data: PopularBook[];
}

const PopularBooksWidget = () => {
    const [books, setBooks] = useState<PopularBook[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPopularBooks = async () => {
            try {
                const token = localStorage.getItem("auth_token");
                const response = await axios.get<ApiResponse>(
                    "/api/library/reports/popular-books",
                    {
                        params: { limit: 5 },
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (response.data.success) {
                    setBooks(response.data.data);
                }
            } catch (err) {
                setError("Failed to load popular books");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPopularBooks();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="popular-books">
            <h2>📚 Most Popular Books</h2>
            <ul>
                {books.map((book) => (
                    <li key={book.id}>
                        <strong>{book.title}</strong> by {book.author}
                        <span className="badge">
                            {book.total_borrowed} borrows
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};
```

### Vue 3 Composition API Example

```vue
<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";

interface StudentActivity {
    id: string;
    name: string;
    total_borrowings: number;
    active_borrowings: number;
    returned_count: number;
}

const students = ref<StudentActivity[]>([]);
const loading = ref(true);
const currentPage = ref(1);
const totalPages = ref(1);

const fetchStudentActivity = async (page: number = 1) => {
    try {
        loading.value = true;
        const token = localStorage.getItem("auth_token");
        const response = await axios.get(
            "/api/library/reports/student-activity",
            {
                params: { page, per_page: 10 },
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        students.value = response.data.data;
        totalPages.value = response.data.pagination.last_page;
        currentPage.value = response.data.pagination.current_page;
    } catch (error) {
        console.error("Error fetching student activity:", error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => fetchStudentActivity());
</script>

<template>
    <div class="student-activity">
        <h2>👥 Student Activity</h2>
        <table v-if="!loading">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Total</th>
                    <th>Active</th>
                    <th>Returned</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="student in students" :key="student.id">
                    <td>{{ student.name }}</td>
                    <td>{{ student.total_borrowings }}</td>
                    <td>{{ student.active_borrowings }}</td>
                    <td>{{ student.returned_count }}</td>
                </tr>
            </tbody>
        </table>

        <div class="pagination">
            <button
                @click="fetchStudentActivity(currentPage - 1)"
                :disabled="currentPage === 1"
            >
                Previous
            </button>
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            <button
                @click="fetchStudentActivity(currentPage + 1)"
                :disabled="currentPage === totalPages"
            >
                Next
            </button>
        </div>
    </div>
</template>
```

### Chart.js Integration (Borrowing Trends)

```javascript
import { Chart } from "chart.js/auto";

const createTrendsChart = async (year = new Date().getFullYear()) => {
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`/api/library/reports/trends?year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();

    const ctx = document.getElementById("trendsChart");
    new Chart(ctx, {
        type: "line",
        data: {
            labels: data.data.monthly_trends.map((t) => t.month_name),
            datasets: [
                {
                    label: "Total Borrowings",
                    data: data.data.monthly_trends.map(
                        (t) => t.total_borrowings
                    ),
                    borderColor: "rgb(75, 192, 192)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                },
                {
                    label: "Active",
                    data: data.data.monthly_trends.map((t) => t.active),
                    borderColor: "rgb(255, 159, 64)",
                    backgroundColor: "rgba(255, 159, 64, 0.2)",
                },
                {
                    label: "Returned",
                    data: data.data.monthly_trends.map((t) => t.returned),
                    borderColor: "rgb(54, 162, 235)",
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `Borrowing Trends ${year}`,
                },
            },
        },
    });
};
```

---

## Testing Guide

### Prerequisites

1. Server is running (`php artisan serve`)
2. You have a valid JWT token (from login)
3. User has `admin` or `librarian` role

### Step 1: Get Authentication Token

**Login Request:**

```http
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password"
}
```

**Expected Response:**

```json
{
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "bearer",
    "expires_in": 3600
}
```

**Copy the `access_token` - you'll need it for all subsequent requests!**

### Step 2: Test Each Endpoint

#### Test 1: Popular Books Report

```http
GET http://localhost:8000/api/library/reports/popular-books?limit=5
Authorization: Bearer YOUR_TOKEN_HERE
```

#### Test 2: Student Activity Report (All Students)

```http
GET http://localhost:8000/api/library/reports/student-activity?page=1&per_page=10
Authorization: Bearer YOUR_TOKEN_HERE
```

#### Test 3: Borrowing Trends

```http
GET http://localhost:8000/api/library/reports/trends?year=2024
Authorization: Bearer YOUR_TOKEN_HERE
```

#### Test 4: Student Borrowing History

```http
GET http://localhost:8000/api/library/reports/student/{userId}/history?page=1&per_page=20
Authorization: Bearer YOUR_TOKEN_HERE
```

### Testing with cURL

```bash
# 1. Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# 2. Popular Books (replace TOKEN)
curl -X GET "http://localhost:8000/api/library/reports/popular-books?limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Student Activity
curl -X GET "http://localhost:8000/api/library/reports/student-activity?page=1&per_page=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Borrowing Trends
curl -X GET "http://localhost:8000/api/library/reports/trends?year=2024" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Verification Checklist

- [ ] Server is running (`php artisan serve`)
- [ ] Successfully logged in and got token
- [ ] Popular Books endpoint returns data
- [ ] Student Activity (all) returns paginated list
- [ ] Student Activity (specific) returns single student
- [ ] Borrowing Trends returns monthly data
- [ ] Student History returns transaction history
- [ ] All responses have `success: true`
- [ ] Pagination works correctly
- [ ] Error handling works (try with invalid token)

---

## Implementation Status

### Phase 1: Ready to Implement (✅ Completed)

1. ✅ Popular Books Report
2. ✅ Student Activity Report
3. ✅ Borrowing Trends Report
4. ✅ Student Borrowing History Report

**Status:** All transaction-based reports are implemented and ready for frontend integration.

### Phase 2: Inventory Reports (✅ Implemented)

1. ✅ Overview Report
2. ✅ Category Distribution Report
3. ✅ Book Inventory Report
4. ✅ In-Demand Books Report

### Phase 3: Enhancements (⚠️ Pending)

1. ⚠️ Book Items - Multiple Condition Filter
   - **Status:** Backend enhancement required
   - **Impact:** Improves efficiency for damaged books report
   - **Required:** Support comma-separated condition values

### Required Model Relationships

Tambahkan relationship ini di `User` model jika belum ada:

```php
// app/Models/User.php

public function borrowTransactions()
{
    return $this->hasMany(BorrowTransaction::class, 'borrower_id');
}

public function adminBorrowTransactions()
{
    return $this->hasMany(BorrowTransaction::class, 'admin_id');
}

public function adminReturnTransactions()
{
    return $this->hasMany(ReturnTransaction::class, 'admin_id');
}
```

---

## Troubleshooting

### Error: "Unauthenticated"

- ✅ Check token is included in Authorization header
- ✅ Token format: `Bearer YOUR_TOKEN` (with space)
- ✅ Token hasn't expired (default: 60 minutes)

### Error: "This action is unauthorized"

- ✅ User must have `admin` or `librarian` role
- ✅ Check user roles in database

### Error: "User not found" (History endpoint)

- ✅ Check user UUID is valid
- ✅ User exists in database

### Empty Data Arrays

- ✅ Check if there's data in borrow_transactions table
- ✅ Run seeder if needed
- ✅ Verify table relationships

### Error Handling Example

```javascript
const fetchReport = async () => {
    try {
        const response = await axios.get("/api/library/reports/popular-books", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            // Server responded with error
            switch (error.response.status) {
                case 401:
                    // Redirect to login
                    window.location.href = "/login";
                    break;
                case 403:
                    alert("You do not have permission to view this report");
                    break;
                case 404:
                    alert("Resource not found");
                    break;
                case 500:
                    alert("Server error. Please try again later.");
                    break;
                default:
                    alert("An error occurred");
            }
        } else if (error.request) {
            // Request made but no response
            alert("Network error. Please check your connection.");
        } else {
            // Other errors
            console.error("Error:", error.message);
        }
    }
};
```

---

## Notes & Best Practices

1. **Caching**: Consider caching report data for better performance

    ```javascript
    // Example with React Query
    const { data } = useQuery("popular-books", fetchPopularBooks, {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
    });
    ```

2. **Loading States**: Always show loading indicators
3. **Error Boundaries**: Wrap components in error boundaries
4. **Pagination**: Handle pagination for large datasets
5. **Date Formatting**: Use libraries like `date-fns` or `dayjs` for consistent date display
6. **Debouncing**: Debounce search/filter inputs to reduce API calls

---

## Quick Start Checklist

- [ ] Get authentication working (login endpoint)
- [ ] Set up API client with Authorization interceptor
- [ ] Test Popular Books endpoint (simplest to start)
- [ ] Build dashboard with Overview stats
- [ ] Add Popular Books widget
- [ ] Implement Student Activity table with pagination
- [ ] Create Borrowing Trends chart
- [ ] Add Student Profile with History

---

## Summary Table

| Report                | Endpoint | Status | Documentation |
| --------------------- | -------- | ------ | ------------- |
| Overview | `/library/reports/overview` | ✅ Ready | Full |
| Category Distribution | `/library/reports/categories` | ✅ Ready | Full |
| Book Inventory | `/library/reports/inventory` | ✅ Ready | Full |
| In-Demand Books | `/library/reports/in-demand` | ✅ Ready | Full |
| Popular Books | `/library/reports/popular-books` | ✅ Ready | Full |
| Student Activity | `/library/reports/student-activity` | ✅ Ready | Full |
| Borrowing Trends | `/library/reports/trends` | ✅ Ready | Full |
| Student History | `/library/reports/student/{id}/history` | ✅ Ready | Full |
| Damaged Books Filter | `/book-items?condition=poor,damaged` | ⚠️ Enhancement | Requirements |

---

**Last Updated:** December 14, 2024  
**Status:** Ready for Frontend Integration  
**Base URL:** `http://127.0.0.1:8000/api`
