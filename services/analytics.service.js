import Order from "../models/order.models.js";
import Product from "../models/product.models.js";
import Payment from "../models/payment.models.js";

// Get current month and previous month dates
const getMonthRange = () => {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  return {
    currentMonthStart,
    currentMonthEnd,
    previousMonthStart,
    previousMonthEnd,
  };
};

// Calculate percentage change
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

export const getAnalyticsSummary = async () => {
  const {
    currentMonthStart,
    currentMonthEnd,
    previousMonthStart,
    previousMonthEnd,
  } = getMonthRange();

  // Total Revenue
  const [currentMonthRevenue, previousMonthRevenue] = await Promise.all([
    Payment.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]),
    Payment.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]),
  ]);

  const totalRevenue = currentMonthRevenue[0]?.total || 0;
  const previousRevenue = previousMonthRevenue[0]?.total || 0;
  const revenueGrowth = calculatePercentageChange(totalRevenue, previousRevenue);

  // Total Sales (number of orders)
  const [currentMonthSales, previousMonthSales] = await Promise.all([
    Order.countDocuments({
      createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
    }),
    Order.countDocuments({
      createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
    }),
  ]);

  const salesGrowth = calculatePercentageChange(
    currentMonthSales,
    previousMonthSales
  );

  // Average Order Value
  const [currentMonthOrders, previousMonthOrders] = await Promise.all([
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
        },
      },
      {
        $group: {
          _id: null,
          avg: { $avg: "$totalAmount" },
        },
      },
    ]),
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
        },
      },
      {
        $group: {
          _id: null,
          avg: { $avg: "$totalAmount" },
        },
      },
    ]),
  ]);

  const avgOrderValue = currentMonthOrders[0]?.avg || 0;
  const previousAvgOrderValue = previousMonthOrders[0]?.avg || 0;
  const avgOrderValueGrowth = calculatePercentageChange(
    avgOrderValue,
    previousAvgOrderValue
  );

  // Products Sold
  const [currentMonthProductsSold, previousMonthProductsSold] = await Promise.all([
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
        },
      },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$items.quantity" },
        },
      },
    ]),
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
        },
      },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$items.quantity" },
        },
      },
    ]),
  ]);

  const productsSold = currentMonthProductsSold[0]?.total || 0;
  const previousProductsSold = previousMonthProductsSold[0]?.total || 0;
  const productsSoldGrowth = calculatePercentageChange(
    productsSold,
    previousProductsSold
  );

  return {
    totalRevenue: {
      value: totalRevenue,
      growth: revenueGrowth,
      previousValue: previousRevenue,
    },
    totalSales: {
      value: currentMonthSales,
      growth: salesGrowth,
      previousValue: previousMonthSales,
    },
    avgOrderValue: {
      value: Math.round(avgOrderValue * 100) / 100,
      growth: avgOrderValueGrowth,
      previousValue: Math.round(previousAvgOrderValue * 100) / 100,
    },
    productsSold: {
      value: productsSold,
      growth: productsSoldGrowth,
      previousValue: previousProductsSold,
    },
  };
};

export const getSalesTrend = async () => {
  const salesTrend = await Payment.aggregate([
    {
      $match: {
        status: "completed",
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
  ]);

  // Format for chart (Jan-Dec)
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const chartData = monthNames.map((month, index) => {
    const data = salesTrend.find((item) => item._id.month === index + 1);
    return {
      month,
      revenue: data?.revenue || 0,
      count: data?.count || 0,
    };
  });

  return chartData;
};

export const getStockByCategory = async () => {
  const stockByCategory = await Product.aggregate([
    {
      $group: {
        _id: "$category",
        inStock: {
          $sum: {
            $cond: [{ $gte: ["$stock", 10] }, 1, 0],
          },
        },
        lowStock: {
          $sum: {
            $cond: [
              { $and: [{ $gt: ["$stock", 0] }, { $lt: ["$stock", 10] }] },
              1,
              0,
            ],
          },
        },
        outOfStock: {
          $sum: {
            $cond: [{ $eq: ["$stock", 0] }, 1, 0],
          },
        },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  return stockByCategory.map((item) => ({
    category: item._id,
    inStock: item.inStock,
    lowStock: item.lowStock,
    outOfStock: item.outOfStock,
  }));
};

export const getProductsByCategory = async () => {
  const productsByCategory = await Product.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  const total = productsByCategory.reduce((sum, item) => sum + item.count, 0);

  return productsByCategory.map((item) => ({
    category: item._id,
    count: item.count,
    percentage: Math.round((item.count / total) * 100),
  }));
};

export const getRevenueByCategory = async () => {
  const revenueByCategory = await Order.aggregate([
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
        _id: "$product.category",
        revenue: { $sum: "$items.total" },
        count: { $sum: "$items.quantity" },
      },
    },
    {
      $sort: { revenue: -1 },
    },
  ]);

  const totalRevenue = revenueByCategory.reduce(
    (sum, item) => sum + item.revenue,
    0
  );

  return revenueByCategory.map((item) => ({
    category: item._id,
    revenue: item.revenue,
    count: item.count,
    percentage: totalRevenue > 0 ? Math.round((item.revenue / totalRevenue) * 100) : 0,
  }));
};












