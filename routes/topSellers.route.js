import express from "express";
import {
  fetchTopSellingProducts,
  fetchSalesInsights,
} from "../controller/topSellers.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protected routes
router.get("/top-sellers/products", authenticate, fetchTopSellingProducts);
router.get("/top-sellers/insights", authenticate, fetchSalesInsights);

export default router;










