import express from "express";
import { exportMonthlyData } from "../controller/export.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protected routes
router.get("/export/monthly", authenticate, exportMonthlyData);

export default router;









