# Next.js Frontend Integration Prompt

Use this prompt to build a complete Next.js 14 (App Router) frontend that integrates with the Flame Beverage Admin Panel backend API.

---

## CONTEXT

I have a complete production-ready backend API for a Liquor Shop Admin Panel built with Node.js, Express, and MongoDB. The backend is running at `http://localhost:5000/api` and provides all necessary endpoints.

**Backend API Base URL:** `http://localhost:5000/api`

You need to build a Next.js 14 frontend (App Router + Route Handlers) that:
1. Integrates with all backend APIs
2. Implements the UI design shown in the dashboard screenshots
3. Uses Tailwind CSS for styling
4. Implements proper state management
5. Handles authentication and protected routes
6. Provides real-time updates and notifications

---

## BACKEND API ENDPOINTS

### PRODUCTS
- `GET /api/products` - Get all products (query: search, category, status, view, sortBy, sortOrder, page, limit)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

**Response Format:**
```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": [...],
  "pagination": { "page": 1, "limit": 10, "total": 100, "pages": 10 }
}
```

### ORDERS
- `GET /api/orders` - Get all orders (query: search, status, paymentMethod, sortBy, sortOrder, page, limit)
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders/bill/:billNumber` - Get order by bill number
- `POST /api/orders` - Create order (Admin)
- `PUT /api/orders/:id` - Update order status (Admin)
- `DELETE /api/orders/:id` - Delete order (Admin)

### PAYMENTS
- `GET /api/payments` - Get all payments (query: search, method, status, sortBy, sortOrder, page, limit)
- `GET /api/payments/summary` - Get payment summary (returns: totalPayments, completed, pending)
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments` - Create payment (Admin)
- `PUT /api/payments/:id` - Update payment status (Admin)
- `DELETE /api/payments/:id` - Delete payment (Admin)

### ANALYTICS
- `GET /api/analytics/summary` - Get analytics summary (Admin)
  - Returns: totalRevenue, totalSales, avgOrderValue, productsSold (each with value, growth, previousValue)
- `GET /api/analytics/sales-trend` - Get sales trend (monthly data for charts)
- `GET /api/analytics/stock-by-category` - Get stock by category (chart data)
- `GET /api/analytics/products-by-category` - Get products by category (chart data)
- `GET /api/analytics/revenue-by-category` - Get revenue by category (chart data)

### STOCK ALERTS
- `GET /api/stock-alerts/out-of-stock` - Get out of stock products (Admin)
- `GET /api/stock-alerts/low-stock` - Get low stock products (Admin, query: threshold)
- `GET /api/stock-alerts/all` - Get all stock alerts (Admin, query: threshold)
- `GET /api/stock-alerts/reorder-report` - Generate reorder report (Admin)
- `PUT /api/stock-alerts/reorder/:id` - Reorder product (Admin, body: { quantity })

### TOP SELLERS
- `GET /api/top-sellers/products` - Get top selling products (Admin)
- `GET /api/top-sellers/insights` - Get sales insights (Admin)
  - Returns: trendingCategory, bestCategory, peakSalesDay

### REVIEWS
- `GET /api/reviews` - Get all reviews (query: search, productId, rating, sortBy, sortOrder, page, limit)
- `GET /api/reviews/summary` - Get review summary (totalReviews, averageRating, ratingDistribution)
- `GET /api/reviews/most-reviewed` - Get most reviewed products (query: limit)
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review (Admin)
- `DELETE /api/reviews/:id` - Delete review (Admin)

### NOTIFICATIONS
- `GET /api/notifications` - Get all notifications (Admin, query: type, isRead, sortBy, sortOrder, page, limit)
- `GET /api/notifications/unread-count` - Get unread count (Admin)
- `GET /api/notifications/:id` - Get notification by ID (Admin)
- `POST /api/notifications` - Create notification (Admin)
- `PUT /api/notifications/:id/read` - Mark as read (Admin)
- `PUT /api/notifications/read-all` - Mark all as read (Admin)
- `DELETE /api/notifications/:id` - Delete notification (Admin)

### EXPORT
- `GET /api/export/monthly?year=2024&month=12&type=excel` - Export monthly data as Excel (Admin)
- `GET /api/export/monthly?year=2024&month=12&type=pdf` - Export monthly data as PDF (Admin)

---

## UI REQUIREMENTS

Based on the dashboard design, you need to implement:

### 1. DASHBOARD PAGE (`/dashboard`)
**Layout:**
- Left sidebar navigation with:
  - Flame Beverage logo and "Admin Panel"
  - Search bar: "Search products, categories..."
  - Navigation items: Dashboard, Products, Orders, Payments, Analytics, Stock Alerts, Top Sellers, Recommended, Reviews, Settings, Logout
- Top header with:
  - "Spirits Dashboard" title
  - Preview button
  - Search bar
  - "Export Data" button (orange)
  - "+ Add Product" button (orange/red)
  - Notification bell icon with badge (showing unread count)
  - User profile: "John Admin" / "Super Admin"

**Dashboard Content:**
- Title: "Dashboard" with subtitle "Welcome back! Here's what's happening with your store."
- 6 KPI Cards:
  1. Total Products (248) - with green up arrow, "12% from last month"
  2. Out of Stock (17) - red border, warning icon
  3. Low Stock (46) - yellow warning icon
  4. Total Sales (29,800) - green up arrow, "8% from last month"
  5. Revenue ($1114K) - green up arrow, "15% from last month"
  6. Total Reviews (1,699) - star icon
- 3 Charts:
  1. Stock by Category (Bar Chart) - In Stock / Low Stock / Out of Stock
  2. Sales Trend (Area Chart) - Jan to Jun
  3. Products by Category (Donut Chart)

**API Calls:**
- `GET /api/analytics/summary` - For KPI cards
- `GET /api/analytics/stock-by-category` - For stock chart
- `GET /api/analytics/sales-trend` - For sales trend chart
- `GET /api/analytics/products-by-category` - For donut chart
- `GET /api/products?view=out-of-stock` - For out of stock count
- `GET /api/products?view=low-stock` - For low stock count
- `GET /api/reviews/summary` - For total reviews

### 2. PRODUCTS PAGE (`/products`)
**Features:**
- Title: "Products" with subtitle "Manage your product inventory"
- Top search bar: "Search products, categories..."
- Filter tabs: All Products, Out of Stock, Low Stock, Top Sellers, Most Reviewed, Recommended
- Product table with columns:
  - Product (image, name, review count)
  - Category (pill badge)
  - Price
  - Discount (red pill badge with %)
  - Stock (with "Going to be out of stock soon" warning if < 10)
  - Status (In Stock/Low Stock/Out of Stock - colored pill badges)
  - Rating (stars)
  - Sales
  - Actions (Edit, View, Delete icons)
- Search bar: "Search products by name or category..."
- Pagination

**API Calls:**
- `GET /api/products?view={view}&search={search}&category={category}&status={status}&page={page}&limit={limit}`

**Product Form (Modal/Drawer):**
- Fields: name, category (dropdown), brand, price, discountPercent, stock, rating, alcoholPercentage, volume, imageUrl, isRecommended
- On submit: `POST /api/products` or `PUT /api/products/:id`

### 3. ORDERS PAGE (`/orders`)
**Features:**
- Title: "Orders" with subtitle "Manage customer orders and track deliveries"
- Search bar: "Search orders by customer, bill number, location..."
- "Export Data" button
- Orders table with columns:
  - Bill No (orange text, clickable)
  - Customer (name, location)
  - Items (product names with quantities)
  - Amount
  - Status (dropdown: Order Placed, In Progress, Completed, Delivered - colored badges)
  - Payment (QR Payment/COD - colored badges)
  - Actions (eye icon for view, printer icon for print)
- Pagination

**API Calls:**
- `GET /api/orders?search={search}&status={status}&paymentMethod={method}&page={page}&limit={limit}`
- `PUT /api/orders/:id` - To update status

**Order Details Modal:**
- Show full order details with bill information
- Print bill functionality

### 4. PAYMENTS PAGE (`/payments`)
**Features:**
- Title: "Payments" with subtitle "Track all payment records and transactions"
- Filter buttons: All Payments, QR Payments, Cash on Delivery
- 3 Summary Cards:
  - Total Payments: $1306.87 (orange)
  - Completed: $1119.95 (green)
  - Pending: $186.92 (orange)
- Search bar: "Search payments..."
- Payments table with columns:
  - Bill No (orange text)
  - Customer
  - Amount
  - Method (QR Payment/COD - colored badges)
  - Status (Completed/Pending - colored badges)
  - Date
- Pagination

**API Calls:**
- `GET /api/payments/summary` - For summary cards
- `GET /api/payments?method={method}&status={status}&search={search}&page={page}&limit={limit}`

### 5. ANALYTICS PAGE (`/analytics`)
**Features:**
- Title: "Analytics" with subtitle "Track your store performance"
- 4 KPI Cards:
  1. Total Revenue: $1114K - green up arrow "↑ 15% from last month"
  2. Total Sales: 29,800 - green up arrow "↑ 8% from last month"
  3. Avg Order Value: $37.40 - green up arrow "↑ 3% from last month"
  4. Products Sold: 1,847 - green up arrow "↑ 12% from last month"
- 2 Charts:
  1. Sales Trend (Area Chart) - Monthly data with tooltip
  2. Stock by Category (Grouped Bar Chart) - In Stock / Low Stock / Out of Stock
- Additional sections: Products by Category, Revenue by Category

**API Calls:**
- `GET /api/analytics/summary` - For KPI cards
- `GET /api/analytics/sales-trend` - For sales trend chart
- `GET /api/analytics/stock-by-category` - For stock chart
- `GET /api/analytics/products-by-category` - For products chart
- `GET /api/analytics/revenue-by-category` - For revenue chart

**Chart Libraries:** Use Recharts or Chart.js

### 6. STOCK ALERTS PAGE (`/stock-alerts`)
**Features:**
- Title: "Stock Alerts" with subtitle "Monitor and manage inventory levels"
- 3 Sections:
  1. **Out of Stock (2)** - Red section
     - Product list with "Reorder" button
  2. **Going to be Out of Stock Soon (2)** - Orange section
     - Product list with remaining units and "Reorder" button
  3. **Low Stock (2)** - Yellow section
     - Product list with remaining units and "Reorder" button
- Right sidebar: "Quick Actions"
  - Generate Reorder Report
  - Set Stock Thresholds
  - Export Inventory (CSV)

**API Calls:**
- `GET /api/stock-alerts/all?threshold={threshold}` - For all alerts
- `PUT /api/stock-alerts/reorder/:id` - To reorder (body: { quantity })
- `GET /api/stock-alerts/reorder-report?threshold={threshold}` - For reorder report

### 7. TOP SELLERS PAGE (`/top-sellers`)
**Features:**
- Title: "Top Sellers" with subtitle "Your best performing products"
- Left: "Top Selling Products" list (ranked 1-5)
  - Rank number (orange circle)
  - Product image
  - Product name
  - Category
  - Units sold (orange text)
- Right: "Sales Insights" cards
  1. Trending Up: "+23%" - "Whiskey sales this month" (green card)
  2. Best Category: "Rum" - "567 units sold this month" (orange card)
  3. Peak Sales Day: "Saturday" - "45% of weekly sales" (dark gray card)
- Search bar: "Search products by name or category..."
- Products table (same as Products page but sorted by sales)

**API Calls:**
- `GET /api/top-sellers/products?search={search}&category={category}&page={page}&limit={limit}`
- `GET /api/top-sellers/insights` - For insights cards

### 8. RECOMMENDED PRODUCTS PAGE (`/recommended`)
**Features:**
- Title: "Recommended Products" with subtitle "Manage your recommended product selections"
- Search bar: "Search products by name or category..."
- Products table (same structure as Products page)
- Right sidebar: "Most Recommended" list (ranked 1-4)
  - Rank number
  - Product image
  - Category badge
  - Rating
  - Price

**API Calls:**
- `GET /api/products?view=recommended&search={search}&page={page}&limit={limit}`
- `PUT /api/products/:id` - To toggle isRecommended flag

### 9. REVIEWS PAGE (`/reviews`)
**Features:**
- Title: "Reviews" with subtitle "Customer feedback and ratings"
- Left: "Most Reviewed Products" list (ranked 1-5)
  - Rank number (orange circle)
  - Product image
  - Product name
  - Category
  - Review count (orange text)
- Right: "Review Summary"
  - Average Rating: "4.7 / 5" (large orange star)
  - Total reviews: "1,699"
  - Rating Distribution (bar chart):
    - 5 stars: 892 reviews
    - 4 stars: 489 reviews
    - 3 stars: 204 reviews
    - 2 stars: 85 reviews
    - 1 star: 29 reviews
- Search bar: "Search products by name or category..."

**API Calls:**
- `GET /api/reviews/summary` - For review summary
- `GET /api/reviews/most-reviewed?limit=5` - For most reviewed list
- `GET /api/reviews?search={search}&productId={id}&rating={rating}&page={page}&limit={limit}`

---

## TECHNICAL REQUIREMENTS

### 1. Next.js 14 Setup
- Use App Router (not Pages Router)
- Create route handlers if needed for server-side API calls
- Use Server Components where possible
- Use Client Components for interactive features

### 2. State Management
- Use React Context API or Zustand for global state
- Manage: authentication, notifications, cart (if needed)
- Use React Query (TanStack Query) for server state management
- Implement caching and refetching strategies

### 3. API Integration
- Create a centralized API client utility (`lib/api.js` or `utils/api.ts`)
- Use fetch or axios for API calls
- Implement error handling and retry logic
- Handle loading states
- Implement request/response interceptors

**Example API Client Structure:**
```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = {
  products: {
    getAll: (params) => fetch(`${API_BASE_URL}/products?${new URLSearchParams(params)}`),
    getById: (id) => fetch(`${API_BASE_URL}/products/${id}`),
    create: (data) => fetch(`${API_BASE_URL}/products`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetch(`${API_BASE_URL}/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' }),
  },
  // ... similar for other endpoints
};
```

### 4. Authentication
- Implement admin authentication
- Use Next.js middleware for route protection
- Store auth token in httpOnly cookies or localStorage
- Create auth context/provider
- Protect admin routes (all routes except public ones)

### 5. UI Components
Create reusable components:
- `Sidebar` - Left navigation sidebar
- `Header` - Top header with search, buttons, notifications
- `DataTable` - Reusable table component with sorting, pagination, search
- `KPICard` - KPI card component
- `ChartCard` - Chart wrapper component
- `StatusBadge` - Status badge component (In Stock, Low Stock, etc.)
- `Modal` - Modal/Drawer component
- `NotificationBell` - Notification bell with badge
- `SearchBar` - Search input component
- `Pagination` - Pagination component
- `LoadingSpinner` - Loading state component
- `ErrorBoundary` - Error handling component

### 6. Styling
- Use Tailwind CSS (already configured)
- Dark theme (as shown in screenshots)
- Color scheme:
  - Background: Dark gray/black
  - Primary: Orange (#FF6B35 or similar)
  - Success: Green
  - Warning: Yellow
  - Danger: Red
  - Text: White/Light gray
- Responsive design (mobile-friendly)

### 7. Real-time Updates
- Poll notifications every 30 seconds
- Update notification badge count
- Show toast notifications for new events
- Refresh data after mutations (create, update, delete)

### 8. Error Handling
- Global error boundary
- API error handling with user-friendly messages
- Toast notifications for errors
- Retry failed requests

### 9. Form Handling
- Use React Hook Form for forms
- Implement validation
- Show loading states during submission
- Success/error feedback

### 10. Data Export
- Handle Excel/PDF download from export endpoint
- Show loading state during export
- Handle file download in browser

---

## FOLDER STRUCTURE

```
nextjs-app/
├── app/
│   ├── layout.tsx                 # Root layout with sidebar and header
│   ├── page.tsx                   # Dashboard page
│   ├── dashboard/
│   │   └── page.tsx              # Dashboard (redirect or same as root)
│   ├── products/
│   │   ├── page.tsx              # Products list
│   │   ├── [id]/
│   │   │   └── page.tsx          # Product details/edit
│   │   └── new/
│   │       └── page.tsx          # Create product
│   ├── orders/
│   │   ├── page.tsx              # Orders list
│   │   └── [id]/
│   │       └── page.tsx          # Order details
│   ├── payments/
│   │   └── page.tsx              # Payments page
│   ├── analytics/
│   │   └── page.tsx              # Analytics page
│   ├── stock-alerts/
│   │   └── page.tsx              # Stock alerts page
│   ├── top-sellers/
│   │   └── page.tsx              # Top sellers page
│   ├── recommended/
│   │   └── page.tsx              # Recommended products page
│   ├── reviews/
│   │   └── page.tsx              # Reviews page
│   └── api/                      # API route handlers (if needed)
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Layout.tsx
│   ├── common/
│   │   ├── DataTable.tsx
│   │   ├── KPICard.tsx
│   │   ├── ChartCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── Modal.tsx
│   │   ├── SearchBar.tsx
│   │   ├── Pagination.tsx
│   │   └── LoadingSpinner.tsx
│   ├── products/
│   │   ├── ProductTable.tsx
│   │   └── ProductForm.tsx
│   ├── orders/
│   │   ├── OrderTable.tsx
│   │   └── OrderDetails.tsx
│   └── charts/
│       ├── SalesTrendChart.tsx
│       ├── StockByCategoryChart.tsx
│       └── ProductsByCategoryChart.tsx
├── lib/
│   ├── api.ts                     # API client
│   ├── auth.ts                    # Authentication utilities
│   └── utils.ts                   # Utility functions
├── hooks/
│   ├── useProducts.ts
│   ├── useOrders.ts
│   ├── usePayments.ts
│   ├── useAnalytics.ts
│   └── useNotifications.ts
├── context/
│   ├── AuthContext.tsx
│   └── NotificationContext.tsx
├── types/
│   ├── product.ts
│   ├── order.ts
│   └── api.ts
└── public/
    └── images/
```

---

## IMPLEMENTATION PRIORITY

1. **Phase 1: Core Setup**
   - Next.js 14 setup with App Router
   - Tailwind CSS configuration
   - API client setup
   - Authentication setup
   - Layout components (Sidebar, Header)

2. **Phase 2: Dashboard**
   - Dashboard page with KPI cards
   - Charts integration
   - Data fetching and display

3. **Phase 3: Products**
   - Products list page
   - Product form (create/edit)
   - Product table with filters

4. **Phase 4: Orders & Payments**
   - Orders page
   - Payments page
   - Order details modal

5. **Phase 5: Analytics & Reports**
   - Analytics page with charts
   - Export functionality

6. **Phase 6: Additional Features**
   - Stock alerts
   - Top sellers
   - Recommended products
   - Reviews

7. **Phase 7: Polish**
   - Notifications system
   - Error handling
   - Loading states
   - Responsive design

---

## ENVIRONMENT VARIABLES

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Flame Beverage Admin Panel
```

---

## ADDITIONAL REQUIREMENTS

1. **Image Upload**: If implementing image upload, use the backend's Cloudinary integration or handle it client-side
2. **Print Bill**: Implement print functionality for order bills
3. **Search**: Implement real-time search with debouncing
4. **Sorting**: Implement table column sorting
5. **Filtering**: Implement multi-filter functionality
6. **Pagination**: Implement server-side pagination
7. **Toast Notifications**: Use react-hot-toast or similar for user feedback
8. **Loading States**: Show skeleton loaders or spinners
9. **Error States**: Show user-friendly error messages
10. **Empty States**: Show helpful messages when no data

---

## TESTING CHECKLIST

- [ ] All pages load correctly
- [ ] API calls work correctly
- [ ] Authentication works
- [ ] Forms submit correctly
- [ ] Tables display data correctly
- [ ] Charts render correctly
- [ ] Search and filters work
- [ ] Pagination works
- [ ] Notifications update in real-time
- [ ] Export functionality works
- [ ] Responsive design works
- [ ] Error handling works
- [ ] Loading states display correctly

---

## NOTES

- All API responses follow the format: `{ success: boolean, message: string, data: any, pagination?: object }`
- Handle errors gracefully with user-friendly messages
- Implement proper TypeScript types for all API responses
- Use React Query for caching and automatic refetching
- Implement optimistic updates where appropriate
- Add proper loading and error states to all components
- Ensure all admin routes are protected
- Implement proper SEO meta tags
- Add proper accessibility attributes

---

**Start building the Next.js frontend following this prompt. Make sure to integrate all the backend APIs correctly and implement the UI as described in the dashboard screenshots.**









