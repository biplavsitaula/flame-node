import Product from "../models/product.models.js";
import Notification from "../models/notification.models.js";

// Helper function to get stock status
const getStockStatus = (stock) => {
  if (stock === 0) return "Out of Stock";
  if (stock < 10) return "Low Stock";
  return "In Stock";
};

// Helper function to check and create low stock notification
const checkLowStockNotification = async (product) => {
  if (product.stock < 10 && product.stock > 0) {
    const existingNotification = await Notification.findOne({
      type: "Low Stock Alert",
      relatedId: product._id,
      isRead: false,
    });

    if (!existingNotification) {
      await Notification.create({
        type: "Low Stock Alert",
        title: "Low Stock Alert",
        message: `${product.name} is running low. Only ${product.stock} units remaining.`,
        relatedId: product._id,
        relatedModel: "Product",
        priority: "high",
      });
    }
  }
};

export const getAllProducts = async (query = {}) => {
  const {
    search,
    category,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
    view = "all", // all, out-of-stock, low-stock, top-sellers, most-reviewed, recommended
  } = query;

  const filter = {};

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

  // Status filter
  if (status) {
    if (status === "Out of Stock") {
      filter.stock = 0;
    } else if (status === "Low Stock") {
      filter.stock = { $gt: 0, $lt: 10 };
    } else if (status === "In Stock") {
      filter.stock = { $gte: 10 };
    }
  }

  // View filters
  if (view === "out-of-stock") {
    filter.stock = 0;
  } else if (view === "low-stock") {
    filter.stock = { $gt: 0, $lt: 10 };
  } else if (view === "top-sellers") {
    filter.totalSold = { $gt: 0 };
  } else if (view === "most-reviewed") {
    filter.reviewCount = { $gt: 0 };
  } else if (view === "recommended") {
    filter.isRecommended = true;
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

  // Add status to each product
  const productsWithStatus = products.map((product) => ({
    ...product,
    status: getStockStatus(product.stock),
  }));

  const total = await Product.countDocuments(filter);

  return {
    products: productsWithStatus,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

export const getProductById = async (id) => {
  const product = await Product.findById(id).lean();
  if (!product) return null;
  return {
    ...product,
    status: getStockStatus(product.stock),
  };
};

export const createProduct = async (productData) => {
  // Map 'type' to 'category' if 'type' is provided but 'category' is not
  if (productData.type && !productData.category) {
    productData.category = productData.type;
    delete productData.type;
  }

  // Map 'image' to 'imageUrl' if 'image' is provided but 'imageUrl' is not
  if (productData.image !== undefined && productData.imageUrl === undefined) {
    productData.imageUrl = productData.image;
    delete productData.image;
  }

  // Convert category to lowercase if provided
  if (productData.category) {
    productData.category = productData.category.toLowerCase();
  }

  // Calculate discount and final price
  const price = productData.price || 0;
  const discountPercent = productData.discountPercent || 0;
  productData.discountAmount = (price * discountPercent) / 100;
  productData.finalPrice = price - productData.discountAmount;

  const product = new Product(productData);
  const savedProduct = await product.save();

  // Check for low stock notification
  await checkLowStockNotification(savedProduct);

  return {
    ...savedProduct.toObject(),
    status: getStockStatus(savedProduct.stock),
  };
};

export const updateProduct = async (id, productData) => {
  // Map 'type' to 'category' if 'type' is provided but 'category' is not
  if (productData.type && !productData.category) {
    productData.category = productData.type;
    delete productData.type;
  }

  // Map 'image' to 'imageUrl' if 'image' is provided but 'imageUrl' is not
  if (productData.image !== undefined && productData.imageUrl === undefined) {
    productData.imageUrl = productData.image;
    delete productData.image;
  }

  // Convert category to lowercase if provided
  if (productData.category) {
    productData.category = productData.category.toLowerCase();
  }

  // Recalculate discount if price or discountPercent changed
  if (productData.price !== undefined || productData.discountPercent !== undefined) {
    const existingProduct = await Product.findById(id);
    if (existingProduct) {
      const price = productData.price !== undefined ? productData.price : existingProduct.price;
      const discountPercent =
        productData.discountPercent !== undefined
          ? productData.discountPercent
          : existingProduct.discountPercent || 0;

      productData.discountAmount = (price * discountPercent) / 100;
      productData.finalPrice = price - productData.discountAmount;
    }
  }

  const updatedProduct = await Product.findByIdAndUpdate(id, productData, {
    new: true,
    runValidators: true,
  });

  if (!updatedProduct) return null;

  // Check for low stock notification
  await checkLowStockNotification(updatedProduct);

  return {
    ...updatedProduct.toObject(),
    status: getStockStatus(updatedProduct.stock),
  };
};

export const deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};

export const updateProductStock = async (productId, quantity, operation = "decrease") => {
  const product = await Product.findById(productId);
  if (!product) return null;

  if (operation === "decrease") {
    product.stock = Math.max(0, product.stock - quantity);
  } else {
    product.stock += quantity;
  }

  const savedProduct = await product.save();
  await checkLowStockNotification(savedProduct);

  return {
    ...savedProduct.toObject(),
    status: getStockStatus(savedProduct.stock),
  };
};

export const incrementProductSales = async (productId, quantity) => {
  return await Product.findByIdAndUpdate(
    productId,
    { $inc: { totalSold: quantity } },
    { new: true }
  );
};

export const updateProductRating = async (productId) => {
  const Review = (await import("../models/review.models.js")).default;
  const reviews = await Review.find({ productId });
  
  if (reviews.length === 0) {
    return await Product.findByIdAndUpdate(
      productId,
      { rating: 0, reviewCount: 0 },
      { new: true }
    );
  }

  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return await Product.findByIdAndUpdate(
    productId,
    {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      reviewCount: reviews.length,
    },
    { new: true }
  );
};

/**
 * Get all unique brands from products
 */
export const getAllBrands = async () => {
  // Get distinct brands that are not empty or null
  const brands = await Product.distinct("brand", {
    brand: { $exists: true, $ne: null, $ne: "" },
  });

  // Filter out empty strings and sort alphabetically
  const uniqueBrands = brands
    .filter((brand) => brand && brand.trim() !== "")
    .map((brand) => brand.trim())
    .sort();

  // Get product count per brand
  const brandsWithCount = await Promise.all(
    uniqueBrands.map(async (brand) => {
      const count = await Product.countDocuments({ brand: brand });
      return {
        name: brand,
        productCount: count,
      };
    })
  );

  return brandsWithCount;
};
