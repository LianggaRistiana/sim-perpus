# API Documentation - Book Transactions

This document details the API endpoints for managing book borrowing and
returning transactions.

**Base URL**: `/api`

## Authentication

Routes are protected by `auth:api` middleware. Endpoints requiring
administrative or librarian privileges are marked with
`Role: Admin | Librarian`.

---

## 1. Borrow Transactions

**Base Path**: `/transactions`

### List All Borrow Transactions

Retrieve a paginated or detailed list of all borrow transactions.

- **URL**: `/transactions`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:

  - `page`: Page number (default: 1).
  - `per_page`: Number of items per page (default: 10).
  - `status`: Filter by status (`borrowed`, `returned`, `overdue`).
  - `borrower_id`: Filter by specific borrower's User ID.
  - `overdue`: Boolean (`true`/`1`). If true, filters for `status=borrowed` AND
    `due_date < now`.
  - `start_date`: Filter transactions with `borrow_date` >= `start_date`
    (YYYY-MM-DD).
  - `end_date`: Filter transactions with `borrow_date` <= `end_date`
    (YYYY-MM-DD).
  - `search`: Partial search on `transaction_code`.

- **Role**: All Authenticated Users (However, controller uses `latest()->get()`,
  logic usually restricts to admin/librarian or own history, currently retrieves
  all)
- **Response Structure**:
  ```json
  {
  	"status": "success",
  	"data": [
  		{
  			"id": "uuid-string",
  			"transaction_code": "BRW-2024121312345",
  			"borrower": {
  				"id": "uuid-string",
  				"name": "Student Name",
  				"email": "student@example.com",
  				"nis": "12345" // If UserResource includes it
  			},
  			"admin": {
  				"id": "uuid-string",
  				"name": "Admin Name",
  				"email": "admin@example.com"
  			},
  			"borrow_date": "2024-12-13",
  			"due_date": "2024-12-20",
  			"status": "borrowed", // or 'returned', 'overdue'
  			"details": [
  				{
  					"id": "uuid-detail-id",
  					"book_item": {
  						"id": "uuid-book-item",
  						"code": "B001-01",
  						"master": {
  							"title": "Book Title",
  							"author": "Author Name"
  						}
  					},
  					"condition_at_borrow": "good"
  				}
  			],
  			"created_at": "2024-12-13T12:00:00.000000Z",
  			"updated_at": "2024-12-13T12:00:00.000000Z"
  		}
  	]
  }
  ```

### Get Borrow Transaction Details

Retrieve a single borrow transaction by ID.

- **URL**: `/transactions/{id}`
- **Method**: `GET`
- **Auth Required**: Yes
- **Path Parameters**:
  - `id` (uuid): The ID of the transaction.
- **Response**:
  ```json
  {
      "status": "success",
      "data": {
          "id": "uuid-string",
          "transaction_code": "BRW-2024121312345",
          "borrower": { ... },
          "admin": { ... },
          "borrow_date": "YYYY-MM-DD",
          "due_date": "YYYY-MM-DD",
          "status": "borrowed",
          "details": [ ... ]
      }
  }
  ```

### Create Borrow Transaction

Record a new book borrowing.

- **URL**: `/transactions`
- **Method**: `POST`
- **Auth Required**: Yes
- **Role**: Admin | Librarian
- **Request Body**:
  ```json
  {
  	"borrower_id": "uuid-of-user-borrowing",
  	"borrow_date": "YYYY-MM-DD",
  	"due_date": "YYYY-MM-DD",
  	"items": ["uuid-book-item-1", "uuid-book-item-2"]
  }
  ```
- **Validation Rules**:
  - `borrower_id`: Required. Must exist in `users` table.
  - `borrow_date`: Required. Valid date format.
  - `due_date`: Required. Valid date format. Must be a date after or equal to
    `borrow_date`.
  - `items`: Required. Array. Minimum 1 item.
  - `items.*`: Each item must be a valid `id` existing in `book_items` table.
  - **Logic Check**: System checks if the requested book items are currently
    available (not borrowed). If any item is borrowed, the request fails with
    500 error.
- **Response (201 Created)**:
  ```json
  {
      "status": "success",
      "message": "Borrow transaction created successfully",
      "data": { ...transaction object... }
  }
  ```
- **Error Response (Validation)**:
  ```json
  {
  	"status": "error",
  	"message": "Validation error",
  	"errors": {
  		"due_date": [
  			"The due date must be a date after or equal to borrow date."
  		],
  		"items.0": ["The selected items.0 is invalid."]
  	}
  }
  ```

### Delete Borrow Transaction

Delete a borrow transaction.

- **URL**: `/transactions/{id}`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Role**: Admin | Librarian
- **Response**:
  ```json
  {
  	"status": "success",
  	"message": "Transaction deleted"
  }
  ```

---

## 2. Return Transactions

**Base Path**: `/return-transactions`

### List All Return Transactions

Retrieve a list of all return transactions.

- **URL**: `/return-transactions`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response Structure**:
  ```json
  {
      "status": "success",
      "data": [
          {
              "id": "uuid",
              "borrow_transaction": {
                  "id": "uuid",
                  "transaction_code": "BRW-..."
              },
              "admin": { ... },
              "return_date": "YYYY-MM-DD",
              "details": [
                  {
                      "id": "uuid",
                      "book_item": { ... },
                      "condition_at_return": "good|fair|poor", // or null if lost
                      "notes": "some notes"
                  }
              ]
          }
      ]
  }
  ```

### Get Return Transaction Details

Retrieve a single return transaction by ID.

- **URL**: `/return-transactions/{id}`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
      "status": "success",
      "data": { ... }
  }
  ```

### Create Return Transaction

Record the return of borrowed books.

- **URL**: `/return-transactions`
- **Method**: `POST`
- **Auth Required**: Yes
- **Role**: Admin | Librarian
- **Request Body**:
  ```json
  {
  	"borrow_transaction_id": "uuid-of-borrow-transaction",
  	"return_date": "YYYY-MM-DD",
  	"items": [
  		{
  			"book_item_id": "uuid-book-item-1",
  			"status": "available",
  			"condition_at_return": "good",
  			"notes": "Returned in good condition"
  		},
  		{
  			"book_item_id": "uuid-book-item-2",
  			"status": "lost",
  			"notes": "Student lost the book"
  		}
  	]
  }
  ```
- **Validation Rules**:
  - `borrow_transaction_id`: Required. Exists in `borrow_transactions`.
  - `return_date`: Required. Date.
  - `items`: Required. Array.
  - `items.*.book_item_id`: Required. Exists in `book_items`.
  - `items.*.status`: Required. Values: `available`, `lost`.
  - `items.*.condition_at_return`:
    - Required if `status` is `available`.
    - Values: `fair`, `good`, `poor`.
    - If `status` is `lost`, this field is effectively ignored (set to null by
      system).
  - `items.*.notes`: Optional string.
- **Logic**:
  - Verifies all items from length of borrow transaction match the return items
    count (currently partial returns not fully separated).
  - Updates `BookStatus` to `available` or `lost`.
  - Updates `BookCondition` if `available`.
  - Updates `BorrowTransaction` status to `returned`.
- **Response (201 Created)**:
  ```json
  {
      "status": "success",
      "message": "Return transaction created successfully",
      "data": { ... }
  }
  ```

### Delete Return Transaction

Delete a return transaction.

- **URL**: `/return-transactions/{id}`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Role**: Admin | Librarian
- **Response**:
  ```json
  {
  	"status": "success",
  	"message": "Transaction deleted"
  }
  ```
