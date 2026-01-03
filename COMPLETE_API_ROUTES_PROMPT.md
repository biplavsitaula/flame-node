# Complete API Routes Prompt for Frontend Integration

Use this prompt to integrate all backend API routes into your Next.js frontend.

## Base URL
```
http://localhost:5000/api
```

---

## 🔐 AUTHENTICATION ROUTES (`/api/auth`)

### Public Routes (No Authentication)

**POST /api/auth/register**
- Register a new user
- Body: `{ fullName, email, password, role, mobile }`
- Response: `{ success, message, data: { user, token } }`

**POST /api/auth/login**
- Login with email and password
- Body: `{ email, password }`
- Response: `{ success, message, data: { user, token } }`

### Protected Routes (Require Authentication Token)

**GET /api/auth/profile**
- Get current user's profile
- Headers: `Authorization: Bearer <token>`
- Response: `{ success, message, data: { user } }`

**PUT /api/auth/profile**
- Update current user's profile
- Headers: `Authorization: Bearer <token>`
- Body: `{ fullName, mobile }` (cannot change password or role)
- Response: `{ success, message, data: { user } }`

### Admin Routes (Require Admin/Super Admin Token)

**GET /api/auth/users**
- Get all users
- Headers: `Authorization: Bearer <token>`
- Query: `role, search, isActive, sortBy, sortOrder, page, limit`
- Response: `{ success, message, data: [users], pagination }`

**GET /api/auth/users/:id**
- Get user by ID
- Headers: `Authorization: Bearer <token>`
- Response: `{ success, message, data: { user } }`

**PUT /api/auth/users/:id**
- Update user
- Headers: `Authorization: Bearer <token>`
- Body: `{ fullName, role, isActive }`
- Response: `{ success, message, data: { user } }`

**DELETE /api/auth/users/:id**
- Delete user (Super Admin only)
- Headers: `Authorization: Bearer <token>`
- Response: `{ success, message }`

---

## 📦 PRODUCT ROUTES (`/api/products`)

### Public Routes

**GET /api/products**
- Get all products
- Query: `search, category, status, view, sortBy, sortOrder, page, limit`
- View options: `all, out-of-stock, low-stock, top-sellers, most-reviewed, recommended`
- Response: `{ success, message, data: [products], pagination }`

**GET /api/products/:id**
- Get product by ID
- Response: `{ success, message, data: { product } }`

### Admin Routes (Require Authentication + Admin Role)

**POST /api/products**
- Create product
- Headers: `Authorization: Bearer <token>`
- Body: `{ name, category, brand, price, discountPercent, stock, rating, alcoholPercentage, volume, imageUrl, isRecommended }`
- Response: `{ success, message, data: { product } }`
- Note: `discountAmount` and `finalPrice` are auto-calculated

**PUT /api/products/:id**
- Update product
- Headers: `Authorization: Bearer <token>`
- Body: Same as create
- Response: `{ success, message, data: { product } }`

**DELETE /api/products/:id**
- Delete product
- Headers: `Authorization: Bearer <token>`
- Response: `{ success, message }`

---

## 🛒 ORDER ROUTES (`/api/orders`)

### Public Routes

**GET /api/orders**
- Get all orders
- Query: `search, status, paymentMethod, sortBy, sortOrder, page, limit`
- Response: `{ success, message, data: [orders], pagination }`

**GET /api/orders/:id**
- Get order by ID
- Response: `{ success, message, data: { order } }`

**GET /api/orders/bill/:billNumber**
- Get order by bill number
- Response: `{ success, message, data: { order } }`

### Admin Routes (Require Authentication + Admin Role)

**POST /api/orders**
- Create order
- Headers: `Authorization: Bearer <token>`
- Body: `{ customer: { fullName, mobile, panNumber, location }, items: [{ productId, name, quantity }], paymentMethod }`
- Response: `{ success, message, data: { order } }`
- Note: Automatically decrements stock, creates payment record, generates bill number

**PUT /api/orders/:id**
- Update order status
- Headers: `Authorization: Bearer <token>`
- Body: `{ status }` (placed, in-progress, delivered, completed)
- Response: `{ success, message, data: { order } }`

**DELETE /api/orders/:id**
- Delete order
- Headers: `Authorization: Bearer <token>`
- Response: `{ success, message }`

---

## 💳 PAYMENT ROUTES (`/api/payments`)

### Public Routes

**GET /api/payments**
- Get all payments
- Query: `search, method, status, sortBy, sortOrder, page, limit`
- Response: `{ success, message, data: [payments], pagination }`

**GET /api/payments/summary**
- Get payment summary
- Response: `{ success, message, data: { totalPayments, completed, pending } }`

**GET /api/payments/:id**
- Get payment by ID
- Response: `{ success, message, data: { payment } }`

### Admin Routes (Require Authentication + Admin Role)

**POST /api/payments**
- Create payment
- Headers: `Authorization: Bearer <token>`
- Body: `{ orderId, billNumber, customer: { fullName, mobile }, amount, method, status }`
- Response: `{ success, message, data: { payment } }`

**PUT /api/payments/:id**
- Update payment status
- Headers: `Authorization: Bearer <token>`
- Body: `{ status }` (pending, completed)
- Response: `{ success, message, data: { payment } }`

**DELETE /api/payments/:id**
- Delete payment
- Headers: `Authorization: Bearer <token>`
- Response: `{ success, message }`

---

## 📊 ANALYTICS ROUTES (`/api/analytics`) - Admin Only

All routes require: `Authorization: Bearer <token>` + Admin role

**GET /api/analytics/summary**
- Get analytics summary
- Response: `{ success, message, data: { totalRevenue: { value, growth, previousValue }, totalSales: { value, growth, previousValue }, avgOrderValue: { value, growth, previousValue }, productsSold: { value, growth, previousValue } } }`

**GET /api/analytics/sales-trend**
- Get sales trend (monthly data)
- Response: `{ success, message, data: [{ month, revenue, count }] }`

**GET /api/analytics/stock-by-category**
- Get stock by category
- Response: `{ success, message, data: [{ category, inStock, lowStock, outOfStock }] }`

**GET /api/analytics/products-by-category**
- Get products by category
- Response: `{ success, message, data: [{ category, count, percentage }] }`

**GET /api/analytics/revenue-by-category**
- Get revenue by category
- Response: `{ success, message, data: [{ category, revenue, count, percentage }] }`

---

## ⚠️ STOCK ALERTS ROUTES (`/api/stock-alerts`) - Admin Only

All routes require: `Authorization: Bearer <token>` + Admin role

**GET /api/stock-alerts/out-of-stock**
- Get out of stock products
- Query: `search, category, sortBy, sortOrder, page, limit`
- Response: `{ success, message, data: [products], pagination }`

**GET /api/stock-alerts/low-stock**
- Get low stock products
- Query: `threshold (default: 10), search, category, sortBy, sortOrder, page, limit`
- Response: `{ success, message, data: [products with remainingUnits], pagination }`

**GET /api/stock-alerts/all**
- Get all stock alerts grouped by type
- Query: `threshold (default: 10)`
- Response: `{ success, message, data: { outOfStock: { count, products }, goingToBeOutOfStock: { count, products }, lowStock: { count, products } } }`

**GET /api/stock-alerts/reorder-report**
- Generate reorder report
- Query: `threshold (default: 10)`
- Response: `{ success, message, data: { generatedAt, threshold, outOfStock: { count, products }, lowStock: { count, products }, totalProductsNeedingReorder } }`

**PUT /api/stock-alerts/reorder/:id**
- Reorder product (update stock)
- Headers: `Authorization: Bearer <token>`
- Body: `{ quantity }`
- Response: `{ success, message, data: { product } }`

---

## 🏆 TOP SELLERS ROUTES (`/api/top-sellers`) - Admin Only

All routes require: `Authorization: Bearer <token>` + Admin role

**GET /api/top-sellers/products**
- Get top selling products
- Query: `search, category, sortBy (default: totalSold), sortOrder, page, limit`
- Response: `{ success, message, data: [products with rank], pagination }`

**GET /api/top-sellers/insights**
- Get sales insights
- Response: `{ success, message, data: { trendingCategory: { category, growth, unitsSold }, bestCategory: { category, unitsSold }, peakSalesDay: { day, percentage, orderCount } } }`

---

## ⭐ REVIEW ROUTES (`/api/reviews`)

### Public Routes

**GET /api/reviews**
- Get all reviews
- Query: `search, productId, rating, sortBy, sortOrder, page, limit`
- Response: `{ success, message, data: [reviews], pagination }`

**GET /api/reviews/summary**
- Get review summary
- Response: `{ success, message, data: { totalReviews, averageRating, ratingDistribution: { 5, 4, 3, 2, 1 } } }`

**GET /api/reviews/most-reviewed**
- Get most reviewed products
- Query: `limit (default: 5)`
- Response: `{ success, message, data: [products with rank] }`

**POST /api/reviews**
- Create review
- Body: `{ productId, customerName, rating, comment }`
- Response: `{ success, message, data: { review } }`
- Note: Automatically updates product rating

### Admin Routes (Require Authentication + Admin Role)

**PUT /api/reviews/:id**
- Update review
- Headers: `Authorization: Bearer <token>`
- Body: `{ rating, comment }`
- Response: `{ success, message, data: { review } }`

**DELETE /api/reviews/:id**
- Delete review
- Headers: `Authorization: Bearer <token>`
- Response: `{ success, message }`

---

## 🔔 NOTIFICATION ROUTES (`/api/notifications`) - Admin Only

All routes require: `Authorization: Bearer <token>` + Admin role

**GET /api/notifications**
- Get all notifications
- Query: `type, isRead, sortBy, sortOrder, page, limit`
- Response: `{ success, message, data: [notifications], pagination, unreadCount }`

**GET /api/notifications/unread-count**
- Get unread notification count
- Response: `{ success, message, data: { unreadCount } }`

**GET /api/notifications/:id**
- Get notification by ID
- Response: `{ success, message, data: { notification } }`

**POST /api/notifications**
- Create notification
- Body: `{ type, title, message, relatedId, relatedModel, priority }`
- Response: `{ success, message, data: { notification } }`

**PUT /api/notifications/:id/read**
- Mark notification as read
- Response: `{ success, message, data: { notification } }`

**PUT /api/notifications/read-all**
- Mark all notifications as read
- Response: `{ success, message }`

**DELETE /api/notifications/:id**
- Delete notification
- Response: `{ success, message }`

---

## 📥 EXPORT ROUTES (`/api/export`) - Admin Only

**GET /api/export/monthly**
- Export monthly data
- Headers: `Authorization: Bearer <token>` + Admin role
- Query: `year (required), month (required), type (required: excel|pdf)`
- Response: File download (Excel or PDF)

---

## 📝 AUTHENTICATION REQUIREMENTS

### Token Format
```
Authorization: Bearer <jwt_token>
```

### Role-Based Access
- **Public Routes:** No token required (Products GET, Reviews GET/POST, Orders GET, Payments GET)
- **Protected Routes:** Token required (Profile, some GET routes)
- **Admin Routes:** Token + Admin or Super Admin role required
- **Super Admin Routes:** Token + Super Admin role required (Delete users)

### Getting Token
1. Register: `POST /api/auth/register` → Returns token
2. Login: `POST /api/auth/login` → Returns token
3. Store token in localStorage or httpOnly cookie
4. Include in all protected/admin route requests

---

## 🔄 RESPONSE FORMAT

All endpoints return consistent format:
```json
{
  "success": boolean,
  "message": "string",
  "data": any,
  "pagination": {  // For paginated endpoints
    "page": number,
    "limit": number,
    "total": number,
    "pages": number
  }
}
```

---

## ⚠️ ERROR RESPONSES

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Not authorized. No token provided."
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Error message here"
}
```

---

## 💡 IMPLEMENTATION GUIDE

### 1. API Client Setup
```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token'); // or from cookie
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export const api = {
  auth: {
    register: (data) => fetch(`${API_BASE_URL}/auth/register`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }),
    login: (data) => fetch(`${API_BASE_URL}/auth/login`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }),
    getProfile: () => fetch(`${API_BASE_URL}/auth/profile`, { headers: getAuthHeaders() }),
    // ... other auth endpoints
  },
  products: {
    getAll: (params) => fetch(`${API_BASE_URL}/products?${new URLSearchParams(params)}`),
    getById: (id) => fetch(`${API_BASE_URL}/products/${id}`),
    create: (data) => fetch(`${API_BASE_URL}/products`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }),
    // ... other product endpoints
  },
  // ... similar for other resources
};
```

### 2. Error Handling
- Handle 401: Redirect to login, clear token
- Handle 403: Show "Access Denied" message
- Handle 400: Show validation errors
- Handle 500: Show generic error message

### 3. Token Management
- Store token after login/register
- Include in all protected requests
- Refresh token if expired (implement refresh logic if needed)
- Clear token on logout

---

**Use this prompt to build your complete frontend API integration layer with proper authentication, error handling, and TypeScript types.**


