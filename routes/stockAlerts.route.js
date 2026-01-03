import express from "express";
import {
  fetchOutOfStockProducts,
  fetchLowStockProducts,
  fetchAllStockAlerts,
  generateReorderReportData,
  reorderProductStock,
} from "../controller/stockAlerts.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protected routes
router.get("/stock-alerts/out-of-stock", authenticate, fetchOutOfStockProducts);
router.get("/stock-alerts/low-stock", authenticate, fetchLowStockProducts);
router.get("/stock-alerts/all", authenticate, fetchAllStockAlerts);
router.get("/stock-alerts/reorder-report", authenticate, generateReorderReportData);
router.put("/stock-alerts/reorder/:id", authenticate, reorderProductStock);

export default router;










