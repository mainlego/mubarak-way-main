# Admin Authentication API Documentation

## Overview

The Admin Authentication API provides JWT-based authentication for admin users, separate from the Telegram-based user authentication. This allows admins to manage books, nashids, users, and subscriptions through the admin panel.

## Base URL

```
/api/admin
```

## Authentication

All routes (except login) require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <token>
```

## JWT Secret

The JWT secret is configured via environment variable:

```env
ADMIN_JWT_SECRET=mubarakway-admin-secret-2025
```

## Admin Roles & Permissions

### Roles
- **admin** - Full access to all features
- **moderator** - Can manage content and users
- **editor** - Can manage content only

### Permissions Object
```typescript
{
  canManageBooks: boolean;      // Create, edit, delete books
  canManageNashids: boolean;    // Create, edit, delete nashids
  canManageUsers: boolean;      // Manage user accounts and subscriptions
  canViewAnalytics: boolean;    // View dashboard statistics
  canManageAdmins: boolean;     // Create, edit, delete admins and subscription plans
}
```

## API Endpoints

### Authentication

#### POST /api/admin/login
Login with username and password.

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "60d5ec49f1b2c8b5f8e4c1a2",
    "username": "admin",
    "email": "admin@mubarakway.com",
    "role": "admin",
    "permissions": {
      "canManageBooks": true,
      "canManageNashids": true,
      "canManageUsers": true,
      "canViewAnalytics": true,
      "canManageAdmins": true
    }
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

#### GET /api/admin/verify
Verify JWT token and get current admin info.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "admin": {
    "id": "60d5ec49f1b2c8b5f8e4c1a2",
    "username": "admin",
    "email": "admin@mubarakway.com",
    "role": "admin",
    "permissions": { ... }
  }
}
```

### Profile Management

#### PUT /api/admin/profile
Update admin profile (username, email).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "admin": { ... }
}
```

#### PUT /api/admin/password
Change admin password.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Dashboard Statistics

#### GET /api/admin/stats
Get comprehensive dashboard statistics.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "stats": {
    "totalBooks": 150,
    "totalNashids": 200,
    "totalUsers": 1000,
    "activeUsers": 750,
    "premiumUsers": 50,
    "recentUsers": [
      {
        "_id": "...",
        "firstName": "Ahmed",
        "lastName": "Hassan",
        "telegramId": "123456789",
        "createdAt": "2025-01-15T10:30:00.000Z",
        "subscription": {
          "tier": "pro",
          "isActive": true
        }
      }
    ]
  }
}
```

### Books Management

#### GET /api/admin/books
Get all books with filters and pagination.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Items per page
- `search` (string) - Search by title or author
- `category` (string) - Filter by category
- `language` (string) - Filter by language

**Response (200):**
```json
{
  "success": true,
  "books": [ ... ],
  "totalPages": 10,
  "currentPage": 1,
  "total": 150
}
```

#### GET /api/admin/books/:id
Get single book by ID.

**Response (200):**
```json
{
  "success": true,
  "book": { ... }
}
```

#### POST /api/admin/books
Create new book. **Requires:** `canManageBooks` permission.

**Request Body:**
```json
{
  "title": "Sahih Bukhari",
  "titleArabic": "صحيح البخاري",
  "author": "Imam Bukhari",
  "authorArabic": "الإمام البخاري",
  "description": "The most authentic collection of hadith",
  "cover": "https://example.com/covers/bukhari.jpg",
  "content": "https://example.com/books/bukhari.pdf",
  "category": "religious",
  "genre": "hadith",
  "language": "ru",
  "accessLevel": "free",
  "pageCount": 500
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Book created successfully",
  "book": {
    "_id": "...",
    "bookId": 151,
    ...
  }
}
```

**Note:** `bookId` is auto-generated.

#### PUT /api/admin/books/:id
Update book. **Requires:** `canManageBooks` permission.

**Request Body:** Same as POST (all fields optional).

**Response (200):**
```json
{
  "success": true,
  "message": "Book updated successfully",
  "book": { ... }
}
```

#### DELETE /api/admin/books/:id
Delete book. **Requires:** `canManageBooks` permission.

**Response (200):**
```json
{
  "success": true,
  "message": "Book deleted successfully"
}
```

### Nashids Management

#### GET /api/admin/nashids
Get all nashids with filters and pagination.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `search` (string) - Search by title or artist
- `category` (string) - Filter by category

#### GET /api/admin/nashids/:id
Get single nashid by ID.

#### POST /api/admin/nashids
Create new nashid. **Requires:** `canManageNashids` permission.

**Request Body:**
```json
{
  "title": "Ya Taiba",
  "titleArabic": "يا طيبة",
  "artist": "Maher Zain",
  "artistArabic": "ماهر زين",
  "duration": 240,
  "cover": "https://example.com/covers/ya-taiba.jpg",
  "audioUrl": "https://example.com/audio/ya-taiba.mp3",
  "category": "nasheed",
  "language": "ar",
  "accessLevel": "free"
}
```

**Note:** `nashidId` is auto-generated.

#### PUT /api/admin/nashids/:id
Update nashid. **Requires:** `canManageNashids` permission.

#### DELETE /api/admin/nashids/:id
Delete nashid. **Requires:** `canManageNashids` permission.

### Admins Management

#### GET /api/admin/admins
Get all admins. **Requires:** `canManageAdmins` permission.

**Response (200):**
```json
{
  "success": true,
  "admins": [
    {
      "_id": "...",
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin",
      "permissions": { ... },
      "isActive": true,
      "lastLogin": "2025-01-15T10:00:00.000Z",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/admin/admins
Create new admin. **Requires:** `canManageAdmins` permission.

**Request Body:**
```json
{
  "username": "newadmin",
  "email": "newadmin@example.com",
  "password": "password123",
  "role": "editor",
  "permissions": {
    "canManageBooks": true,
    "canManageNashids": true,
    "canManageUsers": false,
    "canViewAnalytics": true,
    "canManageAdmins": false
  }
}
```

#### PUT /api/admin/admins/:id
Update admin. **Requires:** `canManageAdmins` permission.

**Request Body:** (all fields optional)
```json
{
  "username": "updatedusername",
  "email": "updatedemail@example.com",
  "role": "moderator",
  "permissions": { ... },
  "isActive": true
}
```

**Note:** Cannot deactivate your own account.

#### DELETE /api/admin/admins/:id
Delete admin. **Requires:** `canManageAdmins` permission.

**Note:** Cannot delete your own account.

### Users Management

#### GET /api/admin/users
Get all users with filters. **Requires:** `canManageUsers` permission.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 50)
- `search` (string) - Search by name or telegramId
- `tier` (string) - Filter by subscription tier

#### PATCH /api/admin/users/:id/subscription
Update user subscription. **Requires:** `canManageUsers` permission.

**Request Body:**
```json
{
  "tier": "pro",
  "expiresAt": "2025-02-15T00:00:00.000Z"
}
```

**Valid tiers:** `free`, `pro`, `premium`

**Note:** For free tier, `expiresAt` is set to null. For paid tiers, defaults to 30 days from now if not specified.

### Subscriptions Management

#### GET /api/admin/subscriptions
Get all subscription plans.

**Response (200):**
```json
{
  "success": true,
  "subscriptions": [
    {
      "_id": "...",
      "tier": "free",
      "name": "Free",
      "description": "Basic access",
      "price": {
        "amount": 0,
        "currency": "RUB",
        "period": "monthly"
      },
      "limits": {
        "booksOffline": 3,
        "booksFavorites": 10,
        "nashidsOffline": 5,
        "nashidsFavorites": 20,
        "aiRequestsPerDay": 5
      },
      "access": {
        "freeContent": true,
        "proContent": false,
        "premiumContent": false
      },
      "features": { ... },
      "isActive": true
    }
  ],
  "total": 3
}
```

#### GET /api/admin/subscriptions/:tier
Get specific subscription plan.

#### POST /api/admin/subscriptions
Create new subscription plan. **Requires:** `canManageAdmins` permission.

**Request Body:**
```json
{
  "tier": "elite",
  "name": "Elite",
  "description": "Premium features",
  "price": {
    "amount": 999,
    "currency": "RUB",
    "period": "monthly"
  },
  "limits": {
    "booksOffline": -1,
    "booksFavorites": -1,
    "nashidsOffline": -1,
    "nashidsFavorites": -1,
    "aiRequestsPerDay": 100
  },
  "access": {
    "freeContent": true,
    "proContent": true,
    "premiumContent": true,
    "exclusiveContent": true
  },
  "features": {
    "notes": true,
    "sync": true,
    "backgroundAudio": true,
    "advancedSearch": true,
    "offlineMode": true,
    "familyAccess": true,
    "prioritySupport": true,
    "earlyAccess": true
  },
  "isActive": true
}
```

#### PUT /api/admin/subscriptions/:tier
Update subscription plan. **Requires:** `canManageAdmins` permission.

**Request Body:** Same as POST (all fields optional, except `tier` cannot be changed).

#### DELETE /api/admin/subscriptions/:tier
Delete subscription plan. **Requires:** `canManageAdmins` permission.

**Note:** Cannot delete if users are using this tier.

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (in development mode)"
}
```

### Common Error Codes
- **400** - Bad Request (validation error)
- **401** - Unauthorized (invalid or missing token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **500** - Internal Server Error

## Setup Guide

### 1. Create First Admin

Run the create admin script:

```bash
npx tsx src/scripts/createAdmin.ts
```

Follow the prompts to create your first admin user.

### 2. Login

```bash
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your_password"
  }'
```

Save the returned JWT token.

### 3. Use Token

Include the token in all subsequent requests:

```bash
curl http://localhost:3001/api/admin/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Security Best Practices

1. **Environment Variables**
   - Always set `ADMIN_JWT_SECRET` in production
   - Use a strong, unique secret (minimum 32 characters)

2. **Password Requirements**
   - Minimum 8 characters
   - Passwords are hashed with bcrypt (10 rounds)

3. **Token Expiration**
   - JWT tokens expire after 7 days
   - Refresh tokens by logging in again

4. **Permission Checks**
   - All sensitive operations check permissions
   - Cannot delete or deactivate your own account

5. **HTTPS**
   - Always use HTTPS in production
   - Never send credentials over HTTP

## Integration with Existing Routes

The new `/api/admin` routes are separate from the existing `/api/v1/admin` routes:

- **`/api/v1/admin`** - Telegram-based admin routes (existing)
- **`/api/admin`** - JWT-based admin authentication routes (new)

Both can coexist in the same application.
