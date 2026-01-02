import express from "express";
import {
  fetchTopSellingProducts,
  fetchSalesInsights,
} from "../controller/topSellers.controller.js";
import { checkAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

// Admin routes only
router.get("/top-sellers/products", checkAdmin, fetchTopSellingProducts);
router.get("/top-sellers/insights", checkAdmin, fetchSalesInsights);

export default router;









