# Complete API Endpoints Prompt for Frontend Integration

Use this prompt to integrate all backend APIs into your Next.js frontend.

## Base URL
```
http://localhost:5000/api
```

---

## 🔐 AUTHENTICATION APIs

### Register User
```
POST /api/auth/register
```
**Body:**
```json
{
  "fullName": "John Admin",
  "email": "admin@example.com",
  "password": "Admin123!",
  "role": "admin",
  "mobile": "9841234567"
}
```
**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { "_id", "fullName", "email", "role", "mobile", "isActive" },
    "token": "jwt_token_here"
  }
}
```

### Login
```
POST /api/auth/login
```
**Body:**
```json
{
  "email": "admin@example.com",
  "password": "Admin123!"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "_id", "fullName", "email", "role", "lastLogin" },
    "token": "jwt_token_here"
  }
}
```

### Get Profile (Protected)
```
GET /api/auth/profile
Headers: Authorization: Bearer <token>
```

### Update Profile (Protected)
```
PUT /api/auth/profile
Headers: Authorization: Bearer <token>
Body: { "fullName", "mobile" }
```

### Get All Users (Admin Only)
```
GET /api/auth/users?role=admin&search=john&page=1&limit=10
Headers: Authorization: Bearer <token>
```

### Get User by ID (Admin Only)
```
GET /api/auth/users/:id
Headers: Authorization: Bearer <token>
```

### Update User (Admin Only)
```
PUT /api/auth/users/:id
Headers: Authorization: Bearer <token>
Body: { "fullName", "role", "isActive" }
```

### Delete User (Super Admin Only)
```
DELETE /api/auth/users/:id
Headers: Authorization: Bearer <token>
```

---

## 📦 PRODUCT APIs

### Get All Products
```
GET /api/products?search=rum&category=Whiskey&status=In Stock&view=all&sortBy=price&sortOrder=desc&page=1&limit=10
```
**Query Params:** search, category, status, view (all|out-of-stock|low-stock|top-sellers|most-reviewed|recommended), sortBy, sortOrder, page, limit

### Get Product by ID
```
GET /api/products/:id
```

### Create Product (Admin)
```
POST /api/products
Headers: Authorization: Bearer <token>
Body: {
  "name": "Product Name",
  "category": "Whiskey",
  "brand": "Brand Name",
  "price": 29.99,
  "discountPercent": 10,
  "stock": 50,
  "rating": 4.5,
  "alcoholPercentage": 40,
  "volume": "750ml",
  "imageUrl": "https://example.com/image.jpg",
  "isRecommended": false
}
```

### Update Product (Admin)
```
PUT /api/products/:id
Headers: Authorization: Bearer <token>
Body: { same as create }
```

### Delete Product (Admin)
```
DELETE /api/products/:id
Headers: Authorization: Bearer <token>
```

---

## 🛒 ORDER APIs

### Get All Orders
```
GET /api/orders?search=john&status=completed&paymentMethod=QR Payment&sortBy=createdAt&sortOrder=desc&page=1&limit=10
Headers: Authorization: Bearer <token>
```

### Get Order by ID
```
GET /api/orders/:id
Headers: Authorization: Bearer <token>
```

### Get Order by Bill Number
```
GET /api/orders/bill/:billNumber
Headers: Authorization: Bearer <token>
```

### Create Order (Admin)
```
POST /api/orders
Headers: Authorization: Bearer <token>
Body: {
  "customer": {
    "fullName": "John Doe",
    "mobile": "9841234567",
    "panNumber": "ABCDE1234F",
    "location": "Kathmandu, Nepal"
  },
  "items": [
    {
      "productId": "product_id_here",
      "name": "Product Name",
      "quantity": 2
    }
  ],
  "paymentMethod": "QR Payment"
}
```

### Update Order Status (Admin)
```
PUT /api/orders/:id
Headers: Authorization: Bearer <token>
Body: { "status": "in-progress" }
```
**Valid statuses:** placed, in-progress, delivered, completed

### Delete Order (Admin)
```
DELETE /api/orders/:id
Headers: Authorization: Bearer <token>
```

---

## 💳 PAYMENT APIs

### Get All Payments
```
GET /api/payments?search=john&method=QR Payment&status=completed&sortBy=createdAt&sortOrder=desc&page=1&limit=10
Headers: Authorization: Bearer <token>
```

### Get Payment Summary
```
GET /api/payments/summary
Headers: Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "totalPayments": 1306.87,
    "completed": 1119.95,
    "pending": 186.92
  }
}
```

### Get Payment by ID
```
GET /api/payments/:id
Headers: Authorization: Bearer <token>
```

### Create Payment (Admin)
```
POST /api/payments
Headers: Authorization: Bearer <token>
Body: {
  "orderId": "order_id",
  "billNumber": "FB-2024-001",
  "customer": { "fullName", "mobile" },
  "amount": 99.95,
  "method": "QR Payment",
  "status": "completed"
}
```

### Update Payment Status (Admin)
```
PUT /api/payments/:id
Headers: Authorization: Bearer <token>
Body: { "status": "completed" }
```

### Delete Payment (Admin)
```
DELETE /api/payments/:id
Headers: Authorization: Bearer <token>
```

---

## 📊 ANALYTICS APIs (Admin Only)

### Get Analytics Summary
```
GET /api/analytics/summary
Headers: Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": { "value": 1114000, "growth": 15, "previousValue": 968000 },
    "totalSales": { "value": 29800, "growth": 8, "previousValue": 27500 },
    "avgOrderValue": { "value": 37.40, "growth": 3, "previousValue": 36.30 },
    "productsSold": { "value": 1847, "growth": 12, "previousValue": 1648 }
  }
}
```

### Get Sales Trend
```
GET /api/analytics/sales-trend
Headers: Authorization: Bearer <token>
```
**Response:** Monthly sales data array (Jan-Dec)

### Get Stock by Category
```
GET /api/analytics/stock-by-category
Headers: Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "category": "Whiskey",
      "inStock": 45,
      "lowStock": 8,
      "outOfStock": 2
    }
  ]
}
```

### Get Products by Category
```
GET /api/analytics/products-by-category
Headers: Authorization: Bearer <token>
```

### Get Revenue by Category
```
GET /api/analytics/revenue-by-category
Headers: Authorization: Bearer <token>
```

---

## ⚠️ STOCK ALERTS APIs (Admin Only)

### Get Out of Stock Products
```
GET /api/stock-alerts/out-of-stock?search=vodka&category=Vodka&page=1&limit=10
Headers: Authorization: Bearer <token>
```

### Get Low Stock Products
```
GET /api/stock-alerts/low-stock?threshold=10&search=&page=1&limit=10
Headers: Authorization: Bearer <token>
```

### Get All Stock Alerts
```
GET /api/stock-alerts/all?threshold=10
Headers: Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "outOfStock": { "count": 2, "products": [...] },
    "goingToBeOutOfStock": { "count": 2, "products": [...] },
    "lowStock": { "count": 2, "products": [...] }
  }
}
```

### Generate Reorder Report
```
GET /api/stock-alerts/reorder-report?threshold=10
Headers: Authorization: Bearer <token>
```

### Reorder Product (Update Stock)
```
PUT /api/stock-alerts/reorder/:id
Headers: Authorization: Bearer <token>
Body: { "quantity": 50 }
```

---

## 🏆 TOP SELLERS APIs (Admin Only)

### Get Top Selling Products
```
GET /api/top-sellers/products?search=rum&category=Rum&sortBy=totalSold&sortOrder=desc&page=1&limit=10
Headers: Authorization: Bearer <token>
```
**Response includes:** rank, status fields

### Get Sales Insights
```
GET /api/top-sellers/insights
Headers: Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "trendingCategory": { "category": "Whiskey", "growth": 23, "unitsSold": 567 },
    "bestCategory": { "category": "Rum", "unitsSold": 567 },
    "peakSalesDay": { "day": "Saturday", "percentage": 45, "orderCount": 134 }
  }
}
```

---

## ⭐ REVIEW APIs

### Get All Reviews
```
GET /api/reviews?search=john&productId=product_id&rating=5&sortBy=createdAt&sortOrder=desc&page=1&limit=10
```

### Get Review Summary
```
GET /api/reviews/summary
```
**Response:**
```json
{
  "success": true,
  "data": {
    "totalReviews": 1699,
    "averageRating": 4.7,
    "ratingDistribution": { "5": 892, "4": 489, "3": 204, "2": 85, "1": 29 }
  }
}
```

### Get Most Reviewed Products
```
GET /api/reviews/most-reviewed?limit=5
```

### Create Review
```
POST /api/reviews
Body: {
  "productId": "product_id",
  "customerName": "John Doe",
  "rating": 5,
  "comment": "Great product!"
}
```

### Update Review (Admin)
```
PUT /api/reviews/:id
Headers: Authorization: Bearer <token>
```

### Delete Review (Admin)
```
DELETE /api/reviews/:id
Headers: Authorization: Bearer <token>
```

---

## 🔔 NOTIFICATION APIs (Admin Only)

### Get All Notifications
```
GET /api/notifications?type=Low Stock Alert&isRead=false&sortBy=createdAt&sortOrder=desc&page=1&limit=20
Headers: Authorization: Bearer <token>
```
**Response includes:** unreadCount

### Get Unread Count
```
GET /api/notifications/unread-count
Headers: Authorization: Bearer <token>
```

### Get Notification by ID
```
GET /api/notifications/:id
Headers: Authorization: Bearer <token>
```

### Create Notification (Admin)
```
POST /api/notifications
Headers: Authorization: Bearer <token>
Body: {
  "type": "Low Stock Alert",
  "title": "Low Stock Alert",
  "message": "Product is running low",
  "relatedId": "product_id",
  "relatedModel": "Product",
  "priority": "high"
}
```

### Mark Notification as Read
```
PUT /api/notifications/:id/read
Headers: Authorization: Bearer <token>
```

### Mark All Notifications as Read
```
PUT /api/notifications/read-all
Headers: Authorization: Bearer <token>
```

### Delete Notification (Admin)
```
DELETE /api/notifications/:id
Headers: Authorization: Bearer <token>
```

---

## 📥 EXPORT APIs (Admin Only)

### Export Monthly Data (Excel)
```
GET /api/export/monthly?year=2024&month=12&type=excel
Headers: Authorization: Bearer <token>
```
**Response:** Excel file download

### Export Monthly Data (PDF)
```
GET /api/export/monthly?year=2024&month=12&type=pdf
Headers: Authorization: Bearer <token>
```
**Response:** PDF file download

---

## 📝 API RESPONSE FORMAT

All APIs return consistent format:
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

## 🔑 AUTHENTICATION

**Protected Routes:** Include JWT token in headers
```
Authorization: Bearer <token>
```

**Token Storage:** Store token from login/register response
- Use httpOnly cookies or localStorage
- Include in all protected API requests

---

## 🎯 ROLE-BASED ACCESS

- **Public Routes:** Products (GET), Reviews (GET, POST)
- **Admin Routes:** All POST, PUT, DELETE operations, Analytics, Stock Alerts, Top Sellers
- **Super Admin:** Can delete users
- **Vendor:** Customize permissions as needed

---

## 💡 IMPLEMENTATION TIPS

1. **API Client:** Create centralized API client with base URL and token injection
2. **Error Handling:** Handle 401 (unauthorized) by redirecting to login
3. **Token Refresh:** Implement token refresh logic if needed
4. **Loading States:** Show loading indicators during API calls
5. **Error Messages:** Display user-friendly error messages
6. **Pagination:** Implement pagination for all list endpoints
7. **Search/Filter:** Debounce search inputs for better performance
8. **Real-time Updates:** Poll notifications every 30 seconds

---

## 📋 QUICK REFERENCE

**Authentication:**
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/profile (Protected)

**Products:**
- GET /api/products (Public)
- POST /api/products (Admin)
- PUT /api/products/:id (Admin)
- DELETE /api/products/:id (Admin)

**Orders:**
- GET /api/orders (Protected)
- POST /api/orders (Admin)
- PUT /api/orders/:id (Admin)

**Payments:**
- GET /api/payments (Protected)
- GET /api/payments/summary (Protected)
- PUT /api/payments/:id (Admin)

**Analytics:**
- GET /api/analytics/summary (Admin)
- GET /api/analytics/sales-trend (Admin)
- GET /api/analytics/stock-by-category (Admin)

**Stock Alerts:**
- GET /api/stock-alerts/all (Admin)
- PUT /api/stock-alerts/reorder/:id (Admin)

**Top Sellers:**
- GET /api/top-sellers/products (Admin)
- GET /api/top-sellers/insights (Admin)

**Reviews:**
- GET /api/reviews (Public)
- GET /api/reviews/summary (Public)
- POST /api/reviews (Public)

**Notifications:**
- GET /api/notifications (Admin)
- PUT /api/notifications/:id/read (Admin)

**Export:**
- GET /api/export/monthly?year=2024&month=12&type=excel (Admin)

---

**Use this prompt to build your frontend API integration layer with proper TypeScript types, error handling, and authentication.**





