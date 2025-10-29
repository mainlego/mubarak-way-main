# Admin Panel Setup Guide

## Quick Start

### 1. Create Your First Admin

```bash
# Navigate to backend directory
cd mubarak-way-unified/backend

# Run the create admin script
npx tsx src/scripts/createAdmin.ts
```

You'll be prompted for:
- **Username** - Admin login username
- **Email** - Admin email address
- **Password** - Password (minimum 8 characters)
- **Role** - Choose: `admin`, `moderator`, or `editor`

### 2. Test Your Admin Login

```bash
# Login to get JWT token
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "password": "your_password"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "...",
    "username": "your_username",
    "email": "your_email",
    "role": "admin",
    "permissions": { ... }
  }
}
```

### 3. Verify Token

```bash
# Replace YOUR_TOKEN with the token from step 2
curl http://localhost:3001/api/admin/verify \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Get Dashboard Stats

```bash
curl http://localhost:3001/api/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Environment Variables

Add to your `.env` file:

```env
# Admin JWT Secret (use a strong secret in production)
ADMIN_JWT_SECRET=mubarakway-admin-secret-2025
```

**Production:** Generate a strong secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Admin Roles & Permissions

### Admin (Full Access)
```json
{
  "canManageBooks": true,
  "canManageNashids": true,
  "canManageUsers": true,
  "canViewAnalytics": true,
  "canManageAdmins": true
}
```

### Moderator (Content + Users)
```json
{
  "canManageBooks": true,
  "canManageNashids": true,
  "canManageUsers": true,
  "canViewAnalytics": true,
  "canManageAdmins": false
}
```

### Editor (Content Only)
```json
{
  "canManageBooks": true,
  "canManageNashids": true,
  "canManageUsers": false,
  "canViewAnalytics": true,
  "canManageAdmins": false
}
```

## API Endpoints Overview

### Authentication
- `POST /api/admin/login` - Login
- `GET /api/admin/verify` - Verify token
- `PUT /api/admin/profile` - Update profile
- `PUT /api/admin/password` - Change password

### Management
- `GET /api/admin/stats` - Dashboard stats
- `GET/POST/PUT/DELETE /api/admin/books` - Books CRUD
- `GET/POST/PUT/DELETE /api/admin/nashids` - Nashids CRUD
- `GET/POST/PUT/DELETE /api/admin/admins` - Admins CRUD
- `GET/PATCH /api/admin/users` - Users management
- `GET/POST/PUT/DELETE /api/admin/subscriptions` - Subscription plans CRUD

## Common Tasks

### Create a Book

```bash
curl -X POST http://localhost:3001/api/admin/books \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sahih Bukhari",
    "titleArabic": "صحيح البخاري",
    "author": "Imam Bukhari",
    "description": "The most authentic hadith collection",
    "cover": "https://example.com/covers/bukhari.jpg",
    "content": "https://example.com/books/bukhari.pdf",
    "category": "religious",
    "genre": "hadith",
    "language": "ru",
    "accessLevel": "free",
    "pageCount": 500
  }'
```

### Create a Nashid

```bash
curl -X POST http://localhost:3001/api/admin/nashids \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ya Taiba",
    "artist": "Maher Zain",
    "duration": 240,
    "cover": "https://example.com/covers/ya-taiba.jpg",
    "audioUrl": "https://example.com/audio/ya-taiba.mp3",
    "category": "nasheed",
    "language": "ar",
    "accessLevel": "free"
  }'
```

### Update User Subscription

```bash
curl -X PATCH http://localhost:3001/api/admin/users/USER_ID/subscription \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "pro",
    "expiresAt": "2025-02-15T00:00:00.000Z"
  }'
```

### Create Another Admin

```bash
curl -X POST http://localhost:3001/api/admin/admins \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "editor1",
    "email": "editor1@example.com",
    "password": "password123",
    "role": "editor",
    "permissions": {
      "canManageBooks": true,
      "canManageNashids": true,
      "canManageUsers": false,
      "canViewAnalytics": true,
      "canManageAdmins": false
    }
  }'
```

## Troubleshooting

### "No token provided" Error
- Make sure you're including the Authorization header
- Format: `Authorization: Bearer YOUR_TOKEN`
- Don't include quotes around the token

### "Invalid credentials" Error
- Double-check username and password
- Passwords are case-sensitive
- Make sure admin is active (`isActive: true`)

### "No permission" Error
- Check admin permissions with `GET /api/admin/verify`
- Only admins with specific permissions can perform certain actions
- Contact a super admin to update your permissions

### Token Expired
- JWT tokens expire after 7 days
- Login again to get a new token: `POST /api/admin/login`

## Integration Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/admin';

class AdminAPI {
  private token: string | null = null;

  async login(username: string, password: string) {
    const response = await axios.post(`${API_URL}/login`, {
      username,
      password
    });
    this.token = response.data.token;
    return response.data;
  }

  async getStats() {
    const response = await axios.get(`${API_URL}/stats`, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    });
    return response.data;
  }

  async createBook(bookData: any) {
    const response = await axios.post(`${API_URL}/books`, bookData, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    });
    return response.data;
  }
}

// Usage
const api = new AdminAPI();
await api.login('admin', 'password123');
const stats = await api.getStats();
```

### Python

```python
import requests

class AdminAPI:
    def __init__(self, base_url='http://localhost:3001/api/admin'):
        self.base_url = base_url
        self.token = None

    def login(self, username, password):
        response = requests.post(f'{self.base_url}/login', json={
            'username': username,
            'password': password
        })
        data = response.json()
        self.token = data['token']
        return data

    def get_stats(self):
        response = requests.get(f'{self.base_url}/stats', headers={
            'Authorization': f'Bearer {self.token}'
        })
        return response.json()

    def create_book(self, book_data):
        response = requests.post(f'{self.base_url}/books', json=book_data, headers={
            'Authorization': f'Bearer {self.token}'
        })
        return response.json()

# Usage
api = AdminAPI()
api.login('admin', 'password123')
stats = api.get_stats()
```

## Security Checklist

- [ ] Set strong `ADMIN_JWT_SECRET` in production
- [ ] Use HTTPS in production
- [ ] Use strong passwords (minimum 8 characters)
- [ ] Regularly review admin access and permissions
- [ ] Monitor admin activity logs
- [ ] Revoke access for inactive admins
- [ ] Don't share admin credentials
- [ ] Store tokens securely (never in git, logs, or client storage)

## Next Steps

1. **Set up admin panel frontend** - Create a React/Vue admin dashboard
2. **Add logging** - Log all admin actions for audit trail
3. **Add 2FA** - Implement two-factor authentication
4. **Rate limiting** - Add rate limiting to prevent brute force attacks
5. **Email notifications** - Send email on critical admin actions

## Full API Documentation

See [ADMIN_AUTH_API.md](./ADMIN_AUTH_API.md) for complete API documentation.
