# New Library Report Endpoints - Borrow Duration Analysis

## Overview
Two new endpoints have been implemented to analyze borrow duration patterns in the library. Both endpoints use data from the transaction service and master book data.

## Endpoints Summary

### 1. Longest Borrowed Categories
**URL**: `GET /api/library/reports/longest-borrowed-categories`

Returns categories ranked by average borrow duration (longest first).

**Key Metrics**:
- Average borrow duration per category
- Total borrows and books per category
- Min/max borrow days

**Use Case**: Identify subject areas where books are kept longer, indicating higher engagement or complexity.

---

### 2. Longest Borrowed Books
**URL**: `GET /api/library/reports/longest-borrowed-books`

Returns individual books ranked by average borrow duration (longest first).

**Key Metrics**:
- Average borrow duration per book
- Full book details (title, author, ISBN, etc.)
- Current availability status
- Total copies and borrows

**Use Case**: Identify specific titles that users keep longer, useful for collection development and understanding reading patterns.

---

## Common Features

### Authentication & Authorization
Both endpoints require:
- Authentication: `auth:api` middleware
- Authorization: `admin` or `librarian` role

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 10 | Number of results to return |

### Data Sources
Both endpoints integrate data from:

**Transaction Service**:
- `borrow_transactions` - Borrow records with borrow_date
- `return_transactions` - Return records with return_date
- `borrow_transaction_details` - Links transactions to book items

**Master Book Service**:
- `book_masters` - Book information
- `book_items` - Physical copies
- `categories` - Book categories
- `book_statuses` - Current item status

### Calculation Method
Both use the same calculation:
```sql
AVG(DATEDIFF(return_date, borrow_date))
```

**Important**: Only returned books are included in the calculation. Currently borrowed books are excluded from the average.

---

## Example Usage

### Get Top 5 Longest Borrowed Categories
```bash
curl -X GET "http://localhost:8000/api/library/reports/longest-borrowed-categories?limit=5" \
  -H "Authorization: Bearer {token}"
```

**Response**:
```json
{
  "success": true,
  "message": "Longest borrowed categories report generated successfully",
  "data": [
    {
      "category_id": 3,
      "category_name": "Reference Books",
      "description": "Encyclopedias, dictionaries, and reference materials",
      "total_borrows": 234,
      "total_books": 56,
      "avg_borrow_days": 15.8,
      "min_borrow_days": 3,
      "max_borrow_days": 30
    }
  ],
  "note": "Categories are ranked by average borrow duration (only returned books)"
}
```

### Get Top 10 Longest Borrowed Books
```bash
curl -X GET "http://localhost:8000/api/library/reports/longest-borrowed-books?limit=10" \
  -H "Authorization: Bearer {token}"
```

**Response**:
```json
{
  "success": true,
  "message": "Longest borrowed books report generated successfully",
  "data": [
    {
      "book_id": 42,
      "title": "The Lord of the Rings",
      "author": "J.R.R. Tolkien",
      "publisher": "Allen & Unwin",
      "year": 1954,
      "isbn": "978-0-618-64015-7",
      "category": "Fantasy",
      "total_copies": 4,
      "currently_borrowed": 2,
      "total_borrows": 67,
      "avg_borrow_days": 19.3,
      "min_borrow_days": 7,
      "max_borrow_days": 30
    }
  ],
  "note": "Books are ranked by average borrow duration (only returned books)"
}
```

---

## Use Cases & Insights

### 1. Collection Development
**Categories Endpoint**:
- Identify subject areas with high engagement
- Plan budget allocation based on category popularity and retention
- Understand which subjects require more depth

**Books Endpoint**:
- Identify specific high-engagement titles
- Decide which books to purchase more copies of
- Understand reader preferences at granular level

### 2. Loan Policy Optimization
- Books/categories with high avg_borrow_days might benefit from different loan periods
- Identify categories that need extended checkout times (e.g., reference materials)

### 3. Reader Engagement Analysis
Compare these endpoints with other reports:

| Metric | Endpoint | Insight |
|--------|----------|---------|
| Borrow Duration | `/longest-borrowed-*` | How long users keep items |
| Borrow Frequency | `/popular-books` | How often items are borrowed |
| Current Demand | `/in-demand` | What's borrowed right now |

**High Duration + High Frequency** = Must-have titles, consider more copies
**High Duration + Low Frequency** = Niche but engaging content
**Low Duration + High Frequency** = Quick reads or reference materials

### 4. Library Space Planning
- Categories with longer borrow times might need permanent shelf space
- Categories with shorter times could use flexible or rotating displays

---

## Implementation Notes

### Performance Considerations
- Both queries use JOINs across multiple tables
- Indexes recommended on:
  - `borrow_transactions.id`
  - `return_transactions.borrow_transaction_id`
  - `book_items.book_master_id`
  - `book_masters.categoryId`

### Data Quality
- Requires return transactions to calculate duration
- Books never returned won't appear in results
- Currently borrowed books are excluded from averages
- Ensure return dates are properly recorded for accurate reporting

### Related Reports
These endpoints complement existing reports:
- `/api/library/reports/popular-books` - Borrow frequency
- `/api/library/reports/in-demand` - Current availability
- `/api/library/reports/trends` - Time-based patterns
- `/api/library/reports/books/{id}/details` - Individual book analysis
- `/api/library/reports/categories/{id}/details` - Individual category analysis

---

## Testing

### Test Scenarios
1. **Empty data**: No returns yet → Empty array
2. **Single category/book**: Verify calculations are correct
3. **Limit parameter**: Test different limits (1, 5, 10, 100)
4. **Currently borrowed**: Ensure they don't affect averages
5. **Missing auth**: Should return 401
6. **Wrong role**: Should return 403

### Sample Test Request (Postman/Insomnia)
```
GET http://localhost:8000/api/library/reports/longest-borrowed-categories
Headers:
  Authorization: Bearer {your_token_here}
  Accept: application/json
```

---

## Documentation Files
- `longest-borrowed-categories-endpoint.md` - Detailed category endpoint docs
- `longest-borrowed-books-endpoint.md` - Detailed books endpoint docs
- This file - Summary and comparison

## Implementation Files
- **Controller**: `app/Http/Controllers/LibraryReportController.php`
  - `getLongestBorrowedCategories()` method (line ~820)
  - `getLongestBorrowedBooks()` method (line ~880)
- **Routes**: `routes/api.php`
  - Line 136: `/longest-borrowed-categories` route
  - Line 137: `/longest-borrowed-books` route
