import express from "express";
import {
  fetchOutOfStockProducts,
  fetchLowStockProducts,
  fetchAllStockAlerts,
  generateReorderReportData,
  reorderProductStock,
} from "../controller/stockAlerts.controller.js";
import { authenticate, checkAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin routes only
router.get("/stock-alerts/out-of-stock", authenticate, checkAdmin, fetchOutOfStockProducts);
router.get("/stock-alerts/low-stock", authenticate, checkAdmin, fetchLowStockProducts);
router.get("/stock-alerts/all", authenticate, checkAdmin, fetchAllStockAlerts);
router.get("/stock-alerts/reorder-report", authenticate, checkAdmin, generateReorderReportData);
router.put("/stock-alerts/reorder/:id", authenticate, checkAdmin, reorderProductStock);

export default router;










