# Categories API

Base URL: `/api/categories`

## Authentication
- `GET` requests: Authenticated users (`auth:api`).
- `POST`, `PUT`, `DELETE` requests: Authenticated users with role `admin` or `librarian`.

## 1. List Categories
Retrieve a paginated list of categories.

**Endpoint:** `GET /api/categories`

**Query Parameters:**
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | Integer | `1` | Page number. |
| `limit` | Integer | `10` | Number of items per page. |
| `keyword` | String | - | Search keyword (filters by `name` or `code`). |

**Response:**
```json
{
    "status": "success",
    "data": [
        {
            "id": "uuid",
            "code": "BK-001",
            "name": "Fiksi",
            "description": "Karya sastra imajinatif",
            "created_at": "timestamp",
            "updated_at": "timestamp"
        }
    ],
    "meta": {
        "page": 1,
        "per_page": 10,
        "total": 42,
        "last_page": 5,
        "timestamp": "iso-timestamp"
    }
}
```

## 2. Create Category
Create a new category. The `code` is automatically generated (e.g., `BK-001`, `BK-002`).

**Endpoint:** `POST /api/categories`

**Body:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Yes | Name of the category. |
| `description` | String | No | Description of the category. |

**Response:**
```json
{
    "status": "success",
    "data": {
        "id": "uuid",
        "code": "BK-XXX",
        "name": "Category Name",
        "description": "Description",
        "created_at": "timestamp",
        "updated_at": "timestamp"
    }
}
```

## 3. Get Category
Retrieve a specific category by ID.

**Endpoint:** `GET /api/categories/{id}`

**Response:**
```json
{
    "status": "success",
    "data": {
        "id": "uuid",
        "code": "BK-001",
        "name": "Fiksi",
        "description": "...",
        "created_at": "...",
        "updated_at": "..."
    }
}
```

## 4. Update Category
Update an existing category.

**Endpoint:** `PUT /api/categories/{id}`

**Body:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `code` | String | No | Update the code (Unique). |
| `name` | String | No | Update the name. |
| `description` | String | No | Update the description. |

**Response:**
```json
{
    "status": "success",
    "data": {
        "id": "uuid",
        "code": "BK-002",
        "name": "New Name",
        ...
    }
}
```

## 5. Delete Category
Delete a category (Soft Delete).

**Endpoint:** `DELETE /api/categories/{id}`

**Response:**
```json
{
    "status": "success",
    "data": {
        "id": "uuid",
        "code": "BK-001",
        ...
    }
}
```
