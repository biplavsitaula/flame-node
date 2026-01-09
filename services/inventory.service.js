import Inventory from "../models/inventory.model.js";
import Product from "../models/product.models.js";
import Notification from "../models/notification.models.js";

/**
 * Get all inventory transactions
 */
export const getAllInventoryTransactions = async (query = {}) => {
  const {
    productId,
    type,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 20,
  } = query;

  const filter = {};

  if (productId) {
    filter.productId = productId;
  }

  if (type) {
    filter.type = type;
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const transactions = await Inventory.find(filter)
    .populate("productId", "name imageUrl category stock")
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Add current stock to each transaction
  const transactionsWithCurrentStock = transactions.map((transaction) => ({
    ...transaction,
    currentStock: transaction.productId?.stock ?? 0,
  }));

  const total = await Inventory.countDocuments(filter);

  // Calculate summary stats
  const allTransactions = await Inventory.find(filter).lean();
  const totalAdded = allTransactions
    .filter((t) => t.type === "add")
    .reduce((sum, t) => sum + t.quantity, 0);
  const totalRemoved = allTransactions
    .filter((t) => t.type === "remove")
    .reduce((sum, t) => sum + t.quantity, 0);

  return {
    transactions: transactionsWithCurrentStock,
    summary: {
      totalAdded,
      totalRemoved,
      totalTransactions: total,
    },
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

/**
 * Bulk add stock to a product
 */
export const bulkAddStock = async (data) => {
  const { productId, quantity, reason, notes } = data;

  if (!productId) {
    throw new Error("Product ID is required");
  }

  if (!quantity || quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  // Find the product
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  const previousStock = product.stock;
  const newStock = previousStock + quantity;

  // Update product stock
  product.stock = newStock;
  await product.save();

  // Create inventory transaction record
  const transaction = await Inventory.create({
    productId: product._id,
    productName: product.name,
    type: "add",
    quantity,
    previousStock,
    newStock,
    reason: reason || "Bulk stock addition",
    notes: notes || "",
  });

  // Create notification
  await Notification.create({
    type: "System Update",
    title: "Stock Added",
    message: `${quantity} units added to ${product.name}. New stock: ${newStock}`,
    relatedId: product._id,
    relatedModel: "Product",
    priority: "medium",
  });

  return {
    transaction,
    product: {
      _id: product._id,
      name: product.name,
      previousStock,
      addedQuantity: quantity,
      newStock,
    },
  };
};

/**
 * Bulk remove stock from a product
 */
export const bulkRemoveStock = async (data) => {
  const { productId, quantity, reason, notes } = data;

  if (!productId) {
    throw new Error("Product ID is required");
  }

  if (!quantity || quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  // Find the product
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  const previousStock = product.stock;

  // Check if enough stock available
  if (previousStock < quantity) {
    throw new Error(
      `Insufficient stock. Available: ${previousStock}, Requested to remove: ${quantity}`
    );
  }

  const newStock = previousStock - quantity;

  // Update product stock
  product.stock = newStock;
  await product.save();

  // Create inventory transaction record
  const transaction = await Inventory.create({
    productId: product._id,
    productName: product.name,
    type: "remove",
    quantity,
    previousStock,
    newStock,
    reason: reason || "Bulk stock removal",
    notes: notes || "",
  });

  // Create notification based on stock level
  let notificationPriority = "medium";
  let notificationMessage = `${quantity} units removed from ${product.name}. New stock: ${newStock}`;

  if (newStock === 0) {
    notificationPriority = "high";
    notificationMessage = `⚠️ ${product.name} is now OUT OF STOCK after removing ${quantity} units`;
  } else if (newStock < 10) {
    notificationPriority = "high";
    notificationMessage = `⚠️ Low stock alert: ${product.name} has only ${newStock} units left after removing ${quantity}`;
  }

  await Notification.create({
    type: newStock < 10 ? "Low Stock Alert" : "System Update",
    title: newStock === 0 ? "Out of Stock" : newStock < 10 ? "Low Stock Alert" : "Stock Removed",
    message: notificationMessage,
    relatedId: product._id,
    relatedModel: "Product",
    priority: notificationPriority,
  });

  return {
    transaction,
    product: {
      _id: product._id,
      name: product.name,
      previousStock,
      removedQuantity: quantity,
      newStock,
    },
  };
};

/**
 * Get inventory transaction by ID
 */
export const getInventoryTransactionById = async (id) => {
  return await Inventory.findById(id)
    .populate("productId", "name imageUrl category stock")
    .lean();
};

/**
 * Get product stock history
 */
export const getProductStockHistory = async (productId) => {
  const product = await Product.findById(productId).lean();
  if (!product) {
    throw new Error("Product not found");
  }

  const transactions = await Inventory.find({ productId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return {
    product: {
      _id: product._id,
      name: product.name,
      currentStock: product.stock,
    },
    transactions,
  };
};



