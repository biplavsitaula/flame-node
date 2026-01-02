import express from "express";
import {
  fetchAllReviews,
  fetchReviewSummary,
  fetchMostReviewedProducts,
  createNewReview,
  updateReview,
  deleteReviewById,
} from "../controller/review.controller.js";
import { checkAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

// Public routes
router.get("/reviews", fetchAllReviews);
router.get("/reviews/summary", fetchReviewSummary);
router.get("/reviews/most-reviewed", fetchMostReviewedProducts);
router.post("/reviews", createNewReview);

// Admin routes
router.put("/reviews/:id", checkAdmin, updateReview);
router.delete("/reviews/:id", checkAdmin, deleteReviewById);

export default router;









