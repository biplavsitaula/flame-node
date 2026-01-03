import express from "express";
import {
  fetchAllReviews,
  fetchReviewSummary,
  fetchMostReviewedProducts,
  createNewReview,
  updateReview,
  deleteReviewById,
} from "../controller/review.controller.js";
import { authenticate, checkAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/reviews", fetchAllReviews);
router.get("/reviews/summary", fetchReviewSummary);
router.get("/reviews/most-reviewed", fetchMostReviewedProducts);
router.post("/reviews", createNewReview);

// Admin routes
router.put("/reviews/:id", authenticate, checkAdmin, updateReview);
router.delete("/reviews/:id", authenticate, checkAdmin, deleteReviewById);

export default router;










