# 🔐 Customer Dashboard API — Frontend Integration Guide

**Base URL:** `http://localhost:5000/api`

**Auth Header (required on ALL endpoints):**

```
Authorization: Bearer <jwt_token>
```

---

## 1. Get Full Dashboard

```
GET /api/customer/dashboard
```

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "message": "Dashboard fetched successfully",
  "data": {
    "_id": "...",
    "userId": {
      "_id": "...",
      "fullName": "Alex Morgan",
      "email": "alex@example.com",
      "mobile": "9841234567",
      "role": "user",
      "createdAt": "2025-01-15T..."
    },
    "loyaltyPoints": 2460,
    "totalPointsEarned": 5200,
    "totalPointsRedeemed": 2740,
    "membershipTier": "Gold",
    "tierProgress": 65,
    "totalOrders": 12,
    "totalSpent": 45000,
    "favoriteProducts": [
      {
        "_id": "...",
        "name": "Macallan 12 Year Double C...",
        "imageUrl": "https://...",
        "price": 15000,
        "finalPrice": 13200,
        "category": "Whisky",
        "rating": 4.5,
        "reviewCount": 120,
        "brand": "Macallan"
      }
    ],
    "addresses": [
      {
        "_id": "...",
        "label": "Home",
        "address": "123 Street 5",
        "city": "Kathmandu",
        "isDefault": true
      }
    ],
    "dateOfBirth": "1990-05-15T...",
    "preferences": {
      "emailNotifications": true,
      "smsNotifications": false,
      "orderUpdates": true,
      "promotionalOffers": true
    },
    "recentOrders": [
      {
        "_id": "...",
        "billNumber": "FB-2026-001",
        "customer": {
          "fullName": "Alex Morgan",
          "mobile": "9841234567",
          "location": "Kathmandu"
        },
        "items": [
          {
            "productId": {
              "_id": "...",
              "name": "Macallan 12 Year",
              "imageUrl": "https://...",
              "price": 15000,
              "finalPrice": 13200
            },
            "name": "Macallan 12 Year",
            "quantity": 1,
            "price": 13200,
            "total": 13200
          }
        ],
        "totalAmount": 18500,
        "status": "delivered",
        "paymentMethod": "Online",
        "paymentStatus": "completed",
        "createdAt": "2026-02-28T..."
      }
    ],
    "stats": {
      "totalOrders": 12,
      "totalSpent": 45000,
      "loyaltyPoints": 2460,
      "membershipTier": "Gold",
      "tierProgress": 65
    }
  }
}
```

---

## 2. Get Dashboard Summary

```
GET /api/customer/dashboard/summary
```

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "message": "Dashboard summary fetched successfully",
  "data": {
    "user": {
      "fullName": "Alex Morgan",
      "email": "alex@example.com",
      "mobile": "9841234567",
      "memberSince": "2025-01-15T..."
    },
    "loyalty": {
      "currentPoints": 2460,
      "totalEarned": 5200,
      "totalRedeemed": 2740,
      "membershipTier": "Gold",
      "tierProgress": 65
    },
    "orders": {
      "total": 12,
      "completed": 8,
      "pending": 2,
      "totalSpent": 45000
    },
    "favorites": 4,
    "addresses": 2
  }
}
```

---

## 3. Update Profile / Preferences / Addresses

```
PUT /api/customer/dashboard
```

**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

**Payload (all fields optional — send only what you want to update):**

```json
{
  "dateOfBirth": "1990-05-15",
  "preferences": {
    "emailNotifications": true,
    "smsNotifications": true,
    "orderUpdates": true,
    "promotionalOffers": false
  },
  "addresses": [
    {
      "label": "Home",
      "address": "123 Durbar Marg",
      "city": "Kathmandu",
      "isDefault": true
    },
    {
      "label": "Office",
      "address": "456 New Road",
      "city": "Lalitpur",
      "isDefault": false
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Dashboard updated successfully",
  "data": {
    "_id": "...",
    "userId": { "_id": "...", "fullName": "Alex Morgan", "email": "alex@example.com" },
    "loyaltyPoints": 2460,
    "membershipTier": "Gold",
    "dateOfBirth": "1990-05-15T...",
    "preferences": {
      "emailNotifications": true,
      "smsNotifications": true,
      "orderUpdates": true,
      "promotionalOffers": false
    },
    "addresses": [
      { "label": "Home", "address": "123 Durbar Marg", "city": "Kathmandu", "isDefault": true },
      { "label": "Office", "address": "456 New Road", "city": "Lalitpur", "isDefault": false }
    ],
    "favoriteProducts": [...]
  }
}
```

---

## 4. Add Product to Favorites

```
POST /api/customer/favorites/:productId
```

**Headers:** `Authorization: Bearer <token>`

**URL Param:** `productId` — the MongoDB ObjectId of the product

**Payload:** None

**Example:** `POST /api/customer/favorites/6650abc123def456ghi789`

**Response:**

```json
{
  "success": true,
  "message": "Product added to favorites",
  "data": {
    "_id": "...",
    "favoriteProducts": [
      {
        "_id": "6650abc123def456ghi789",
        "name": "Macallan 12 Year",
        "imageUrl": "https://...",
        "price": 15000,
        "finalPrice": 13200,
        "category": "Whisky",
        "rating": 4.5,
        "reviewCount": 120,
        "brand": "Macallan"
      }
    ]
  }
}
```

**Error (already in favorites):**

```json
{
  "success": false,
  "message": "Product is already in favorites"
}
```

---

## 5. Remove Product from Favorites

```
DELETE /api/customer/favorites/:productId
```

**Headers:** `Authorization: Bearer <token>`

**URL Param:** `productId` — the MongoDB ObjectId of the product

**Payload:** None

**Example:** `DELETE /api/customer/favorites/6650abc123def456ghi789`

**Response:**

```json
{
  "success": true,
  "message": "Product removed from favorites",
  "data": {
    "_id": "...",
    "favoriteProducts": []
  }
}
```

---

## 6. Add Loyalty Points

```
POST /api/customer/loyalty/add
```

**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

**Payload:**

```json
{
  "points": 500,
  "reason": "Purchase reward"
}
```

| Field    | Type   | Required | Description                    |
| -------- | ------ | -------- | ------------------------------ |
| `points` | number | ✅ Yes   | Must be a positive number      |
| `reason` | string | ❌ No    | Optional reason for the points |

**Response:**

```json
{
  "success": true,
  "message": "500 loyalty points added successfully",
  "data": {
    "_id": "...",
    "userId": { "_id": "...", "fullName": "Alex Morgan", "email": "alex@example.com" },
    "loyaltyPoints": 2960,
    "totalPointsEarned": 5700,
    "totalPointsRedeemed": 2740,
    "membershipTier": "Gold",
    "tierProgress": 74
  }
}
```

---

## 7. Redeem Loyalty Points

```
POST /api/customer/loyalty/redeem
```

**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

**Payload:**

```json
{
  "points": 200
}
```

| Field    | Type   | Required | Description               |
| -------- | ------ | -------- | ------------------------- |
| `points` | number | ✅ Yes   | Must be a positive number |

**Response:**

```json
{
  "success": true,
  "message": "200 loyalty points redeemed successfully",
  "data": {
    "_id": "...",
    "userId": { "_id": "...", "fullName": "Alex Morgan", "email": "alex@example.com" },
    "loyaltyPoints": 2260,
    "totalPointsEarned": 5200,
    "totalPointsRedeemed": 2940,
    "membershipTier": "Gold",
    "tierProgress": 65
  }
}
```

**Error (insufficient points):**

```json
{
  "success": false,
  "message": "Insufficient loyalty points. Available: 2260, Requested: 5000"
}
```

---

## 8. Get Recent Orders

```
GET /api/customer/orders?limit=10
```

**Headers:** `Authorization: Bearer <token>`

**Query Params:**

| Param   | Type   | Default | Description                      |
| ------- | ------ | ------- | -------------------------------- |
| `limit` | number | `10`    | Number of recent orders to fetch |

**Response:**

```json
{
  "success": true,
  "message": "Recent orders fetched successfully",
  "data": [
    {
      "_id": "...",
      "billNumber": "FB-2026-001",
      "customer": {
        "fullName": "Alex Morgan",
        "email": "alex@example.com",
        "mobile": "9841234567",
        "location": "Kathmandu"
      },
      "items": [
        {
          "productId": {
            "_id": "...",
            "name": "Macallan 12 Year",
            "imageUrl": "https://...",
            "category": "Whisky",
            "price": 15000,
            "finalPrice": 13200
          },
          "name": "Macallan 12 Year",
          "quantity": 1,
          "price": 13200,
          "total": 13200
        }
      ],
      "subtotal": 13200,
      "deliveryFee": 0,
      "totalAmount": 13200,
      "status": "delivered",
      "paymentMethod": "Online",
      "paymentGateway": "esewa",
      "paymentStatus": "completed",
      "createdAt": "2026-02-28T10:30:00.000Z",
      "updatedAt": "2026-02-28T14:00:00.000Z"
    }
  ]
}
```

---

## 🎯 Membership Tier Thresholds

| Tier         | Points Required | Progress Calculation                    |
| ------------ | --------------- | --------------------------------------- |
| **Bronze**   | 0 – 1,999      | `(totalPointsEarned / 2000) * 100`      |
| **Silver**   | 2,000 – 4,999  | `((totalEarned - 2000) / 3000) * 100`   |
| **Gold**     | 5,000 – 9,999  | `((totalEarned - 5000) / 5000) * 100`   |
| **Platinum** | 10,000+         | `100`                                   |

---

## 🔑 Frontend Axios Setup Example

```javascript
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const API = axios.create({ baseURL: API_BASE_URL });

// Automatically attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ==================== API Functions ====================

// 1. Get full dashboard
export const getDashboard = () => API.get("/customer/dashboard");

// 2. Get dashboard summary
export const getDashboardSummary = () => API.get("/customer/dashboard/summary");

// 3. Update profile / preferences / addresses
export const updateDashboard = (data) => API.put("/customer/dashboard", data);

// 4. Add product to favorites
export const addFavorite = (productId) =>
  API.post(`/customer/favorites/${productId}`);

// 5. Remove product from favorites
export const removeFavorite = (productId) =>
  API.delete(`/customer/favorites/${productId}`);

// 6. Add loyalty points
export const addLoyaltyPoints = (points, reason) =>
  API.post("/customer/loyalty/add", { points, reason });

// 7. Redeem loyalty points
export const redeemLoyaltyPoints = (points) =>
  API.post("/customer/loyalty/redeem", { points });

// 8. Get recent orders
export const getRecentOrders = (limit = 10) =>
  API.get(`/customer/orders?limit=${limit}`);
```

---

## 📋 Quick Reference — All Endpoints

| #   | Method   | Endpoint                              | Payload                                        | Description                  |
| --- | -------- | ------------------------------------- | ---------------------------------------------- | ---------------------------- |
| 1   | `GET`    | `/api/customer/dashboard`             | —                                              | Full dashboard data          |
| 2   | `GET`    | `/api/customer/dashboard/summary`     | —                                              | Aggregated stats summary     |
| 3   | `PUT`    | `/api/customer/dashboard`             | `{ dateOfBirth, preferences, addresses }`      | Update profile/settings      |
| 4   | `POST`   | `/api/customer/favorites/:productId`  | —                                              | Add to favorites             |
| 5   | `DELETE` | `/api/customer/favorites/:productId`  | —                                              | Remove from favorites        |
| 6   | `POST`   | `/api/customer/loyalty/add`           | `{ points: number, reason?: string }`          | Add loyalty points           |
| 7   | `POST`   | `/api/customer/loyalty/redeem`        | `{ points: number }`                           | Redeem loyalty points        |
| 8   | `GET`    | `/api/customer/orders?limit=10`       | —                                              | Get recent orders            |

---

## 🚀 Seed Demo Data

```bash
npm run seed:customer-dashboard
```
