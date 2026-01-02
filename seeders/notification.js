import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Product from "../models/product.models.js";
import Order from "../models/order.models.js";
import Payment from "../models/payment.models.js";
import Notification from "../models/notification.models.js";

dotenv.config();

const seedNotifications = async () => {
  try {
    await connectDB();

    // Get some data for notifications
    const products = await Product.find({ stock: { $lt: 10 } }).limit(5);
    const orders = await Order.find().sort({ createdAt: -1 }).limit(10);
    const payments = await Payment.find({ status: "completed" })
      .sort({ createdAt: -1 })
      .limit(10);

    // Clear existing notifications
    await Notification.deleteMany();

    const notifications = [];

    // Low Stock Alerts
    for (const product of products) {
      notifications.push({
        type: "Low Stock Alert",
        title: "Low Stock Alert",
        message: `${product.name} is running low. Only ${product.stock} units remaining.`,
        relatedId: product._id,
        relatedModel: "Product",
        isRead: Math.random() > 0.3,
        priority: "high",
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
      });
    }

    // New Order Notifications
    for (const order of orders.slice(0, 8)) {
      notifications.push({
        type: "New Order",
        title: "New Order Received",
        message: `New order ${order.billNumber} from ${order.customer.fullName}`,
        relatedId: order._id,
        relatedModel: "Order",
        isRead: Math.random() > 0.4,
        priority: "high",
        createdAt: order.createdAt,
      });
    }

    // Payment Notifications
    for (const payment of payments.slice(0, 6)) {
      if (payment.status === "completed") {
        notifications.push({
          type: "New Payment",
          title: "Payment Received",
          message: `Payment of $${payment.amount.toFixed(2)} received for order ${payment.billNumber}`,
          relatedId: payment._id,
          relatedModel: "Payment",
          isRead: Math.random() > 0.5,
          priority: "medium",
          createdAt: payment.createdAt,
        });
      }
    }

    // System Updates
    const systemMessages = [
      {
        title: "System Update",
        message: "New features added to the admin panel. Check out the latest updates!",
      },
      {
        title: "Maintenance Scheduled",
        message: "System maintenance scheduled for next week. Please plan accordingly.",
      },
      {
        title: "Backup Completed",
        message: "Daily backup completed successfully.",
      },
    ];

    for (const msg of systemMessages) {
      notifications.push({
        type: "System Update",
        title: msg.title,
        message: msg.message,
        isRead: Math.random() > 0.6,
        priority: "low",
        createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000), // Last 3 days
      });
    }

    // Super Admin Updates
    const adminMessages = [
      {
        title: "Super Admin Update",
        message: "New inventory management features are now available.",
      },
      {
        title: "Super Admin Update",
        message: "Analytics dashboard has been enhanced with new metrics.",
      },
    ];

    for (const msg of adminMessages) {
      notifications.push({
        type: "Super Admin Update",
        title: msg.title,
        message: msg.message,
        isRead: Math.random() > 0.7,
        priority: "medium",
        createdAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000), // Last 5 days
      });
    }

    // Sort by createdAt (newest first)
    notifications.sort((a, b) => b.createdAt - a.createdAt);

    // Insert notifications
    const insertedNotifications = await Notification.insertMany(notifications);

    console.log(`✅ ${insertedNotifications.length} notifications seeded successfully!`);
    console.log(`   - ${notifications.filter(n => !n.isRead).length} unread notifications`);
    process.exit();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedNotifications();

