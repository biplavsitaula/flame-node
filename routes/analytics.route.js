import express from "express";
import {
  fetchAnalyticsSummary,
  fetchSalesTrend,
  fetchStockByCategory,
  fetchProductsByCategory,
  fetchRevenueByCategory,
} from "../controller/analytics.controller.js";
import { authenticate, checkAdminViewOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protected routes - View only (admin and super_admin)
router.get("/analytics/summary", authenticate, checkAdminViewOnly, fetchAnalyticsSummary);
router.get("/analytics/sales-trend", authenticate, checkAdminViewOnly, fetchSalesTrend);
router.get("/analytics/stock-by-category", authenticate, checkAdminViewOnly, fetchStockByCategory);
router.get("/analytics/products-by-category", authenticate, checkAdminViewOnly, fetchProductsByCategory);
router.get("/analytics/revenue-by-category", authenticate, checkAdminViewOnly, fetchRevenueByCategory);

export default router;






