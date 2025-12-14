# Book Items API

## Endpoints

### 1. List Book Items
Get a paginated list of book items.

- **URL**: `/api/book-items`
- **Method**: `GET`
- **Authentication**: Required

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | `integer` | Page number (default: 1) |
| `limit` | `integer` | Number of items per page (default: 10) |
| `book_master_id` | `uuid` | Filter by Book Master ID |
| `keyword` | `string` | Search by Book Item Code or Book Master Title |
| `condition` | `string` | Filter by condition: `good`, `fair`, `poor` |
| `status` | `string` | Filter by status: `available`, `borrowed`, `lost` |

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
            "book_master": { ... },
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
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `book_master_id` | `uuid` | **Yes** | The ID of the Book Master |
| `condition` | `string` | No | `good` (default), `damaged`, `lost` |
| `status` | `string` | No | `available` (default), `borrowed`, `maintenance`, `lost` |

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

### 4. Create Book Item Batch
Create multiple book items at once.

- **URL**: `/api/book-items/batch`
- **Method**: `POST`
- **Authentication**: Required (`admin` or `librarian`)

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `book_master_id` | `uuid` | **Yes** | The ID of the Book Master |
| `items` | `array` | **Yes** | Array of item specifications |
| `items.*.condition` | `string` | **Yes** | `good`, `fair`, `poor` |
| `items.*.quantity` | `integer` | **Yes** | Number of items to create (min 1) |
| `items.*.status` | `string` | No | `available` (default), `borrowed`, `lost` |

#### Success Response
**Code**: `201 Created`
```json
{
    "status": "success",
    "message": null,
    "data": {
        "created_count": 5
    }
}
```

---

### 5. Update Book Item
Update details of a book item.
**Note**: `book_master_id` cannot be updated.

- **URL**: `/api/book-items/{id}`
- **Method**: `PUT`
- **Authentication**: Required (`admin` or `librarian`)

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `condition` | `string` | No | `good`, `damaged`, `lost` |
| `status` | `string` | No | `available`, `borrowed`, `maintenance`, `lost` |

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

### 6. Delete Book Item
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
