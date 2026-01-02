import express from "express";
import {
  fetchOutOfStockProducts,
  fetchLowStockProducts,
  fetchAllStockAlerts,
  generateReorderReportData,
  reorderProductStock,
} from "../controller/stockAlerts.controller.js";
import { checkAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

// Admin routes only
router.get("/stock-alerts/out-of-stock", checkAdmin, fetchOutOfStockProducts);
router.get("/stock-alerts/low-stock", checkAdmin, fetchLowStockProducts);
router.get("/stock-alerts/all", checkAdmin, fetchAllStockAlerts);
router.get("/stock-alerts/reorder-report", checkAdmin, generateReorderReportData);
router.put("/stock-alerts/reorder/:id", checkAdmin, reorderProductStock);

export default router;









