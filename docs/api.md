# API Documentation 🛣

This document provides detailed information about the Task Manager API endpoints, authentication, and usage.

## Base URL
- Development: `http://localhost:3000`
- Production: `https://<your-production-url>`

## Authentication
Most endpoints require a valid JSON Web Token (JWT) provided in the `Authorization` header:

```http
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and receive a JWT | No |
| PUT | `/api/auth/profile` | Update profile (supports `multipart/form-data` for avatars) | Yes |
| PUT | `/api/auth/password` | Change the current user's password | Yes |

---

## Task Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/api/task` | Create a new task | Yes |
| GET | `/api/task` | Get all tasks for the authenticated user | Yes |
| GET | `/api/task/:id` | Get details for a specific task | Yes |
| PUT | `/api/task/:id` | Update a specific task | Yes |
| DELETE | `/api/task/:id` | Delete a specific task | Yes |
| PUT | `/api/task/reorder` | Update the order of multiple tasks | Yes |

---

## Admin Endpoints
*These endpoints require the user to have the `admin` role.*

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/api/users` | List all registered users | Yes (Admin) |
| GET | `/api/users/:id` | Get detailed information about a user | Yes (Admin) |
| DELETE | `/api/users/:id` | Delete a specific user | Yes (Admin) |
| GET | `/api/task/all` | View all tasks from all users | Yes (Admin) |

---

## Request/Response Examples

### Create Task (POST `/api/task`)
**Request Body:**
```json
{
  "title": "Fix bug in auth",
  "status": "pending",
  "priority": "high"
}
```

**Response (201 Created):**
```json
{
  "_id": "60d...",
  "title": "Fix bug in auth",
  "status": "pending",
  "priority": "high",
  "userId": "60a...",
  "createdAt": "2024-..."
}
```
