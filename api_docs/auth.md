# Authentication API

Base URL: `/api/auth`

## 1. Login
Authenticate a user and retrieve an access token.

**Endpoint:** `POST /api/auth/login`

**Body:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `user_number` | String | Yes | User's unique number/ID. |
| `password` | String | Yes | User's password. |

**Response:**
```json
{
    "status": "success",
    "data": {
        "user": {
            "id": "uuid",
            "name": "User Name",
            "user_number": "12345",
            ...
        },
        "token": {
            "access_token": "ey...",
            "token_type": "bearer",
            "expires_in": 3600
        }
    },
    "meta": {
        "timestamp": "iso-timestamp"
    }
}
```

## 2. Get User Profile (Me)
Retrieve the authenticated user's profile.

**Endpoint:** `GET /api/auth/me`

**Headers:**
`Authorization: Bearer {token}`

**Response:**
```json
{
    "status": "success",
    "data": {
        "id": "uuid",
        "name": "User Name",
        "user_number": "12345",
        ...
    },
    "meta": {
        "timestamp": "iso-timestamp"
    }
}
```

## 3. Refresh Token
Refresh the current access token.

**Endpoint:** `POST /api/auth/refresh`

**Headers:**
`Authorization: Bearer {token}`

**Response:**
```json
{
    "status": "success",
    "data": {
        "user": { ... },
        "token": {
            "access_token": "new-ey...",
            "token_type": "bearer",
            "expires_in": 3600
        }
    },
    "meta": {
        "timestamp": "iso-timestamp"
    }
}
```

## 4. Logout
Invalidate the current token.

**Endpoint:** `POST /api/auth/logout`

**Headers:**
`Authorization: Bearer {token}`

**Response:**
```json
{
    "status": "success",
    "data": null,
    "error": null,
    "meta": {
        "timestamp": "iso-timestamp",
        "message": "Successfully logged out"
    }
}
```
