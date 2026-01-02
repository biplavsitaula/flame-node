import express from "express";
import {
  fetchAnalyticsSummary,
  fetchSalesTrend,
  fetchStockByCategory,
  fetchProductsByCategory,
  fetchRevenueByCategory,
} from "../controller/analytics.controller.js";
import { checkAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

// Admin routes only
router.get("/analytics/summary", checkAdmin, fetchAnalyticsSummary);
router.get("/analytics/sales-trend", checkAdmin, fetchSalesTrend);
router.get("/analytics/stock-by-category", checkAdmin, fetchStockByCategory);
router.get("/analytics/products-by-category", checkAdmin, fetchProductsByCategory);
router.get("/analytics/revenue-by-category", checkAdmin, fetchRevenueByCategory);

export default router;









