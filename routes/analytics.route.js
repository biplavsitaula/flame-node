import express from "express";
import {
  fetchAnalyticsSummary,
  fetchSalesTrend,
  fetchStockByCategory,
  fetchProductsByCategory,
  fetchRevenueByCategory,
} from "../controller/analytics.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protected routes
router.get("/analytics/summary", authenticate, fetchAnalyticsSummary);
router.get("/analytics/sales-trend", authenticate, fetchSalesTrend);
router.get("/analytics/stock-by-category", authenticate, fetchStockByCategory);
router.get("/analytics/products-by-category", authenticate, fetchProductsByCategory);
router.get("/analytics/revenue-by-category", authenticate, fetchRevenueByCategory);

export default router;









