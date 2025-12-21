# Endpoint: Get Longest Borrowed Categories

## Overview
This endpoint returns categories ranked by the average duration books are borrowed for (longest to shortest).

## Endpoint Details
- **URL**: `GET /api/library/reports/longest-borrowed-categories`
- **Authentication**: Required (`auth:api` middleware)
- **Authorization**: `admin` or `librarian` role

## Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 10 | Number of categories to return |

## Response Format

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Longest borrowed categories report generated successfully",
  "data": [
    {
      "category_id": 1,
      "category_name": "Fiction",
      "description": "Fictional books and novels",
      "total_borrows": 156,
      "total_books": 45,
      "avg_borrow_days": 12.5,
      "min_borrow_days": 3,
      "max_borrow_days": 25
    },
    {
      "category_id": 2,
      "category_name": "Science",
      "description": "Scientific books",
      "total_borrows": 89,
      "total_books": 32,
      "avg_borrow_days": 10.2,
      "min_borrow_days": 2,
      "max_borrow_days": 21
    }
  ],
  "note": "Categories are ranked by average borrow duration (only returned books)"
}
```

### Error Response (500)
```json
{
  "success": false,
  "message": "Failed to generate longest borrowed categories report: [error details]"
}
```

## Data Fields Explanation
- **category_id**: Unique identifier for the category
- **category_name**: Name of the category
- **description**: Description of the category
- **total_borrows**: Total number of completed borrow transactions for books in this category
- **total_books**: Total number of unique books in this category
- **avg_borrow_days**: Average number of days books are kept (rounded to 1 decimal place)
- **min_borrow_days**: Shortest borrow duration in this category
- **max_borrow_days**: Longest borrow duration in this category

## Implementation Details

### Database Tables Used
The endpoint uses data from the transaction service through the following tables:
- `categories` - Category information
- `book_masters` - Book titles associated with categories
- `book_items` - Physical book copies
- `borrow_transaction_details` - Details of borrowed items
- `borrow_transactions` - Borrow transaction records
- `return_transactions` - Return transaction records

### Query Logic
1. Joins categories with their books and transaction data
2. Calculates average borrow duration using `DATEDIFF(return_date, borrow_date)`
3. Only includes returned books (books with return_transactions)
4. Groups by category
5. Orders by average borrow days (descending)
6. Limits results based on query parameter

## Example Usage

### Request
```bash
curl -X GET "http://localhost:8000/api/library/reports/longest-borrowed-categories?limit=5" \
  -H "Authorization: Bearer {token}"
```

### Use Cases
- Identify categories where books are kept longer (may indicate higher engagement)
- Analyze reading patterns across different subjects
- Plan collection development based on usage duration
- Detect categories that might need more copies (high avg duration + high total borrows)
