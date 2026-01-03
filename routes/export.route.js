import express from "express";
import { exportMonthlyData } from "../controller/export.controller.js";
import { authenticate, checkAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin routes only
router.get("/export/monthly", authenticate, checkAdmin, exportMonthlyData);

export default router;










