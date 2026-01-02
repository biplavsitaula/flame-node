# API Endpoints Quick Reference

## Base URL: `http://localhost:5000/api`

---

## 📦 PRODUCTS
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products` | Public | Get all products (search, filter, paginate) |
| GET | `/products/:id` | Public | Get product by ID |
| POST | `/products` | Admin | Create product |
| PUT | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Delete product |

**Query Params:** `search`, `category`, `status`, `view`, `sortBy`, `sortOrder`, `page`, `limit`

---

## 🛒 ORDERS
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/orders` | Public | Get all orders |
| GET | `/orders/:id` | Public | Get order by ID |
| GET | `/orders/bill/:billNumber` | Public | Get order by bill number |
| POST | `/orders` | Admin | Create order |
| PUT | `/orders/:id` | Admin | Update order status |
| DELETE | `/orders/:id` | Admin | Delete order |

**Query Params:** `search`, `status`, `paymentMethod`, `sortBy`, `sortOrder`, `page`, `limit`

---

## 💳 PAYMENTS
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/payments` | Public | Get all payments |
| GET | `/payments/summary` | Public | Get payment summary |
| GET | `/payments/:id` | Public | Get payment by ID |
| POST | `/payments` | Admin | Create payment |
| PUT | `/payments/:id` | Admin | Update payment status |
| DELETE | `/payments/:id` | Admin | Delete payment |

**Query Params:** `search`, `method`, `status`, `sortBy`, `sortOrder`, `page`, `limit`

---

## 📊 ANALYTICS
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/analytics/summary` | Admin | Get analytics summary |
| GET | `/analytics/sales-trend` | Admin | Get sales trend (monthly) |
| GET | `/analytics/stock-by-category` | Admin | Get stock by category |
| GET | `/analytics/products-by-category` | Admin | Get products by category |
| GET | `/analytics/revenue-by-category` | Admin | Get revenue by category |

---

## ⚠️ STOCK ALERTS
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/stock-alerts/out-of-stock` | Admin | Get out of stock products |
| GET | `/stock-alerts/low-stock` | Admin | Get low stock products |
| GET | `/stock-alerts/all` | Admin | Get all stock alerts |
| GET | `/stock-alerts/reorder-report` | Admin | Generate reorder report |
| PUT | `/stock-alerts/reorder/:id` | Admin | Reorder product (update stock) |

**Query Params:** `threshold` (default: 10), `search`, `category`, `sortBy`, `sortOrder`, `page`, `limit`

---

## 🏆 TOP SELLERS
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/top-sellers/products` | Admin | Get top selling products |
| GET | `/top-sellers/insights` | Admin | Get sales insights |

**Query Params:** `search`, `category`, `sortBy`, `sortOrder`, `page`, `limit`

---

## ⭐ REVIEWS
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/reviews` | Public | Get all reviews |
| GET | `/reviews/summary` | Public | Get review summary |
| GET | `/reviews/most-reviewed` | Public | Get most reviewed products |
| POST | `/reviews` | Public | Create review |
| PUT | `/reviews/:id` | Admin | Update review |
| DELETE | `/reviews/:id` | Admin | Delete review |

**Query Params:** `search`, `productId`, `rating`, `sortBy`, `sortOrder`, `page`, `limit`

---

## 🔔 NOTIFICATIONS
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | Admin | Get all notifications |
| GET | `/notifications/unread-count` | Admin | Get unread count |
| GET | `/notifications/:id` | Admin | Get notification by ID |
| POST | `/notifications` | Admin | Create notification |
| PUT | `/notifications/:id/read` | Admin | Mark as read |
| PUT | `/notifications/read-all` | Admin | Mark all as read |
| DELETE | `/notifications/:id` | Admin | Delete notification |

**Query Params:** `type`, `isRead`, `sortBy`, `sortOrder`, `page`, `limit`

---

## 📥 EXPORT
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/export/monthly` | Admin | Export monthly data |

**Query Params:** `year` (required), `month` (required), `type` (excel|pdf, required)

---

## 📝 Request/Response Examples

### Create Product
```json
POST /api/products
{
  "name": "Captain Morgan Spiced",
  "category": "Rum",
  "brand": "Captain Morgan",
  "price": 19.99,
  "discountPercent": 10,
  "stock": 89,
  "imageUrl": "https://example.com/image.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "name": "Captain Morgan Spiced",
    "price": 19.99,
    "discountPercent": 10,
    "discountAmount": 1.999,
    "finalPrice": 17.991,
    "stock": 89,
    "status": "In Stock"
  }
}
```

### Create Order
```json
POST /api/orders
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

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "billNumber": "FB-2024-001",
    "customer": {...},
    "items": [...],
    "totalAmount": 35.98,
    "status": "placed"
  }
}
```

---

## 🔑 Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

---

## 📌 Important Notes

1. **Discount Calculation**: `discountAmount` and `finalPrice` are auto-calculated from `discountPercent`
2. **Stock Status**: Auto-determined (Out of Stock, Low Stock, In Stock)
3. **Bill Numbers**: Auto-generated format `FB-YYYY-XXX`
4. **Notifications**: Auto-generated for orders, payments, and low stock
5. **Rating Updates**: Product ratings auto-update when reviews change









