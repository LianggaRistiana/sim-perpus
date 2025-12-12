# Student API

Base URL: `/api/students`

## 1. List Students
Retrieve a paginated list of students with optional filtering.

**Endpoint:** `GET /api/students`

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `page` | Integer | No | Page number (default: 1) |
| `limit` | Integer | No | Items per page (default: 10) |
| `keyword` | String | No | Search by name, user_number, email |

**Response:**
```json
{
    "status": "success",
    "message": "Data fetched successfully",
    "data": [
{{ ... }}
        "last_page": 5
    }
}
```

---

## 2. Get Student Detail
Retrieve detailed information about a specific student.

**Endpoint:** `GET /api/students/{id}`

**Path Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Yes | Student ID |

**Response:**
```json
{
    "status": "success",
    "message": "Data fetched successfully",
    "data": {
        "id": "uuid",
        "name": "Student Name",
        "user_number": "S12345",
        "email": "student@example.com",
        "role": "student",
        "created_at": "2023-01-01T00:00:00.000000Z",
        "updated_at": "2023-01-01T00:00:00.000000Z"
    }
}
```

---

## 3. Create Student
Create a new student record.

**Endpoint:** `POST /api/students`

**Headers:**
- `Authorization`: `Bearer <token>` (Admin and librarian Only)
- `Content-Type`: `application/json`

**Body Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Yes | Student Name |
| `user_number` | String | Yes | Unique Student Number (user_number) |
| `email` | String | No | Student Email |

**Response (201 Created):**
```json
{
    "status": "success",
    "message": "Student created successfully",
    "data": {
        "id": "uuid",
        "name": "New Student",
        "user_number": "S99999",
        "email": null,
        "role": "student",
        "created_at": "...",
        "updated_at": "..."
    }
}
```

---

## 4. Update Student
Update an existing student record.

**Endpoint:** `PUT /api/students/{id}`

**Headers:**
- `Authorization`: `Bearer <token>` (Admin and librarian Only)
- `Content-Type`: `application/json`

**Body Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | No | Student Name |
| `user_number` | String | No | Unique Student Number (user_number) |
| `email` | String | No | Student Email |

**Response:**
```json
{
    "status": "success",
    "message": "Student updated successfully",
    "data": {
        "id": "uuid",
        "name": "Updated Name",
        "user_number": "S12345",
        // ...
    }
}
```

---

## 5. Delete Student
Delete a student record.

**Endpoint:** `DELETE /api/students/{id}`

**Headers:**
- `Authorization`: `Bearer <token>` (Admin and librarian Only)

**Response:**
```json
{
    "status": "success",
    "message": "Student deleted successfully",
    "data": null
}
```

---

## 6. Batch Create Students
Upload multiple students at once.

**Endpoint:** `POST /api/students/batch`

**Headers:**
- `Authorization`: `Bearer <token>` (Admin and librarian Only)
- `Content-Type`: `application/json`

**Body Parameters:**
```json
{
    "students": [
        {
            "name": "Student One",
{{ ... }}
        }
    ]
}
```

**Response (201 Created):**
```json
{
    "status": "success",
    "message": "Batch import successful",
    "data": [
        // List of created students
    ]
}
```
