# Database Seeders

This directory contains seed files to populate the database with sample data for testing and development.

## Available Seeders

1. **products.js** - Seeds product data
2. **order.js** - Seeds order data (requires products)
3. **payment.js** - Seeds payment data (requires orders)
4. **review.js** - Seeds review data (requires products)
5. **notification.js** - Seeds notification data (requires products, orders, payments)

## Usage

### Seed Individual Collections

```bash
# Seed products only
npm run seed:products

# Seed orders (requires products to exist)
npm run seed:orders

# Seed payments (requires orders to exist)
npm run seed:payments

# Seed reviews (requires products to exist)
npm run seed:reviews

# Seed notifications (requires products, orders, payments)
npm run seed:notifications
```

### Seed All Collections

```bash
# Seed all collections in order
npm run seed:all
```

**Note:** The `seed:all` command seeds collections in the correct order:
1. Products (required by others)
2. Orders (requires products)
3. Payments (requires orders)
4. Reviews (requires products)
5. Notifications (requires products, orders, payments)

## Seeding Order

If seeding manually, follow this order:

1. **Products** - Must be seeded first
   ```bash
   npm run seed:products
   ```

2. **Orders** - Requires products
   ```bash
   npm run seed:orders
   ```

3. **Payments** - Requires orders
   ```bash
   npm run seed:payments
   ```

4. **Reviews** - Requires products
   ```bash
   npm run seed:reviews
   ```

5. **Notifications** - Requires products, orders, and payments
   ```bash
   npm run seed:notifications
   ```

## What Gets Seeded

### Products
- 8-10 sample products with:
  - Various categories (Rum, Gin, Tequila, Vodka, Cognac, Whiskey, Champagne)
  - Different stock levels (some out of stock, some low stock)
  - Ratings and review counts
  - Discount percentages
  - Sales data

### Orders
- 50 sample orders with:
  - Random customers from Nepal
  - 1-3 items per order
  - Various statuses (placed, in-progress, delivered, completed)
  - Payment methods (QR Payment, COD)
  - Dates spread over last 30 days

### Payments
- Payment records linked to orders
- Various payment statuses
- Transaction IDs for QR payments

### Reviews
- Reviews for each product based on product's reviewCount
- Ratings that match product's average rating
- Customer names and comments
- Dates spread over last 6 months

### Notifications
- Low stock alerts for products with stock < 10
- New order notifications
- Payment completion notifications
- System updates
- Super admin updates

## Important Notes

1. **Data Clearing**: All seeders clear existing data before inserting new data
2. **Dependencies**: Some seeders require other collections to be seeded first
3. **Auto-calculation**: Product discount amounts and final prices are auto-calculated by the model
4. **Rating Updates**: Review seeder automatically updates product ratings after seeding

## Troubleshooting

If you encounter errors:

1. Make sure MongoDB is running and connected
2. Check that `.env` file has correct `MONGO_URI`
3. Seed collections in the correct order
4. Check console output for specific error messages

## Customization

You can modify the seed data in each seeder file to match your needs:
- Change product names, prices, categories
- Adjust number of orders/reviews
- Modify customer data
- Update notification messages











