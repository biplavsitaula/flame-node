import Order from "../models/order.models.js";
import Payment from "../models/payment.models.js";
import Product from "../models/product.models.js";

export const generateMonthlyReport = async (year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Get orders
  const orders = await Order.find({
    createdAt: { $gte: startDate, $lte: endDate },
  })
    .populate("items.productId", "name category")
    .lean();

  // Get payments
  const payments = await Payment.find({
    createdAt: { $gte: startDate, $lte: endDate },
  })
    .populate("orderId", "billNumber")
    .lean();

  // Calculate revenue
  const revenue = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  // Get product sales
  const productSales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $unwind: "$items",
    },
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $unwind: "$product",
    },
    {
      $group: {
        _id: "$items.productId",
        name: { $first: "$product.name" },
        category: { $first: "$product.category" },
        quantitySold: { $sum: "$items.quantity" },
        revenue: { $sum: "$items.total" },
      },
    },
    {
      $sort: { quantitySold: -1 },
    },
  ]);

  // Get stock levels
  const stockLevels = await Product.find()
    .select("name category stock price")
    .sort({ category: 1, name: 1 })
    .lean();

  return {
    period: {
      year,
      month,
      startDate,
      endDate,
    },
    summary: {
      totalOrders: orders.length,
      totalRevenue: revenue,
      totalPayments: payments.length,
      completedPayments: payments.filter((p) => p.status === "completed").length,
      pendingPayments: payments.filter((p) => p.status === "pending").length,
    },
    orders,
    payments,
    productSales,
    stockLevels,
  };
};

// Helper function to format data for Excel
export const formatDataForExcel = (reportData) => {
  return {
    summary: [
      ["Metric", "Value"],
      ["Total Orders", reportData.summary.totalOrders],
      ["Total Revenue", `$${reportData.summary.totalRevenue.toFixed(2)}`],
      ["Total Payments", reportData.summary.totalPayments],
      ["Completed Payments", reportData.summary.completedPayments],
      ["Pending Payments", reportData.summary.pendingPayments],
    ],
    orders: [
      [
        "Bill Number",
        "Customer",
        "Location",
        "Items",
        "Total Amount",
        "Status",
        "Payment Method",
        "Date",
      ],
      ...reportData.orders.map((order) => [
        order.billNumber,
        order.customer.fullName,
        order.customer.location,
        order.items.map((i) => `${i.name} x${i.quantity}`).join(", "),
        `$${order.totalAmount.toFixed(2)}`,
        order.status,
        order.paymentMethod,
        new Date(order.createdAt).toLocaleDateString(),
      ]),
    ],
    payments: [
      [
        "Bill Number",
        "Customer",
        "Amount",
        "Method",
        "Status",
        "Date",
      ],
      ...reportData.payments.map((payment) => [
        payment.billNumber,
        payment.customer.fullName,
        `$${payment.amount.toFixed(2)}`,
        payment.method,
        payment.status,
        new Date(payment.createdAt).toLocaleDateString(),
      ]),
    ],
    productSales: [
      ["Product Name", "Category", "Quantity Sold", "Revenue"],
      ...reportData.productSales.map((product) => [
        product.name,
        product.category,
        product.quantitySold,
        `$${product.revenue.toFixed(2)}`,
      ]),
    ],
    stockLevels: [
      ["Product Name", "Category", "Stock", "Price"],
      ...reportData.stockLevels.map((product) => [
        product.name,
        product.category,
        product.stock,
        `$${product.price.toFixed(2)}`,
      ]),
    ],
  };
};












