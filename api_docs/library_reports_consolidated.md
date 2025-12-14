# Library Report System - Consolidated Documentation

> **Status Reference**: This document consolidates all requirements, API specifications, and implementation strategies for the Library Report System. It serves as the **Single Source of Truth** for both Frontend and Backend developers.

---

## 📚 1. System Overview

The **Library Report System** provides read-only analytics to track library usage, monitor inventory, and support decision-making. It consists of **8 Core Reports** consumed by the frontend dashboard.

### 📋 The 8 Core Reports

| # | Report Name | Description | Status |
|---|-------------|-------------|--------|
| 1 | **Popular Books** | Most borrowed books based on historical transaction data. | ✅ **READY** |
| 2 | **Student Activity** | Borrowing statistics per student (active, returned, total). | ✅ **READY** |
| 3 | **Borrowing Trends** | Monthly borrowing statistics (active vs returned) for the year. | ✅ **READY** |
| 4 | **Student History** | Detailed transaction history for a specific student. | ✅ **READY** |
| 5 | **Category Distribution** | Breakdown of books and copies by category. | ✅ **READY** (Requires JOIN) |
| 6 | **Overdue Books** | List of overdue books (requires logic adjustment). | ⚠️ **ADJUSTMENT** |
| 7 | **Library Overview** | Dashboard summary execution (total books, borrowed, etc.). | ⚠️ **ADJUSTMENT** |
| 8 | **Restocking** | Recommendations for book purchasing. | ❌ **REDESIGN NEEDED** |

---

## 🛠️ 2. Implementation Status & Strategies

This section details the **current reality** of the backend implementation capabilities based on existing resources (`BookMaster`, `BookItem`, `BorrowTransaction`).

### ✅ Ready to Implement (No Schema Changes)

#### 1. Popular Books Report
*   **Goal**: Show best performing books.
*   **Strategy**: Count `borrow_transaction_details` grouped by `book_master_id`.
*   **Query**:
    ```php
    BookMaster::withCount(['items as borrow_count' => function($q) {
        $q->join('borrow_transaction_details', 'book_items.id', '=', 'borrow_transaction_details.book_item_id');
    }])->orderByDesc('borrow_count')->limit($limit)->get();
    ```

#### 2. Student Activity Report
*   **Goal**: User leaderboard and tracking.
*   **Strategy**: Aggregate counts on `User` model relationships.
*   **Requirement**: Add `borrowTransactions()` relation to `User` model.

#### 3. Borrowing Trends
*   **Goal**: Monthly activity visualization.
*   **Strategy**: Group `BorrowTransaction` by `MONTH(borrow_date)`.

#### 4. Student Borrowing History
*   **Goal**: Individual user audit log.
*   **Strategy**: Standard pagination of `BorrowTransaction` filtered by `borrower_id`.

### ⚠️ Needs Adjustment (Workarounds Available)

#### 5. Category Distribution
*   **Issue**: Documentation assumed `category` string on Book; actual is `Category` relation.
*   **Adjustment**: Use JOIN logic.
    ```php
    Category::withCount(['bookMasters', 'bookItems'])->get();
    ```

#### 6. Overdue Books
*   **Issue**: Original spec required `fine_amount` which doesn't exist.
*   **Solution**: Implement without fines. Identify overdue by:
    ```php
    where('status', 'borrowed')->where('due_date', '<', now())
    ```

#### 7. Library Overview
*   **Issue**: "Total Returned" count ambiguous on single table.
*   **Solution**: Count distinct `ReturnTransaction` rows for returned stats, or check current `status` composition.

### ❌ Needs Redesign (Structural Mismatch)

#### 8. Restocking Recommendations
*   **Issue**: Spec relies on simple `quantity` vs `borrowed` count. Real system uses individual `BookItem` tracking.
*   **Path Forward**: Complex logic required.
    1.  Count total items per BookMaster.
    2.  Count "available" status items.
    3.  Count historical borrow rate.
    4.  Flag if `available < threshold` AND `borrow_rate > high`.

---

## 🔌 3. API Reference

**Base URL**: `http://127.0.0.1:8000/api`
**Auth**: `Authorization: Bearer <token>` (Admin/Librarian access)

### 3.1 Overview Report
*   **Endpoint**: `GET /library/reports/overview`
*   **Response**:
    ```json
    { "data": { "total_books": 150, "currently_borrowed": 25, "total_categories": 10 } }
    ```

### 3.2 Category Distribution
*   **Endpoint**: `GET /library/reports/categories`
*   **Response**: List of categories with `total_book_titles` and `total_book_items`.

### 3.3 Book Inventory
*   **Endpoint**: `GET /library/reports/inventory`
*   **Params**: `page`, `per_page`
*   **Response**: Detailed list of books with nested `items` array showing condition/status.

### 3.4 In-Demand Books (Snapshot)
*   **Endpoint**: `GET /library/reports/in-demand`
*   **Params**: `limit`
*   **Response**: Books with highest % of *currently* borrowed copies.

### 3.5 Popular Books (Historical)
*   **Endpoint**: `GET /library/reports/popular-books`
*   **Params**: `limit`
*   **Response**: Top books by all-time borrow frequency.

### 3.6 Student Activity
*   **Endpoint**: `GET /library/reports/student-activity`
*   **Params**: `user_id` (optional for single student), `page`, `per_page`
*   **Response**: List of students with `total_borrowings`, `active_borrowings`, `returned_count`.

### 3.7 Borrowing Trends
*   **Endpoint**: `GET /library/reports/trends`
*   **Params**: `year`
*   **Response**: Monthly breakdown: `{ "month": 1, "total": 45, "active": 12, "returned": 33 }`

### 3.8 Student History
*   **Endpoint**: `GET /library/reports/student/{id}/history`
*   **Response**: Paginated transaction list for specific user.

---

## 🔮 4. Enhancement Requirements

### Poor Condition Books Filter (New Request)
**Context**: Frontend currently does inefficient client-side filtering for poor condition books.
**Requirement Update**: `GET /api/book-items` must support multiple condition filters.
**Format**: `?condition=poor` or `?condition=fair,poor` (for multiple conditions)
**Valid Conditions**: `good`, `fair`, `poor`
**Logic**: Return items where `condition IN (specified_values)`.

---

## 🧪 5. Testing Checklist

1.  **Auth**: Verify Bearer token works for all endpoints.
2.  **Data Seeding**: Ensure database has Transactions and ReturnTransactions for Reports 1-4 to show data.
3.  **Edge Cases**:
    *   No transactions (should return empty arrays, not 500).
    *   Invalid User ID (should return 404).
    *   Year boundary (trends for next year should be empty).

---

> **Note**: This document supersedes `library_report.md` for implementation details but respects the API contract defined in `library_reports_api.md`.
