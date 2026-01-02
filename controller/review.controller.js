import {
  getAllReviews,
  getReviewSummary,
  getMostReviewedProducts,
  createReview,
  updateReview as updateReviewService,
  deleteReview,
} from "../services/review.service.js";

export const fetchAllReviews = async (req, res) => {
  try {
    const result = await getAllReviews(req.query);
    res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      data: result.reviews,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching reviews",
    });
  }
};

export const fetchReviewSummary = async (req, res) => {
  try {
    const summary = await getReviewSummary();
    res.status(200).json({
      success: true,
      message: "Review summary fetched successfully",
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching review summary",
    });
  }
};

export const fetchMostReviewedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const products = await getMostReviewedProducts(limit);
    res.status(200).json({
      success: true,
      message: "Most reviewed products fetched successfully",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching most reviewed products",
    });
  }
};

export const createNewReview = async (req, res) => {
  try {
    const newReview = await createReview(req.body);
    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: newReview,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error creating review",
    });
  }
};

export const updateReview = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedReview = await updateReviewService(id, req.body);
    if (!updatedReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: updatedReview,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error updating review",
    });
  }
};

export const deleteReviewById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await deleteReview(id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting review",
    });
  }
};

