import express from "express";
import {
  fetchAnalyticsSummary,
  fetchSalesTrend,
  fetchStockByCategory,
  fetchProductsByCategory,
  fetchRevenueByCategory,
} from "../controller/analytics.controller.js";
import { authenticate, checkAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin routes only
router.get("/analytics/summary", authenticate, checkAdmin, fetchAnalyticsSummary);
router.get("/analytics/sales-trend", authenticate, checkAdmin, fetchSalesTrend);
router.get("/analytics/stock-by-category", authenticate, checkAdmin, fetchStockByCategory);
router.get("/analytics/products-by-category", authenticate, checkAdmin, fetchProductsByCategory);
router.get("/analytics/revenue-by-category", authenticate, checkAdmin, fetchRevenueByCategory);

export default router;










