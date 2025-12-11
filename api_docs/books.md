# BookMaster API Documentation

Base URL: `/api/books`

## 1. List Books
Retrieve a paginated list of books with optional filtering.

**Endpoint:** `GET /api/books`

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `page` | Integer | No | Page number (default: 1) |
| `limit` | Integer | No | Items per page (default: 10) |
| `keyword` | String | No | Search by title, author, publisher, or ISBN |
| `categoryId` | UUID | No | Filter by Category ID |

**Response:**
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": [
    {
      "id": "uuid...",
      "title": "Book Title",
      "author": "Author Name",
      "publisher": "Publisher Name",
      "year": 2023,
      "isbn": "978-...",
      "categoryId": "uuid...",
      "category": {
          "id": "uuid...",
          "name": "Category Name"
      },
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 10,
    "total": 50,
    "last_page": 5
  }
}
```

---

## 2. Get Book Detail
Retrieve detailed information about a specific book, including its category.

**Endpoint:** `GET /api/books/{id}`

**Path Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Yes | Book Master ID |

**Response:**
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": {
    "id": "uuid...",
    "title": "Book Title",
    "author": "Author Name",
    "publisher": "Publisher Name",
    "year": 2023,
    "isbn": "978-...",
    "categoryId": "uuid...",
    "category": {
        "id": "uuid...",
        "name": "Category Name"
    },
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

---

## 3. Get Book Items
Retrieve a list of physical items associated with a book master.

**Endpoint:** `GET /api/books/{id}/items`

**Path Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Yes | Book Master ID |

**Response:**
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": [
    {
      "id": "uuid...",
      "code": 1001,
      "condition": "good",
      "status": "available",
      "createdAt": "timestamp"
    }
  ]
}
```

---

## 4. Create Book
Create a new book master record. Optionally auto-generate book items.

**Endpoint:** `POST /api/books`

**Middleware:** `auth:api`, `role:admin|librarian`

**Body Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | String | Yes | Book Title |
| `author` | String | Yes | Author Name |
| `publisher` | String | Yes | Publisher Name |
| `year` | Integer | Yes | Year (1900 - Current+1) |
| `categoryId` | UUID | Yes | Valid Category ID |
| `isbn` | String | Yes | Unique ISBN |
| `bookItemQuantity` | Integer | No | Number of items to auto-create (default condition: good, status: available) |

**Response:**
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": {
    "id": "uuid...",
    // ... book details ...
    "items": [ ... ] // If quantity was provided
  }
}
```

---

## 5. Update Book
Update an existing book master record.

**Endpoint:** `PUT /api/books/{id}`

**Middleware:** `auth:api`, `role:admin|librarian`

**Body Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | String | No | Book Title |
| `author` | String | No | Author Name |
| `publisher` | String | No | Publisher Name |
| `year` | Integer | No | Year |
| `categoryId` | UUID | No | Category ID |
| `isbn` | String | No | Unique ISBN |

**Response:**
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": {
     // ... updated book details
  }
}
```

---

## 6. Delete Book
Soft delete a book master record.

**Endpoint:** `DELETE /api/books/{id}`

**Middleware:** `auth:api`, `role:admin|librarian`

**Response:**
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": null
}
```
