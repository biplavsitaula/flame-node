# Flame Beverage Admin Panel - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All admin routes require the `checkAdmin` middleware. Currently, it's a placeholder. Implement proper authentication as needed.

---

## 📦 PRODUCTS

### Get All Products
```
GET /products
```

**Query Parameters:**
- `search` - Search by name, category, or brand
- `category` - Filter by category
- `status` - Filter by status (Out of Stock, Low Stock, In Stock)
- `view` - View type (all, out-of-stock, low-stock, top-sellers, most-reviewed, recommended)
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - Sort order (asc/desc, default: desc)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Get Product by ID
```
GET /products/:id
```

### Create Product (Admin)
```
POST /products
```

**Body:**
```json
{
  "name": "Captain Morgan Spiced",
  "category": "Rum",
  "brand": "Captain Morgan",
  "price": 19.99,
  "discountPercent": 10,
  "stock": 89,
  "rating": 4.3,
  "alcoholPercentage": 35,
  "volume": "750ml",
  "imageUrl": "https://example.com/image.jpg",
  "isRecommended": false
}
```

**Note:** `discountAmount` and `finalPrice` are automatically calculated.

### Update Product (Admin)
```
PUT /products/:id
```

### Delete Product (Admin)
```
DELETE /products/:id
```

---

## 🛒 ORDERS

### Get All Orders
```
GET /orders
```

**Query Parameters:**
- `search` - Search by bill number, customer name, or location
- `status` - Filter by status (placed, in-progress, delivered, completed)
- `paymentMethod` - Filter by payment method (QR Payment, COD)
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - Sort order (asc/desc)
- `page`, `limit` - Pagination

### Get Order by ID
```
GET /orders/:id
```

### Get Order by Bill Number
```
GET /orders/bill/:billNumber
```

### Create Order (Admin)
```
POST /orders
```

**Body:**
```json
{
  "customer": {
    "fullName": "John Doe",
    "mobile": "1234567890",
    "panNumber": "ABCDE1234F",
    "location": "Kathmandu, Nepal"
  },
  "items": [
    {
      "productId": "product_id_here",
      "name": "Captain Morgan Spiced",
      "quantity": 2
    }
  ],
  "paymentMethod": "QR Payment"
}
```

**Note:** Stock is automatically decremented, sales incremented, and payment record created.

### Update Order Status (Admin)
```
PUT /orders/:id
```

**Body:**
```json
{
  "status": "in-progress"
}
```

**Valid statuses:** placed, in-progress, delivered, completed

### Delete Order (Admin)
```
DELETE /orders/:id
```

---

## 💳 PAYMENTS

### Get All Payments
```
GET /payments
```

**Query Parameters:**
- `search` - Search by bill number or customer name
- `method` - Filter by method (QR Payment, COD)
- `status` - Filter by status (pending, completed)
- `sortBy`, `sortOrder`, `page`, `limit`

### Get Payment Summary
```
GET /payments/summary
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
GET /payments/:id
```

### Create Payment (Admin)
```
POST /payments
```

**Body:**
```json
{
  "orderId": "order_id_here",
  "billNumber": "FB-2024-001",
  "customer": {
    "fullName": "John Doe",
    "mobile": "1234567890"
  },
  "amount": 99.95,
  "method": "QR Payment",
  "status": "completed"
}
```

### Update Payment Status (Admin)
```
PUT /payments/:id
```

**Body:**
```json
{
  "status": "completed"
}
```

### Delete Payment (Admin)
```
DELETE /payments/:id
```

---

## 📊 ANALYTICS

### Get Analytics Summary
```
GET /analytics/summary
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": {
      "value": 1114000,
      "growth": 15,
      "previousValue": 968000
    },
    "totalSales": {
      "value": 29800,
      "growth": 8,
      "previousValue": 27500
    },
    "avgOrderValue": {
      "value": 37.40,
      "growth": 3,
      "previousValue": 36.30
    },
    "productsSold": {
      "value": 1847,
      "growth": 12,
      "previousValue": 1648
    }
  }
}
```

### Get Sales Trend
```
GET /analytics/sales-trend
```

**Response:** Monthly sales data (Jan-Dec)

### Get Stock by Category
```
GET /analytics/stock-by-category
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
GET /analytics/products-by-category
```

### Get Revenue by Category
```
GET /analytics/revenue-by-category
```

---

## ⚠️ STOCK ALERTS

### Get Out of Stock Products
```
GET /stock-alerts/out-of-stock
```

**Query Parameters:** `search`, `category`, `sortBy`, `sortOrder`, `page`, `limit`

### Get Low Stock Products
```
GET /stock-alerts/low-stock
```

**Query Parameters:** `threshold` (default: 10), `search`, `category`, etc.

### Get All Stock Alerts
```
GET /stock-alerts/all
```

**Query Parameters:** `threshold` (default: 10)

### Generate Reorder Report
```
GET /stock-alerts/reorder-report
```

**Query Parameters:** `threshold` (default: 10)

### Reorder Product (Update Stock)
```
PUT /stock-alerts/reorder/:id
```

**Body:**
```json
{
  "quantity": 50
}
```

---

## 🏆 TOP SELLERS

### Get Top Selling Products
```
GET /top-sellers/products
```

**Query Parameters:** `search`, `category`, `sortBy` (default: totalSold), `sortOrder`, `page`, `limit`

### Get Sales Insights
```
GET /top-sellers/insights
```

**Response:**
```json
{
  "success": true,
  "data": {
    "trendingCategory": {
      "category": "Whiskey",
      "growth": 23,
      "unitsSold": 567
    },
    "bestCategory": {
      "category": "Rum",
      "unitsSold": 567
    },
    "peakSalesDay": {
      "day": "Saturday",
      "percentage": 45,
      "orderCount": 134
    }
  }
}
```

---

## ⭐ REVIEWS

### Get All Reviews
```
GET /reviews
```

**Query Parameters:** `search`, `productId`, `rating`, `sortBy`, `sortOrder`, `page`, `limit`

### Get Review Summary
```
GET /reviews/summary
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalReviews": 1699,
    "averageRating": 4.7,
    "ratingDistribution": {
      "5": 892,
      "4": 489,
      "3": 204,
      "2": 85,
      "1": 29
    }
  }
}
```

### Get Most Reviewed Products
```
GET /reviews/most-reviewed
```

**Query Parameters:** `limit` (default: 5)

### Create Review
```
POST /reviews
```

**Body:**
```json
{
  "productId": "product_id_here",
  "customerName": "John Doe",
  "rating": 5,
  "comment": "Great product!"
}
```

**Note:** Product rating and review count are automatically updated.

### Update Review (Admin)
```
PUT /reviews/:id
```

### Delete Review (Admin)
```
DELETE /reviews/:id
```

---

## 🔔 NOTIFICATIONS

### Get All Notifications
```
GET /notifications
```

**Query Parameters:** `type`, `isRead`, `sortBy`, `sortOrder`, `page`, `limit`

**Response includes:** `unreadCount`

### Get Unread Count
```
GET /notifications/unread-count
```

### Get Notification by ID
```
GET /notifications/:id
```

### Create Notification (Admin)
```
POST /notifications
```

**Body:**
```json
{
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
PUT /notifications/:id/read
```

### Mark All Notifications as Read
```
PUT /notifications/read-all
```

### Delete Notification (Admin)
```
DELETE /notifications/:id
```

---

## 📥 EXPORT

### Export Monthly Data
```
GET /export/monthly?year=2024&month=12&type=excel
```

**Query Parameters:**
- `year` - Year (required)
- `month` - Month 1-12 (required)
- `type` - Export type: `excel` or `pdf` (required)

**Response:** File download (Excel or PDF)

---

## Error Responses

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
- `404` - Not Found
- `500` - Internal Server Error

---

## Notes

1. **Discount Calculation:** When creating/updating products, `discountPercent` is used to automatically calculate `discountAmount` and `finalPrice`.

2. **Stock Status:**
   - `stock === 0` → "Out of Stock"
   - `stock < 10` → "Low Stock"
   - `stock >= 10` → "In Stock"

3. **Auto-generated Notifications:**
   - Low stock alerts when stock < 10
   - New order notifications
   - Payment completion notifications

4. **Order Processing:**
   - Stock is automatically decremented
   - Product sales are incremented
   - Payment record is created
   - Notification is generated

5. **Review Processing:**
   - Product rating is recalculated
   - Review count is updated












