import express from "express";
import {
  fetchTopSellingProducts,
  fetchSalesInsights,
} from "../controller/topSellers.controller.js";
import { authenticate, checkAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin routes only
router.get("/top-sellers/products", authenticate, checkAdmin, fetchTopSellingProducts);
router.get("/top-sellers/insights", authenticate, checkAdmin, fetchSalesInsights);

export default router;










