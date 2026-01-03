# Flame Beverage Admin Panel - Backend API

Production-ready backend API for a Liquor Shop Admin Panel built with Node.js, Express, and MongoDB.

## 🚀 Features

- ✅ **Product Management** - Full CRUD with image upload, discount calculation, stock management
- ✅ **Order Management** - Order processing with automatic stock updates and bill generation
- ✅ **Payment Processing** - Track payments (QR Payment, COD) with status management
- ✅ **Analytics Dashboard** - Revenue tracking, sales trends, category analytics
- ✅ **Stock Alerts** - Automatic low stock notifications and reorder reports
- ✅ **Top Sellers** - Product ranking and sales insights
- ✅ **Reviews & Ratings** - Customer reviews with automatic rating calculation
- ✅ **Notifications** - Real-time notifications for orders, payments, and stock alerts
- ✅ **Export Reports** - Excel and PDF export for monthly data

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd flame-node
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/flame-beverage?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_SECRET_KEY=your_secret_key_here
```

4. **Run the server**
```bash
# Development mode
npm run dev

# Production mode
node server.js
```

5. **Seed products (optional)**
```bash
npm run seed
```

## 📁 Project Structure

```
flame-node/
├── config/
│   └── db.js                 # MongoDB connection
├── controller/               # Request handlers
│   ├── product.controller.js
│   ├── order.controller.js
│   ├── payment.controller.js
│   ├── analytics.controller.js
│   ├── stockAlerts.controller.js
│   ├── topSellers.controller.js
│   ├── review.controller.js
│   ├── notification.controller.js
│   └── export.controller.js
├── middleware/
│   └── admin.middleware.js   # Admin authentication middleware
├── models/                   # Mongoose schemas
│   ├── product.models.js
│   ├── order.models.js
│   ├── payment.models.js
│   ├── review.models.js
│   └── notification.models.js
├── routes/                   # API routes
│   ├── product.route.js
│   ├── order.route.js
│   ├── payment.route.js
│   ├── analytics.route.js
│   ├── stockAlerts.route.js
│   ├── topSellers.route.js
│   ├── review.route.js
│   ├── notification.route.js
│   └── export.route.js
├── services/                 # Business logic
│   ├── product.service.js
│   ├── order.service.js
│   ├── payment.service.js
│   ├── analytics.service.js
│   ├── stockAlerts.service.js
│   ├── topSellers.service.js
│   ├── review.service.js
│   ├── notification.service.js
│   └── export.service.js
├── seeders/
│   └── product.js           # Product seeder
├── server.js                 # Express server
├── package.json
└── API_DOCUMENTATION.md      # Complete API documentation
```

## 🔑 Key Features Explained

### Product Management
- **Automatic Discount Calculation**: When you set `discountPercent`, the system automatically calculates `discountAmount` and `finalPrice`
- **Stock Status**: Automatically determined based on stock levels:
  - `stock === 0` → "Out of Stock"
  - `stock < 10` → "Low Stock"
  - `stock >= 10` → "In Stock"
- **Low Stock Notifications**: Automatically generated when stock falls below 10

### Order Processing
- **Automatic Stock Updates**: When an order is created, product stock is decremented and sales are incremented
- **Payment Record Creation**: Payment record is automatically created with the order
- **Bill Number Generation**: Auto-generated in format `FB-YYYY-XXX`

### Analytics
- **Month-over-Month Comparison**: All metrics include growth percentage compared to previous month
- **Chart-Ready Data**: All analytics endpoints return data formatted for charts

### Notifications
- **Auto-Generated**: Notifications are automatically created for:
  - New orders
  - Payment completions
  - Low stock alerts

## 📡 API Endpoints

### Products
- `GET /api/products` - Get all products (with filters, search, pagination)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders/bill/:billNumber` - Get order by bill number
- `POST /api/orders` - Create order (Admin)
- `PUT /api/orders/:id` - Update order status (Admin)
- `DELETE /api/orders/:id` - Delete order (Admin)

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/summary` - Get payment summary
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments` - Create payment (Admin)
- `PUT /api/payments/:id` - Update payment status (Admin)
- `DELETE /api/payments/:id` - Delete payment (Admin)

### Analytics
- `GET /api/analytics/summary` - Get analytics summary (Admin)
- `GET /api/analytics/sales-trend` - Get sales trend (Admin)
- `GET /api/analytics/stock-by-category` - Get stock by category (Admin)
- `GET /api/analytics/products-by-category` - Get products by category (Admin)
- `GET /api/analytics/revenue-by-category` - Get revenue by category (Admin)

### Stock Alerts
- `GET /api/stock-alerts/out-of-stock` - Get out of stock products (Admin)
- `GET /api/stock-alerts/low-stock` - Get low stock products (Admin)
- `GET /api/stock-alerts/all` - Get all stock alerts (Admin)
- `GET /api/stock-alerts/reorder-report` - Generate reorder report (Admin)
- `PUT /api/stock-alerts/reorder/:id` - Reorder product (Admin)

### Top Sellers
- `GET /api/top-sellers/products` - Get top selling products (Admin)
- `GET /api/top-sellers/insights` - Get sales insights (Admin)

### Reviews
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/summary` - Get review summary
- `GET /api/reviews/most-reviewed` - Get most reviewed products
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review (Admin)
- `DELETE /api/reviews/:id` - Delete review (Admin)

### Notifications
- `GET /api/notifications` - Get all notifications (Admin)
- `GET /api/notifications/unread-count` - Get unread count (Admin)
- `GET /api/notifications/:id` - Get notification by ID (Admin)
- `POST /api/notifications` - Create notification (Admin)
- `PUT /api/notifications/:id/read` - Mark as read (Admin)
- `PUT /api/notifications/read-all` - Mark all as read (Admin)
- `DELETE /api/notifications/:id` - Delete notification (Admin)

### Export
- `GET /api/export/monthly?year=2024&month=12&type=excel` - Export monthly data (Admin)
- `GET /api/export/monthly?year=2024&month=12&type=pdf` - Export monthly data as PDF (Admin)

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🔒 Authentication

Currently, admin routes use a placeholder middleware (`checkAdmin`). Implement proper authentication:

1. JWT-based authentication
2. Role-based access control
3. API key authentication

Update `middleware/admin.middleware.js` with your authentication logic.

## 📊 Database Models

### Product
- name, category, brand, price, discountPercent, discountAmount, finalPrice
- stock, rating, alcoholPercentage, volume, imageUrl
- isRecommended, totalSold, reviewCount

### Order
- billNumber (auto-generated), customer details, items, totalAmount
- status, paymentMethod, paymentStatus

### Payment
- orderId, billNumber, customer, amount, method, status

### Review
- productId, customerName, rating, comment, isVerified

### Notification
- type, title, message, relatedId, relatedModel, isRead, priority

## 🧪 Testing

Test the API using tools like:
- Postman
- Insomnia
- curl
- Thunder Client (VS Code extension)

Example request:
```bash
curl http://localhost:5000/api/products
```

## 🐛 Error Handling

All errors follow a consistent format:
```json
{
  "success": false,
  "message": "Error message here"
}
```

## 📝 Notes

1. **Discount Calculation**: Always use `discountPercent` when creating/updating products. The system calculates `discountAmount` and `finalPrice` automatically.

2. **Stock Management**: Stock is automatically updated when orders are created. Low stock notifications are generated automatically.

3. **Rating Calculation**: Product ratings are automatically recalculated when reviews are added, updated, or deleted.

4. **Bill Numbers**: Format: `FB-YYYY-XXX` (e.g., FB-2024-001)

## 🚧 Future Enhancements

- [ ] Image upload with Cloudinary integration
- [ ] Print bill functionality
- [ ] Advanced search and filtering
- [ ] Real-time notifications with WebSockets
- [ ] Caching for better performance
- [ ] Rate limiting
- [ ] API versioning

## 📄 License

ISC

## 👥 Contributors

Your name here

---

For questions or issues, please open an issue on GitHub.












