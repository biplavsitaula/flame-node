import Product from "../models/product.models.js";
import Order from "../models/order.models.js";

export const getTopSellingProducts = async (query = {}) => {
  const {
    search,
    category,
    sortBy = "totalSold",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = query;

  const filter = { totalSold: { $gt: 0 } };

  // Search filter
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
    ];
  }

  // Category filter
  if (category) {
    filter.category = category;
  }

  // Sort
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const products = await Product.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Add rank
  const productsWithRank = products.map((product, index) => ({
    ...product,
    rank: skip + index + 1,
    status: product.stock === 0 ? "Out of Stock" : product.stock < 10 ? "Low Stock" : "In Stock",
  }));

  const total = await Product.countDocuments(filter);

  return {
    products: productsWithRank,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

export const getSalesInsights = async () => {
  // Get current month and previous month
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // Trending category (percentage growth)
  const [currentMonthCategorySales, previousMonthCategorySales] = await Promise.all([
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
          unitsSold: { $sum: "$items.quantity" },
        },
      },
      {
        $sort: { unitsSold: -1 },
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
          unitsSold: { $sum: "$items.quantity" },
        },
      },
    ]),
  ]);

  // Calculate growth for each category
  const categoryGrowth = currentMonthCategorySales.map((current) => {
    const previous = previousMonthCategorySales.find(
      (p) => p._id === current._id
    );
    const previousUnits = previous?.unitsSold || 0;
    const growth =
      previousUnits === 0
        ? (current.unitsSold > 0 ? 100 : 0)
        : Math.round(
            ((current.unitsSold - previousUnits) / previousUnits) * 100
          );

    return {
      category: current._id,
      unitsSold: current.unitsSold,
      growth,
    };
  });

  // Find trending category (highest growth)
  const trendingCategory = categoryGrowth
    .filter((c) => c.growth > 0)
    .sort((a, b) => b.growth - a.growth)[0];

  // Best category by units sold
  const bestCategory = currentMonthCategorySales[0];

  // Peak sales day
  const peakSalesDay = await Order.aggregate([
    {
      $group: {
        _id: { $dayOfWeek: "$createdAt" },
        orderCount: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
    {
      $sort: { orderCount: -1 },
    },
    {
      $limit: 1,
    },
  ]);

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const peakDay = peakSalesDay[0]
    ? dayNames[peakSalesDay[0]._id - 1]
    : "Saturday";

  // Calculate percentage of weekly sales
  const weeklySales = await Order.aggregate([
    {
      $group: {
        _id: { $dayOfWeek: "$createdAt" },
        orderCount: { $sum: 1 },
      },
    },
  ]);

  const totalWeeklyOrders = weeklySales.reduce(
    (sum, day) => sum + day.orderCount,
    0
  );
  const peakDayOrders = peakSalesDay[0]?.orderCount || 0;
  const peakDayPercentage =
    totalWeeklyOrders > 0
      ? Math.round((peakDayOrders / totalWeeklyOrders) * 100)
      : 0;

  return {
    trendingCategory: trendingCategory
      ? {
          category: trendingCategory.category,
          growth: trendingCategory.growth,
          unitsSold: trendingCategory.unitsSold,
        }
      : null,
    bestCategory: bestCategory
      ? {
          category: bestCategory._id,
          unitsSold: bestCategory.unitsSold,
        }
      : null,
    peakSalesDay: {
      day: peakDay,
      percentage: peakDayPercentage,
      orderCount: peakDayOrders,
    },
  };
};












