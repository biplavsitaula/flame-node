# Authentication API Documentation

## Base URL
```
http://localhost:5000/api
```

---

## 🔐 AUTHENTICATION ENDPOINTS

### 1. Register User
```
POST /api/auth/register
```

**Description:** Register a new user (admin, super_admin, or vendor).

**Request Body:**
```json
{
  "fullName": "John Admin",
  "email": "admin@flamebeverage.com",
  "password": "Admin123!",
  "role": "admin",
  "mobile": "9841234567"
}
```

**Fields:**
- `fullName` (required) - User's full name
- `email` (required, unique) - User's email address
- `password` (required, min 6 chars) - User's password
- `role` (required) - User role: "admin", "super_admin", or "vendor"
- `mobile` (optional) - User's mobile number

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "fullName": "John Admin",
      "email": "admin@flamebeverage.com",
      "role": "admin",
      "mobile": "9841234567",
      "isActive": true,
      "createdAt": "2024-12-16T10:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

---

### 2. Login User
```
POST /api/auth/login
```

**Description:** Login with email and password.

**Request Body:**
```json
{
  "email": "admin@flamebeverage.com",
  "password": "Admin123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "fullName": "John Admin",
      "email": "admin@flamebeverage.com",
      "role": "admin",
      "mobile": "9841234567",
      "isActive": true,
      "lastLogin": "2024-12-16T10:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### 3. Get Profile (Protected)
```
GET /api/auth/profile
```

**Description:** Get current user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "_id": "user_id",
    "fullName": "John Admin",
    "email": "admin@flamebeverage.com",
    "role": "admin",
    "mobile": "9841234567",
    "isActive": true,
    "lastLogin": "2024-12-16T10:00:00.000Z",
    "createdAt": "2024-12-01T10:00:00.000Z"
  }
}
```

---

### 4. Update Profile (Protected)
```
PUT /api/auth/profile
```

**Description:** Update current user's profile (cannot change password or role).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fullName": "John Updated",
  "mobile": "9841234568"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "user_id",
    "fullName": "John Updated",
    "email": "admin@flamebeverage.com",
    "role": "admin",
    "mobile": "9841234568",
    "isActive": true
  }
}
```

---

## 👥 USER MANAGEMENT (Admin Only)

### 5. Get All Users
```
GET /api/auth/users
```

**Description:** Get all users (admin and super_admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `role` - Filter by role (admin, super_admin, vendor)
- `search` - Search by name or email
- `isActive` - Filter by active status (true/false)
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - Sort order (asc/desc, default: desc)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [
    {
      "_id": "user_id",
      "fullName": "John Admin",
      "email": "admin@flamebeverage.com",
      "role": "admin",
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 10,
    "pages": 1
  }
}
```

---

### 6. Get User by ID
```
GET /api/auth/users/:id
```

**Description:** Get user by ID (admin and super_admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "_id": "user_id",
    "fullName": "John Admin",
    "email": "admin@flamebeverage.com",
    "role": "admin",
    "isActive": true
  }
}
```

---

### 7. Update User
```
PUT /api/auth/users/:id
```

**Description:** Update user (admin and super_admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fullName": "Updated Name",
  "role": "admin",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "_id": "user_id",
    "fullName": "Updated Name",
    "email": "admin@flamebeverage.com",
    "role": "admin",
    "isActive": true
  }
}
```

---

### 8. Delete User
```
DELETE /api/auth/users/:id
```

**Description:** Delete user (super_admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 🔑 USER ROLES

### Role Hierarchy:
1. **super_admin** - Full access, can delete users
2. **admin** - Can manage products, orders, payments, analytics, etc.
3. **vendor** - Limited access (can be customized)

### Role Permissions:

**Super Admin:**
- All admin permissions
- Can delete users
- Can manage all users

**Admin:**
- Can access all admin panel features
- Can manage products, orders, payments
- Can view analytics
- Cannot delete users

**Vendor:**
- Limited access (customize as needed)

---

## 🛡️ AUTHENTICATION MIDDLEWARE

### Available Middleware:

1. **authenticate** - Verify JWT token
2. **checkAdmin** - Require admin or super_admin role
3. **checkSuperAdmin** - Require super_admin role only
4. **checkVendor** - Require vendor role only
5. **checkAnyRole** - Require any valid role

### Usage in Routes:

```javascript
import { authenticate, checkAdmin, checkSuperAdmin } from "../middleware/auth.middleware.js";

// Protected route
router.get("/protected", authenticate, handler);

// Admin only route
router.get("/admin-only", authenticate, checkAdmin, handler);

// Super admin only route
router.delete("/super-admin-only", authenticate, checkSuperAdmin, handler);
```

---

## 📝 USAGE EXAMPLES

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Admin",
    "email": "admin@example.com",
    "password": "Admin123!",
    "role": "admin",
    "mobile": "9841234567"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'
```

### Get Profile
```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get All Users (Admin)
```bash
curl http://localhost:5000/api/auth/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔒 SECURITY NOTES

1. **JWT Secret:** Set `JWT_SECRET` in `.env` file
2. **Token Expiry:** Set `JWT_EXPIRE` in `.env` (default: 30d)
3. **Password:** Minimum 6 characters (enforced)
4. **Password Hashing:** Uses bcryptjs with salt rounds of 10
5. **Token Storage:** Store token in httpOnly cookies or secure storage

---

## 🌱 SEEDING USERS

Run the user seeder to create default users:

```bash
npm run seed:users
```

**Default Users Created:**
- **Super Admin:** superadmin@flamebeverage.com (password: SuperAdmin123!)
- **Admin Users:** admin1@flamebeverage.com, admin2@flamebeverage.com (password: Admin123!)
- **Vendor Users:** vendor1@flamebeverage.com, vendor2@flamebeverage.com (password: Vendor123!)

---

## ⚠️ ERROR RESPONSES

All errors follow this format:
```json
{
  "success": false,
  "message": "Error message here"
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error





