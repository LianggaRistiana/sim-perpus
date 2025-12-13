# Book Items API

## Endpoints

### 1. List Book Items

Get a paginated list of book items.

- **URL**: `/api/book-items`
- **Method**: `GET`
- **Authentication**: Required

#### Query Parameters

| Parameter        | Type      | Description                                   |
| ---------------- | --------- | --------------------------------------------- |
| `page`           | `integer` | Page number (default: 1)                      |
| `limit`          | `integer` | Number of items per page (default: 10)        |
| `book_master_id` | `uuid`    | Filter by Book Master ID                      |
| `keyword`        | `string`  | Search by Book Item Code or Book Master Title |

#### Success Response

**Code**: `200 OK`

```json
{
    "status": "success",
    "message": null,
    "data": [
        {
            "id": "uuid...",
            "book_master_id": "uuid...",
            "book_master": {
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
                },
             },
            "code": "BK-001",
            "condition": "good",
            "status": "available",
            "createdAt": "2025-12-12T..."
        },
        ...
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

### 2. Show Book Item

Get details of a specific book item.

- **URL**: `/api/book-items/{id}`
- **Method**: `GET`
- **Authentication**: Required

#### Success Response

**Code**: `200 OK`

```json
{
    "status": "success",
    "message": null,
    "data": {
        "id": "uuid...",
        "book_master_id": "uuid...",
        "book_master": { ... },
        "code": "BK-001",
        "condition": "good",
        "status": "available",
        "createdAt": "2025-12-12T..."
    }
}
```

---

### 3. Create Book Item

Create a new book item (copy).

- **URL**: `/api/book-items`
- **Method**: `POST`
- **Authentication**: Required (`admin` or `librarian`)

#### Request Body

| Field            | Type     | Required | Description                                              |
| ---------------- | -------- | -------- | -------------------------------------------------------- |
| `book_master_id` | `uuid`   | **Yes**  | The ID of the Book Master                                |
| `condition`      | `string` | No       | `good` (default), `damaged`, `lost`                      |
| `status`         | `string` | No       | `available` (default), `borrowed`, `maintenance`, `lost` |

#### Success Response

**Code**: `201 Created`

```json
{
    "status": "success",
    "message": null,
    "data": {
        "id": "uuid...",
        "code": "BK-001",
        ...
    }
}
```

---

### 4. Update Book Item

Update details of a book item. **Note**: `book_master_id` cannot be updated.

- **URL**: `/api/book-items/{id}`
- **Method**: `PUT`
- **Authentication**: Required (`admin` or `librarian`)

#### Request Body

| Field       | Type     | Required | Description                                    |
| ----------- | -------- | -------- | ---------------------------------------------- |
| `condition` | `string` | No       | `good`, `damaged`, `lost`                      |
| `status`    | `string` | No       | `available`, `borrowed`, `maintenance`, `lost` |

#### Success Response

**Code**: `200 OK`

```json
{
    "status": "success",
    "message": null,
    "data": {
        "id": "uuid...",
        ...
    }
}
```

---

### 5. Delete Book Item

Soft delete a book item.

- **URL**: `/api/book-items/{id}`
- **Method**: `DELETE`
- **Authentication**: Required (`admin` or `librarian`)

#### Success Response

**Code**: `200 OK`

```json
{
	"status": "success",
	"message": null,
	"data": null
}
```
