import express from "express";
import { exportMonthlyData } from "../controller/export.controller.js";
import { checkAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

// Admin routes only
router.get("/export/monthly", checkAdmin, exportMonthlyData);

export default router;









