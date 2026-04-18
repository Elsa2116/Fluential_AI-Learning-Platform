# Frontend/Backend Auth Handoff

This file is a quick contract so frontend and backend can work in parallel without conflicts.

## Current Status

- Signup endpoint works.
- Login endpoint works and returns token/user.
- If UI says "Login successful" but does not navigate, that is frontend flow/routing logic (not backend auth failure).

## Backend Base URL

- Local API base: `http://localhost:8000/api/v1`

## Auth Endpoints (Backend Contract)

### `POST /register`

Accepted JSON body:

```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "country": "Ethiopia",
  "role": "student"
}
```

Also accepted for name (for compatibility):

- `name`
- `fullName`

Success response (`200`):

```json
{
  "access_token": "jwt-token",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

Common errors:

- `400` -> `"Email already registered"` or `"Invalid role"`
- `422` -> validation error text (string in `detail`)

### `POST /login`

JSON body:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Success response (`200`) shape is the same as `/register`.

Common error:

- `401` -> `"Invalid credentials"`

### `GET /me`

- Requires header: `Authorization: Bearer <access_token>`
- Returns current user profile

## Frontend Responsibilities

- On login/register success, save:
  - `apl_token` = `access_token`
  - `apl_user` = JSON string of `user`
- Then navigate user (example: dashboard route).
- Backend does not trigger page redirects; frontend must route explicitly.

## Team Rules to Avoid Conflicts

- Frontend should not change backend auth response keys:
  - `access_token`, `token_type`, `user`
- Backend should avoid changing endpoint paths without notifying frontend.
- Keep error payload readable as:
  - `{ "detail": "string message" }`
- For breaking changes, update this file in the same PR.

