import Product from "../models/product.models.js";

export const getOutOfStockProducts = async (query = {}) => {
  const {
    search,
    category,
    sortBy = "name",
    sortOrder = "asc",
    page = 1,
    limit = 10,
  } = query;

  const filter = { stock: 0 };

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

  const total = await Product.countDocuments(filter);

  return {
    products: products.map((p) => ({ ...p, status: "Out of Stock" })),
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

export const getLowStockProducts = async (query = {}, threshold = 10) => {
  const {
    search,
    category,
    sortBy = "stock",
    sortOrder = "asc",
    page = 1,
    limit = 10,
  } = query;

  const filter = {
    stock: { $gt: 0, $lt: threshold },
  };

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

  const total = await Product.countDocuments(filter);

  return {
    products: products.map((p) => ({
      ...p,
      status: "Low Stock",
      remainingUnits: p.stock,
    })),
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

export const getAllStockAlerts = async (threshold = 10) => {
  const [outOfStock, lowStock] = await Promise.all([
    Product.find({ stock: 0 }).lean(),
    Product.find({ stock: { $gt: 0, $lt: threshold } }).lean(),
  ]);

  return {
    outOfStock: {
      count: outOfStock.length,
      products: outOfStock.map((p) => ({ ...p, status: "Out of Stock" })),
    },
    goingToBeOutOfStock: {
      count: lowStock.length,
      products: lowStock.map((p) => ({
        ...p,
        status: "Low Stock",
        remainingUnits: p.stock,
      })),
    },
    lowStock: {
      count: lowStock.length,
      products: lowStock.map((p) => ({
        ...p,
        status: "Low Stock",
        remainingUnits: p.stock,
      })),
    },
  };
};

export const generateReorderReport = async (threshold = 10) => {
  const [outOfStock, lowStock] = await Promise.all([
    Product.find({ stock: 0 })
      .select("name category brand price stock")
      .sort({ category: 1, name: 1 })
      .lean(),
    Product.find({ stock: { $gt: 0, $lt: threshold } })
      .select("name category brand price stock")
      .sort({ stock: 1, category: 1, name: 1 })
      .lean(),
  ]);

  return {
    generatedAt: new Date(),
    threshold,
    outOfStock: {
      count: outOfStock.length,
      products: outOfStock,
    },
    lowStock: {
      count: lowStock.length,
      products: lowStock,
    },
    totalProductsNeedingReorder: outOfStock.length + lowStock.length,
  };
};

export const reorderProduct = async (productId, quantity) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  product.stock += quantity;
  await product.save();

  return {
    ...product.toObject(),
    status: product.stock === 0 ? "Out of Stock" : product.stock < 10 ? "Low Stock" : "In Stock",
  };
};












