# Top Sellers & Stock Alerts API Documentation

## Base URL
```
http://localhost:5000/api
```

---

## 🏆 TOP SELLERS API

### 1. Get Top Selling Products
```
GET /api/top-sellers/products
```

**Description:** Get a list of top selling products sorted by total sales.

**Query Parameters:**
- `search` - Search by product name, category, or brand
- `category` - Filter by category
- `sortBy` - Sort field (default: "totalSold")
- `sortOrder` - Sort order: "asc" or "desc" (default: "desc")
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Example Request:**
```bash
GET /api/top-sellers/products?page=1&limit=5&sortBy=totalSold&sortOrder=desc
```

**Response:**
```json
{
  "success": true,
  "message": "Top selling products fetched successfully",
  "data": [
    {
      "_id": "product_id",
      "name": "Captain Morgan Spiced",
      "category": "Rum",
      "brand": "Captain Morgan",
      "price": 19.99,
      "discountPercent": 10,
      "discountAmount": 2.00,
      "finalPrice": 17.99,
      "stock": 89,
      "rating": 4.3,
      "imageUrl": "https://example.com/image.jpg",
      "totalSold": 567,
      "reviewCount": 456,
      "rank": 1,
      "status": "In Stock"
    },
    {
      "_id": "product_id",
      "name": "Bombay Sapphire",
      "category": "Gin",
      "totalSold": 423,
      "rank": 2,
      "status": "In Stock"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 10,
    "pages": 2
  }
}
```

**Response Fields:**
- `rank` - Product ranking based on totalSold
- `status` - Stock status (In Stock, Low Stock, Out of Stock)
- `totalSold` - Total units sold

---

### 2. Get Sales Insights
```
GET /api/top-sellers/insights
```

**Description:** Get sales insights including trending category, best category, and peak sales day.

**Example Request:**
```bash
GET /api/top-sellers/insights
```

**Response:**
```json
{
  "success": true,
  "message": "Sales insights fetched successfully",
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

**Response Fields:**
- `trendingCategory` - Category with highest growth percentage this month
  - `category` - Category name
  - `growth` - Growth percentage compared to previous month
  - `unitsSold` - Units sold this month
- `bestCategory` - Category with most units sold this month
  - `category` - Category name
  - `unitsSold` - Total units sold
- `peakSalesDay` - Day of week with most sales
  - `day` - Day name (Sunday-Saturday)
  - `percentage` - Percentage of weekly sales
  - `orderCount` - Number of orders on that day

---

## ⚠️ STOCK ALERTS API

### 1. Get Out of Stock Products
```
GET /api/stock-alerts/out-of-stock
```

**Description:** Get all products that are out of stock (stock = 0).

**Query Parameters:**
- `search` - Search by product name, category, or brand
- `category` - Filter by category
- `sortBy` - Sort field (default: "name")
- `sortOrder` - Sort order: "asc" or "desc" (default: "asc")
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Example Request:**
```bash
GET /api/stock-alerts/out-of-stock?page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "message": "Out of stock products fetched successfully",
  "data": [
    {
      "_id": "product_id",
      "name": "Grey Goose Vodka",
      "category": "Vodka",
      "price": 42.99,
      "stock": 0,
      "status": "Out of Stock",
      "totalSold": 312,
      "reviewCount": 234
    },
    {
      "_id": "product_id",
      "name": "Moet & Chandon",
      "category": "Champagne",
      "stock": 0,
      "status": "Out of Stock"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "pages": 1
  }
}
```

---

### 2. Get Low Stock Products
```
GET /api/stock-alerts/low-stock
```

**Description:** Get all products with low stock (stock > 0 and < threshold).

**Query Parameters:**
- `threshold` - Stock threshold (default: 10)
- `search` - Search by product name, category, or brand
- `category` - Filter by category
- `sortBy` - Sort field (default: "stock")
- `sortOrder` - Sort order: "asc" or "desc" (default: "asc")
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Example Request:**
```bash
GET /api/stock-alerts/low-stock?threshold=10&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "message": "Low stock products fetched successfully",
  "data": [
    {
      "_id": "product_id",
      "name": "Hennessy XO",
      "category": "Cognac",
      "price": 229.99,
      "stock": 8,
      "status": "Low Stock",
      "remainingUnits": 8,
      "totalSold": 45
    },
    {
      "_id": "product_id",
      "name": "Macallan 18 Year",
      "category": "Whiskey",
      "stock": 5,
      "status": "Low Stock",
      "remainingUnits": 5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "pages": 1
  }
}
```

**Response Fields:**
- `remainingUnits` - Current stock level
- `status` - Always "Low Stock" for this endpoint

---

### 3. Get All Stock Alerts
```
GET /api/stock-alerts/all
```

**Description:** Get all stock alerts grouped by type (out of stock, going to be out of stock soon, low stock).

**Query Parameters:**
- `threshold` - Stock threshold for low stock (default: 10)

**Example Request:**
```bash
GET /api/stock-alerts/all?threshold=10
```

**Response:**
```json
{
  "success": true,
  "message": "Stock alerts fetched successfully",
  "data": {
    "outOfStock": {
      "count": 2,
      "products": [
        {
          "_id": "product_id",
          "name": "Grey Goose Vodka",
          "category": "Vodka",
          "stock": 0,
          "status": "Out of Stock"
        },
        {
          "_id": "product_id",
          "name": "Moet & Chandon",
          "category": "Champagne",
          "stock": 0,
          "status": "Out of Stock"
        }
      ]
    },
    "goingToBeOutOfStock": {
      "count": 2,
      "products": [
        {
          "_id": "product_id",
          "name": "Hennessy XO",
          "stock": 8,
          "status": "Low Stock",
          "remainingUnits": 8
        },
        {
          "_id": "product_id",
          "name": "Macallan 18 Year",
          "stock": 5,
          "status": "Low Stock",
          "remainingUnits": 5
        }
      ]
    },
    "lowStock": {
      "count": 2,
      "products": [
        {
          "_id": "product_id",
          "name": "Hennessy XO",
          "stock": 8,
          "status": "Low Stock",
          "remainingUnits": 8
        },
        {
          "_id": "product_id",
          "name": "Macallan 18 Year",
          "stock": 5,
          "status": "Low Stock",
          "remainingUnits": 5
        }
      ]
    }
  }
}
```

**Response Fields:**
- `outOfStock` - Products with stock = 0
- `goingToBeOutOfStock` - Products with stock > 0 and < threshold
- `lowStock` - Same as goingToBeOutOfStock

---

### 4. Generate Reorder Report
```
GET /api/stock-alerts/reorder-report
```

**Description:** Generate a comprehensive reorder report with all products that need restocking.

**Query Parameters:**
- `threshold` - Stock threshold (default: 10)

**Example Request:**
```bash
GET /api/stock-alerts/reorder-report?threshold=10
```

**Response:**
```json
{
  "success": true,
  "message": "Reorder report generated successfully",
  "data": {
    "generatedAt": "2024-12-16T10:30:00.000Z",
    "threshold": 10,
    "outOfStock": {
      "count": 2,
      "products": [
        {
          "_id": "product_id",
          "name": "Grey Goose Vodka",
          "category": "Vodka",
          "brand": "Grey Goose",
          "price": 42.99,
          "stock": 0
        },
        {
          "_id": "product_id",
          "name": "Moet & Chandon",
          "category": "Champagne",
          "brand": "Moet & Chandon",
          "price": 59.99,
          "stock": 0
        }
      ]
    },
    "lowStock": {
      "count": 2,
      "products": [
        {
          "_id": "product_id",
          "name": "Hennessy XO",
          "category": "Cognac",
          "brand": "Hennessy",
          "price": 229.99,
          "stock": 8
        },
        {
          "_id": "product_id",
          "name": "Macallan 18 Year",
          "category": "Whiskey",
          "brand": "Macallan",
          "price": 349.99,
          "stock": 5
        }
      ]
    },
    "totalProductsNeedingReorder": 4
  }
}
```

---

### 5. Reorder Product (Update Stock)
```
PUT /api/stock-alerts/reorder/:id
```

**Description:** Update product stock by adding quantity (reorder).

**URL Parameters:**
- `id` - Product ID

**Request Body:**
```json
{
  "quantity": 50
}
```

**Example Request:**
```bash
PUT /api/stock-alerts/reorder/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "quantity": 50
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product stock updated successfully",
  "data": {
    "_id": "product_id",
    "name": "Grey Goose Vodka",
    "category": "Vodka",
    "stock": 50,
    "status": "In Stock",
    "price": 42.99
  }
}
```

**Error Response (if quantity is invalid):**
```json
{
  "success": false,
  "message": "Valid quantity is required"
}
```

**Error Response (if product not found):**
```json
{
  "success": false,
  "message": "Product not found"
}
```

---

## 📝 Usage Examples

### Get Top 5 Selling Products
```bash
curl http://localhost:5000/api/top-sellers/products?limit=5&sortBy=totalSold&sortOrder=desc
```

### Get Sales Insights
```bash
curl http://localhost:5000/api/top-sellers/insights
```

### Get All Out of Stock Products
```bash
curl http://localhost:5000/api/stock-alerts/out-of-stock
```

### Get Low Stock Products (threshold: 10)
```bash
curl http://localhost:5000/api/stock-alerts/low-stock?threshold=10
```

### Get All Stock Alerts
```bash
curl http://localhost:5000/api/stock-alerts/all?threshold=10
```

### Generate Reorder Report
```bash
curl http://localhost:5000/api/stock-alerts/reorder-report?threshold=10
```

### Reorder a Product
```bash
curl -X PUT http://localhost:5000/api/stock-alerts/reorder/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -d '{"quantity": 50}'
```

---

## 🔑 Authentication

All endpoints require admin authentication via the `checkAdmin` middleware.

---

## 📊 Status Codes

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (product not found)
- `500` - Internal Server Error

---

## 💡 Notes

1. **Stock Status Logic:**
   - `stock === 0` → "Out of Stock"
   - `stock < threshold` (default: 10) → "Low Stock"
   - `stock >= threshold` → "In Stock"

2. **Top Sellers Ranking:**
   - Products are ranked by `totalSold` in descending order
   - Only products with `totalSold > 0` are included

3. **Sales Insights:**
   - Trending category is calculated by comparing current month vs previous month
   - Peak sales day is calculated from all orders in the database

4. **Stock Threshold:**
   - Default threshold is 10 units
   - Can be customized via query parameter






