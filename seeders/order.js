import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Product from "../models/product.models.js";
import Order from "../models/order.models.js";

dotenv.config();

const seedOrders = async () => {
  try {
    await connectDB();

    // Get some products to use in orders
    const products = await Product.find().limit(10);
    if (products.length === 0) {
      console.log("❌ No products found. Please seed products first.");
      process.exit(1);
    }

    // Clear existing orders
    await Order.deleteMany();

    const customers = [
      {
        fullName: "Hari Bahadur",
        mobile: "9841234567",
        panNumber: "ABCDE1234F",
        location: "Lalitpur, Nepal",
      },
    ];

    const paymentMethods = ["COD", "Online"];
    const paymentGateways = ["esewa", "khalti", "card"];
    const statuses = ["placed", "in-progress", "delivered", "completed"];

    const orders = [];

    // Get current year for bill number generation
    const currentYear = new Date().getFullYear();
    let billCounter = 1;

    // Create orders for the last 30 days
    for (let i = 0; i < 50; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const paymentMethod =
        paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const paymentGateway = paymentMethod === "Online"
        ? paymentGateways[Math.floor(Math.random() * paymentGateways.length)]
        : null;
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      // Random number of items (1-3)
      const itemCount = Math.floor(Math.random() * 3) + 1;
      const selectedProducts = [];
      const usedProductIds = new Set();

      for (let j = 0; j < itemCount; j++) {
        let product;
        do {
          product = products[Math.floor(Math.random() * products.length)];
        } while (usedProductIds.has(product._id.toString()));
        usedProductIds.add(product._id.toString());

        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = product.finalPrice || product.price;
        selectedProducts.push({
          productId: product._id,
          name: product.name,
          quantity,
          price,
          total: price * quantity,
        });
      }

      const subtotal = selectedProducts.reduce(
        (sum, item) => sum + item.total,
        0
      );

      // Calculate delivery fee (free if subtotal >= 2000)
      const deliveryFee = subtotal >= 2000 ? 0 : 500;
      const totalAmount = subtotal + deliveryFee;

      // Random date within last 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(
        Math.floor(Math.random() * 12) + 9,
        Math.floor(Math.random() * 60)
      );

      // Generate bill number
      const billNumber = `FB-${currentYear}-${String(billCounter).padStart(3, "0")}`;
      billCounter++;

      orders.push({
        billNumber,
        customer,
        items: selectedProducts,
        subtotal: Math.round(subtotal * 100) / 100,
        deliveryFee,
        totalAmount: Math.round(totalAmount * 100) / 100,
        status,
        paymentMethod,
        paymentGateway,
        paymentStatus: paymentMethod === "Online" ? "completed" : status === "completed" ? "completed" : "pending",
        createdAt,
        updatedAt: createdAt,
      });
    }

    // Insert orders
    const insertedOrders = await Order.insertMany(orders);

    console.log(`✅ ${insertedOrders.length} orders seeded successfully!`);
    process.exit();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedOrders();

