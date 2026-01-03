# Next.js Frontend Integration Prompt - Top Sellers & Stock Alerts

## TOP SELLERS PAGE INTEGRATION

Build the **Top Sellers** page (`/top-sellers`) that integrates with the backend API endpoints.

### Page Layout

**Left Column - Top Selling Products List:**
- Header: "Top Selling Products" with orange upward-trending arrow icon
- Display ranked list (1-5) showing:
  - Rank number in orange circle
  - Product image (circular)
  - Product name
  - Category (pill badge)
  - Units sold (in orange text, e.g., "567 sold")
- Search bar below: "Search products by name or category..."

**Right Column - Sales Insights:**
- Header: "Sales Insights"
- Three insight cards:
  1. **Trending Up Card (green background):**
     - Large percentage with "+" sign (e.g., "+23%")
     - Description: "{category} sales this month"
  2. **Best Category Card (orange background):**
     - Category name (e.g., "Rum")
     - Description: "{units} units sold this month"
  3. **Peak Sales Day Card (dark grey background):**
     - Day name (e.g., "Saturday")
     - Description: "{percentage}% of weekly sales"

**Bottom Section - Products Table:**
- Full products table (same as Products page)
- Sorted by sales (totalSold) descending
- Search, sort, pagination functionality

### API Integration

**1. Fetch Top Selling Products:**
```typescript
GET /api/top-sellers/products?page=1&limit=5&sortBy=totalSold&sortOrder=desc

Response:
{
  "success": true,
  "data": [
    {
      "_id": "product_id",
      "name": "Captain Morgan Spiced",
      "category": "Rum",
      "totalSold": 567,
      "reviewCount": 456,
      "imageUrl": "...",
      "rank": 1,
      "status": "In Stock"
    }
  ],
  "pagination": { ... }
}
```

**Implementation:**
- Use React Query to fetch top 5 products for the left column
- Display rank, image, name, category, and totalSold
- Format totalSold as "{number} sold" in orange text

**2. Fetch Sales Insights:**
```typescript
GET /api/top-sellers/insights

Response:
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

**Implementation:**
- Fetch insights on page load
- Display in three cards:
  - Trending: Show growth percentage with "+" sign and category name
  - Best Category: Show category name and units sold
  - Peak Day: Show day name and percentage

**3. Fetch All Products (for table):**
```typescript
GET /api/top-sellers/products?search={search}&category={category}&page={page}&limit={limit}

// Same endpoint as #1, but with pagination for table
```

**Implementation:**
- Use same endpoint with pagination
- Display in DataTable component
- Default sort by totalSold descending

### Component Structure

```typescript
// app/top-sellers/page.tsx
export default function TopSellersPage() {
  // Fetch top 5 products
  const { data: topProducts } = useQuery({
    queryKey: ['top-sellers', 'products', { limit: 5 }],
    queryFn: () => fetchTopSellingProducts({ limit: 5 })
  });

  // Fetch insights
  const { data: insights } = useQuery({
    queryKey: ['top-sellers', 'insights'],
    queryFn: fetchSalesInsights
  });

  // Fetch all products for table
  const { data: productsData } = useQuery({
    queryKey: ['top-sellers', 'products', filters],
    queryFn: () => fetchTopSellingProducts(filters)
  });

  return (
    <div>
      <div className="grid grid-cols-2 gap-6">
        {/* Left: Top Selling Products List */}
        <TopSellingProductsList products={topProducts?.data} />
        
        {/* Right: Sales Insights */}
        <SalesInsightsCards insights={insights?.data} />
      </div>
      
      {/* Bottom: Products Table */}
      <ProductsTable 
        products={productsData?.data} 
        pagination={productsData?.pagination}
        defaultSort={{ sortBy: 'totalSold', sortOrder: 'desc' }}
      />
    </div>
  );
}
```

### UI Components Needed

1. **TopSellingProductsList Component:**
   - Rank badge (orange circle with number)
   - Product image (circular)
   - Product name
   - Category badge
   - Units sold (orange text)

2. **SalesInsightsCards Component:**
   - Three cards with different background colors
   - Large percentage/number display
   - Description text

3. **ProductsTable Component:**
   - Reusable table component
   - Sort by totalSold by default
   - Search and filter functionality

---

## STOCK ALERTS PAGE INTEGRATION

Build the **Stock Alerts** page (`/stock-alerts`) that integrates with the backend API endpoints.

### Page Layout

**Top Section - Stock Alerts:**
- Title: "Stock Alerts" with subtitle "Monitor and manage inventory levels"

**Three Alert Sections:**
1. **Out of Stock (Red Section):**
   - Header: "Out of Stock ({count})" in red text
   - Product list with:
     - Product name (red text)
     - Red box icon
     - "Reorder" button on the right

2. **Going to be Out of Stock Soon (Orange Section):**
   - Header: "Going to be Out of Stock Soon ({count})" in orange text
   - Clock icon
   - Product list with:
     - Product name (orange text)
     - Remaining units in parentheses (e.g., "8 left")
     - Orange box icon
     - "Reorder" button on the right

3. **Low Stock (Yellow Section):**
   - Header: "Low Stock ({count})" in yellow text
   - Product list with:
     - Product name (yellow text)
     - Remaining units in parentheses
     - Yellow box icon
     - "Reorder" button on the right

**Right Sidebar - Quick Actions:**
- Title: "Quick Actions"
- Three action items:
  1. "Generate Reorder Report" - "Create a list of products that need restocking"
  2. "Set Stock Thresholds" - "Configure minimum stock levels for alerts"
  3. "Export Inventory" - "Download current stock data as CSV"

**Bottom Section - Out of Stock Products Table:**
- Title: "Out of Stock Products"
- Search bar: "Search products by name or category..."
- Full products table with columns:
  - Product (image, name, review count)
  - Category
  - Price
  - Discount
  - Stock
  - Status (red "Out of Stock" badge)
  - Rating
  - Sales
  - Actions (Edit, View, Delete icons)

### API Integration

**1. Fetch All Stock Alerts:**
```typescript
GET /api/stock-alerts/all?threshold=10

Response:
{
  "success": true,
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
        }
      ]
    },
    "lowStock": {
      "count": 2,
      "products": [...]
    }
  }
}
```

**Implementation:**
- Fetch on page load
- Display in three sections with appropriate colors
- Show count in header
- Display product name and remaining units (if applicable)
- Add "Reorder" button for each product

**2. Fetch Out of Stock Products (for table):**
```typescript
GET /api/stock-alerts/out-of-stock?search={search}&category={category}&page={page}&limit={limit}

Response:
{
  "success": true,
  "data": [...],
  "pagination": { ... }
}
```

**Implementation:**
- Use for bottom table
- Filter by out of stock only
- Search and pagination support

**3. Fetch Low Stock Products:**
```typescript
GET /api/stock-alerts/low-stock?threshold=10&search={search}&page={page}&limit={limit}

Response:
{
  "success": true,
  "data": [
    {
      "_id": "product_id",
      "name": "Hennessy XO",
      "stock": 8,
      "status": "Low Stock",
      "remainingUnits": 8
    }
  ],
  "pagination": { ... }
}
```

**4. Generate Reorder Report:**
```typescript
GET /api/stock-alerts/reorder-report?threshold=10

Response:
{
  "success": true,
  "data": {
    "generatedAt": "2024-12-16T10:30:00.000Z",
    "threshold": 10,
    "outOfStock": {
      "count": 2,
      "products": [...]
    },
    "lowStock": {
      "count": 2,
      "products": [...]
    },
    "totalProductsNeedingReorder": 4
  }
}
```

**Implementation:**
- Trigger from "Generate Reorder Report" button
- Display report in modal or download as CSV
- Show summary and product list

**5. Reorder Product (Update Stock):**
```typescript
PUT /api/stock-alerts/reorder/:id

Request Body:
{
  "quantity": 50
}

Response:
{
  "success": true,
  "message": "Product stock updated successfully",
  "data": {
    "_id": "product_id",
    "name": "Grey Goose Vodka",
    "stock": 50,
    "status": "In Stock"
  }
}
```

**Implementation:**
- Trigger from "Reorder" button
- Show modal/form to enter quantity
- Update stock and refresh alerts
- Show success toast notification

### Component Structure

```typescript
// app/stock-alerts/page.tsx
export default function StockAlertsPage() {
  const [threshold, setThreshold] = useState(10);

  // Fetch all stock alerts
  const { data: alerts, refetch } = useQuery({
    queryKey: ['stock-alerts', 'all', threshold],
    queryFn: () => fetchAllStockAlerts({ threshold })
  });

  // Fetch out of stock products for table
  const { data: outOfStockProducts } = useQuery({
    queryKey: ['stock-alerts', 'out-of-stock', filters],
    queryFn: () => fetchOutOfStockProducts(filters)
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: ({ productId, quantity }) => 
      reorderProduct(productId, quantity),
    onSuccess: () => {
      refetch();
      toast.success('Product stock updated successfully');
    }
  });

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="col-span-2">
        <StockAlertsSections 
          alerts={alerts?.data}
          onReorder={(productId) => handleReorder(productId)}
        />
        
        <OutOfStockTable 
          products={outOfStockProducts?.data}
          pagination={outOfStockProducts?.pagination}
        />
      </div>

      {/* Right Sidebar */}
      <div className="col-span-1">
        <QuickActionsSidebar 
          onGenerateReport={() => handleGenerateReport()}
          onSetThreshold={() => handleSetThreshold()}
          onExportInventory={() => handleExportInventory()}
        />
      </div>
    </div>
  );
}
```

### UI Components Needed

1. **StockAlertsSections Component:**
   - Three sections with different colors (red, orange, yellow)
   - Product list with reorder button
   - Count display in header

2. **QuickActionsSidebar Component:**
   - Three action buttons
   - Descriptions for each action

3. **ReorderModal Component:**
   - Form to enter quantity
   - Submit button
   - Validation

4. **OutOfStockTable Component:**
   - Products table
   - Search functionality
   - Status badges (red "Out of Stock")

### Quick Actions Implementation

**1. Generate Reorder Report:**
```typescript
const handleGenerateReport = async () => {
  const report = await fetchReorderReport({ threshold });
  // Display in modal or download as CSV
  downloadCSV(report.data);
};
```

**2. Set Stock Thresholds:**
```typescript
const handleSetThreshold = () => {
  // Open modal to set threshold
  // Update threshold state
  // Refetch alerts
};
```

**3. Export Inventory:**
```typescript
const handleExportInventory = async () => {
  // Fetch all products with stock data
  // Export as CSV
  const products = await fetchAllProducts();
  exportToCSV(products);
};
```

---

## API CLIENT FUNCTIONS

Add these functions to your API client (`lib/api.ts`):

```typescript
// Top Sellers API
export const topSellersAPI = {
  getProducts: (params) => 
    fetch(`${API_BASE_URL}/top-sellers/products?${new URLSearchParams(params)}`),
  
  getInsights: () => 
    fetch(`${API_BASE_URL}/top-sellers/insights`),
};

// Stock Alerts API
export const stockAlertsAPI = {
  getAll: (params) => 
    fetch(`${API_BASE_URL}/stock-alerts/all?${new URLSearchParams(params)}`),
  
  getOutOfStock: (params) => 
    fetch(`${API_BASE_URL}/stock-alerts/out-of-stock?${new URLSearchParams(params)}`),
  
  getLowStock: (params) => 
    fetch(`${API_BASE_URL}/stock-alerts/low-stock?${new URLSearchParams(params)}`),
  
  getReorderReport: (params) => 
    fetch(`${API_BASE_URL}/stock-alerts/reorder-report?${new URLSearchParams(params)}`),
  
  reorder: (productId, quantity) => 
    fetch(`${API_BASE_URL}/stock-alerts/reorder/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity })
    }),
};
```

---

## STYLING REQUIREMENTS

**Top Sellers Page:**
- Dark theme background
- Orange accents for rankings and units sold
- Green card for trending category
- Orange card for best category
- Dark grey card for peak sales day

**Stock Alerts Page:**
- Red section for out of stock (background: rgba(239, 68, 68, 0.1))
- Orange section for going out of stock (background: rgba(249, 115, 22, 0.1))
- Yellow section for low stock (background: rgba(234, 179, 8, 0.1))
- Red badges for "Out of Stock" status
- Yellow badges for "Low Stock" status

---

## ERROR HANDLING

- Show loading states while fetching
- Display error messages if API calls fail
- Handle empty states (no products, no alerts)
- Validate quantity input for reorder (must be > 0)

---

## REAL-TIME UPDATES

- Poll stock alerts every 30 seconds
- Refresh after reorder action
- Update counts in real-time
- Show toast notifications for actions

---

**Build both pages following this prompt. Ensure proper error handling, loading states, and user experience matching the dashboard design.**






