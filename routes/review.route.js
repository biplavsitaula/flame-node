import express from "express";
import {
  fetchAllReviews,
  fetchReviewSummary,
  fetchMostReviewedProducts,
  createNewReview,
  updateReview,
  deleteReviewById,
} from "../controller/review.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/reviews", fetchAllReviews);
router.get("/reviews/summary", fetchReviewSummary);
router.get("/reviews/most-reviewed", fetchMostReviewedProducts);
router.post("/reviews", createNewReview);

// Protected routes
router.put("/reviews/:id", authenticate, updateReview);
router.delete("/reviews/:id", authenticate, deleteReviewById);

export default router;









