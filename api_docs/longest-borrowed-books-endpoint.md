# Endpoint: Get Longest Borrowed Books

## Overview
This endpoint returns books ranked by the average duration they are borrowed for (longest to shortest). It combines data from the transaction service and master book data.

## Endpoint Details
- **URL**: `GET /api/library/reports/longest-borrowed-books`
- **Authentication**: Required (`auth:api` middleware)
- **Authorization**: `admin` or `librarian` role

## Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 10 | Number of books to return |

## Response Format

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Longest borrowed books report generated successfully",
  "data": [
    {
      "book_id": 5,
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "publisher": "Scribner",
      "year": 1925,
      "isbn": "978-0-7432-7356-5",
      "category": "Fiction",
      "total_copies": 3,
      "currently_borrowed": 1,
      "total_borrows": 45,
      "avg_borrow_days": 14.7,
      "min_borrow_days": 5,
      "max_borrow_days": 28
    },
    {
      "book_id": 12,
      "title": "A Brief History of Time",
      "author": "Stephen Hawking",
      "publisher": "Bantam Books",
      "year": 1988,
      "isbn": "978-0-553-38016-3",
      "category": "Science",
      "total_copies": 2,
      "currently_borrowed": 0,
      "total_borrows": 32,
      "avg_borrow_days": 13.2,
      "min_borrow_days": 7,
      "max_borrow_days": 21
    }
  ],
  "note": "Books are ranked by average borrow duration (only returned books)"
}
```

### Error Response (500)
```json
{
  "success": false,
  "message": "Failed to generate longest borrowed books report: [error details]"
}
```

## Data Fields Explanation

### Master Book Data (from `book_masters`)
- **book_id**: Unique identifier for the book
- **title**: Title of the book
- **author**: Author(s) of the book
- **publisher**: Publisher name
- **year**: Publication year
- **isbn**: ISBN number
- **category**: Category name (from categories table)

### Inventory Data (from `book_items` and `book_statuses`)
- **total_copies**: Total number of physical copies available
- **currently_borrowed**: Number of copies currently checked out

### Transaction Data (from `borrow_transactions` and `return_transactions`)
- **total_borrows**: Total number of completed borrow transactions
- **avg_borrow_days**: Average number of days books are kept (rounded to 1 decimal place)
- **min_borrow_days**: Shortest borrow duration
- **max_borrow_days**: Longest borrow duration

## Implementation Details

### Database Tables Used
This endpoint integrates data from multiple services:

**Master Book Service:**
- `book_masters` - Book information (title, author, ISBN, etc.)
- `categories` - Category information
- `book_items` - Physical book copies
- `book_statuses` - Current status of book items

**Transaction Service:**
- `borrow_transaction_details` - Details of borrowed items
- `borrow_transactions` - Borrow transaction records
- `return_transactions` - Return transaction records

### Query Logic
1. Starts from `book_masters` (master book data)
2. Joins with `categories` for category names
3. Joins with `book_items` for physical copies
4. Joins with `borrow_transaction_details` and `borrow_transactions` for transaction data
5. Joins with `return_transactions` to calculate borrow duration
6. Joins with `book_statuses` for current availability
7. Calculates average borrow duration using `DATEDIFF(return_date, borrow_date)`
8. Only includes books that have been returned at least once
9. Groups by book (book_master)
10. Orders by average borrow days (descending)
11. Limits results based on query parameter

## Example Usage

### Request
```bash
curl -X GET "http://localhost:8000/api/library/reports/longest-borrowed-books?limit=10" \
  -H "Authorization: Bearer {token}"
```

### Response Example
```json
{
  "success": true,
  "message": "Longest borrowed books report generated successfully",
  "data": [
    {
      "book_id": 15,
      "title": "War and Peace",
      "author": "Leo Tolstoy",
      "publisher": "The Russian Messenger",
      "year": 1869,
      "isbn": "978-0-14-044793-4",
      "category": "Classic Literature",
      "total_copies": 2,
      "currently_borrowed": 0,
      "total_borrows": 18,
      "avg_borrow_days": 18.5,
      "min_borrow_days": 10,
      "max_borrow_days": 30
    }
  ],
  "note": "Books are ranked by average borrow duration (only returned books)"
}
```

## Use Cases

### Collection Management
- Identify books that users tend to keep longer (may indicate complexity or depth)
- Plan purchase decisions based on borrow duration and demand
- Understand reading patterns for different types of books

### Library Operations
- Books with high avg_borrow_days + high total_borrows may need more copies
- Compare currently_borrowed vs total_copies to assess availability
- Detect books that might benefit from extended loan periods

### Reading Analytics
- Longer borrow times may indicate:
  - More engaging or complex content
  - Reference materials kept for extended periods
  - Books used for research or study
- Compare with `popularBooks` endpoint to distinguish between:
  - High demand books (frequently borrowed)
  - High engagement books (kept longer)

## Related Endpoints
- `/api/library/reports/longest-borrowed-categories` - Categories by borrow duration
- `/api/library/reports/popular-books` - Books by total borrow count
- `/api/library/reports/in-demand` - Books currently borrowed
- `/api/library/reports/books/{bookId}/details` - Detailed book report

## Notes
- Only includes books that have been returned at least once (to calculate duration)
- Currently borrowed books are not included in the average calculation
- Average is calculated from completed transactions only
- Books with no returns will not appear in this report
