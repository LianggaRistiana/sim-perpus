# Librarian API

Base URL: `/api/librarians`

## 1. List Librarians

Get a paginated list of librarians.

**Endpoint:** `GET /librarians`

**Query Parameters:**
- `keyword` (optional): Search by name, user number, or email.
- `limit` (optional): Number of items per page (default: 10).
- `page` (optional): Page number (default: 1).

**Response:**
```json
{
    "status": "success",
    "message": "Success",
    "data": [
        {
            "id": "uuid",
            "name": "Librarian Name",
            "user_number": "lib001",
            "email": "lib001@smpnbaturiti.ac.id",
            "role": "librarian"
        }
    ],
    "meta": {
        "current_page": 1,
        "last_page": 1,
        "per_page": 10,
        "total": 1
    }
}
```

## 2. Create Librarian

Create a new librarian. Email and password are automatically generated based on the `user_number`.
- Email: `<user_number>@smpnbaturiti.ac.id`
- Password: `<user_number>` (hashed)

**Endpoint:** `POST /librarians`

**Request Body:**
```json
{
    "name": "Librarian Name",
    "user_number": "lib001",
    "email": "optional@email.com", // Optional, will be auto-generated if not provided, but controller currently overrides it.
    "password": "password" // Optional, will be auto-generated if not provided, but controller currently overrides it.
}
```
*Note: The current implementation overrides email and password generation regardless of input.*

**Response:**
```json
{
    "status": "success",
    "message": "Success",
    "data": {
        "id": "uuid",
        "name": "Librarian Name",
        "user_number": "lib001",
        "email": "lib001@smpnbaturiti.ac.id",
        "role": "librarian"
    }
}
```

## 3. Get Librarian Details

Get details of a specific librarian.

**Endpoint:** `GET /librarians/{id}`

**Response:**
```json
{
    "status": "success",
    "message": "Success",
    "data": {
        "id": "uuid",
        "name": "Librarian Name",
        "user_number": "lib001",
        "email": "lib001@smpnbaturiti.ac.id",
        "role": "librarian"
    }
}
```

## 4. Update Librarian

Update librarian details.

**Endpoint:** `PUT /librarians/{id}`

**Request Body:**
```json
{
    "name": "New Name", // Optional
    "user_number": "newlib001", // Optional
}
```

**Response:**
```json
{
    "status": "success",
    "message": "Success",
    "data": {
        "id": "uuid",
        "name": "New Name",
        "user_number": "newlib001",
        "email": "new@email.com",
        "role": "librarian"
    }
}
```

## 5. Delete Librarian

Delete a librarian.

**Endpoint:** `DELETE /librarians/{id}`

**Response:**
```json
{
    "status": "success",
    "message": "Success",
    "data": null
}
```
