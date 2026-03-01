import express from "express";
import {
    fetchDashboard,
    fetchDashboardSummary,
    updateCustomerDashboard,
    addToFavorites,
    removeFromFavorites,
    addPoints,
    redeemPoints,
    fetchRecentOrders,
} from "../controller/customerDashboard.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
// GET /api/customer/dashboard - Get full dashboard
router.get("/customer/dashboard", authenticate, fetchDashboard);

// GET /api/customer/dashboard/summary - Get aggregated summary
router.get("/customer/dashboard/summary", authenticate, fetchDashboardSummary);

// PUT /api/customer/dashboard - Update profile/preferences/addresses
router.put("/customer/dashboard", authenticate, updateCustomerDashboard);

// POST /api/customer/favorites/:productId - Add product to favorites
router.post("/customer/favorites/:productId", authenticate, addToFavorites);

// DELETE /api/customer/favorites/:productId - Remove product from favorites
router.delete("/customer/favorites/:productId", authenticate, removeFromFavorites);

// POST /api/customer/loyalty/add - Add loyalty points
router.post("/customer/loyalty/add", authenticate, addPoints);

// POST /api/customer/loyalty/redeem - Redeem loyalty points
router.post("/customer/loyalty/redeem", authenticate, redeemPoints);

// GET /api/customer/orders - Get recent orders
router.get("/customer/orders", authenticate, fetchRecentOrders);

export default router;
