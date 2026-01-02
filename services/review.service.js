import Review from "../models/review.models.js";
import Product from "../models/product.models.js";
import { updateProductRating } from "./product.service.js";

export const getAllReviews = async (query = {}) => {
  const {
    search,
    productId,
    rating,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = query;

  const filter = {};

  // Search filter
  if (search) {
    filter.$or = [
      { customerName: { $regex: search, $options: "i" } },
      { comment: { $regex: search, $options: "i" } },
    ];
  }

  // Product filter
  if (productId) {
    filter.productId = productId;
  }

  // Rating filter
  if (rating) {
    filter.rating = parseInt(rating);
  }

  // Sort
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const reviews = await Review.find(filter)
    .populate("productId", "name imageUrl category")
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await Review.countDocuments(filter);

  return {
    reviews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

export const getReviewSummary = async () => {
  const [totalReviews, averageRating, ratingDistribution] = await Promise.all([
    Review.countDocuments(),
    Review.aggregate([
      {
        $group: {
          _id: null,
          avg: { $avg: "$rating" },
        },
      },
    ]),
    Review.aggregate([
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]),
  ]);

  const avg = averageRating[0]?.avg || 0;
  const roundedAvg = Math.round(avg * 10) / 10;

  // Create distribution object (1-5 stars)
  const distribution = {};
  for (let i = 5; i >= 1; i--) {
    const ratingData = ratingDistribution.find((r) => r._id === i);
    distribution[i] = ratingData?.count || 0;
  }

  return {
    totalReviews,
    averageRating: roundedAvg,
    ratingDistribution: distribution,
  };
};

export const getMostReviewedProducts = async (limit = 5) => {
  const products = await Product.find({ reviewCount: { $gt: 0 } })
    .sort({ reviewCount: -1 })
    .limit(limit)
    .select("name category imageUrl reviewCount rating")
    .lean();

  return products.map((product, index) => ({
    rank: index + 1,
    ...product,
  }));
};

export const createReview = async (reviewData) => {
  // Verify product exists
  const product = await Product.findById(reviewData.productId);
  if (!product) {
    throw new Error("Product not found");
  }

  const review = new Review(reviewData);
  const savedReview = await review.save();

  // Update product rating and review count
  await updateProductRating(reviewData.productId);

  return await Review.findById(savedReview._id)
    .populate("productId", "name imageUrl category")
    .lean();
};

export const updateReview = async (id, reviewData) => {
  const review = await Review.findByIdAndUpdate(id, reviewData, {
    new: true,
    runValidators: true,
  })
    .populate("productId", "name imageUrl category")
    .lean();

  if (!review) return null;

  // Update product rating
  await updateProductRating(review.productId._id);

  return review;
};

export const deleteReview = async (id) => {
  const review = await Review.findById(id);
  if (!review) return null;

  const productId = review.productId;
  await Review.findByIdAndDelete(id);

  // Update product rating
  await updateProductRating(productId);

  return { message: "Review deleted successfully" };
};









