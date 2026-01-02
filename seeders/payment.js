import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Order from "../models/order.models.js";
import Payment from "../models/payment.models.js";

dotenv.config();

const seedPayments = async () => {
  try {
    await connectDB();

    // Get all orders
    const orders = await Order.find();
    if (orders.length === 0) {
      console.log("❌ No orders found. Please seed orders first.");
      process.exit(1);
    }

    // Clear existing payments
    await Payment.deleteMany();

    const payments = [];

    for (const order of orders) {
      const status =
        order.paymentMethod === "QR Payment"
          ? "completed"
          : order.status === "completed"
          ? "completed"
          : Math.random() > 0.3
          ? "pending"
          : "completed";

      payments.push({
        orderId: order._id,
        billNumber: order.billNumber,
        customer: {
          fullName: order.customer.fullName,
          mobile: order.customer.mobile,
        },
        amount: order.totalAmount,
        method: order.paymentMethod,
        status,
        transactionId:
          order.paymentMethod === "QR Payment"
            ? `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`
            : null,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      });
    }

    // Insert payments
    const insertedPayments = await Payment.insertMany(payments);

    console.log(`✅ ${insertedPayments.length} payments seeded successfully!`);
    process.exit();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedPayments();

