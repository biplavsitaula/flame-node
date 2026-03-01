import {
    getDashboardByUserId,
    updateDashboard,
    addFavoriteProduct,
    removeFavoriteProduct,
    addLoyaltyPoints,
    redeemLoyaltyPoints,
    getRecentOrders,
    getDashboardSummary,
} from "../services/customerDashboard.service.js";

/**
 * GET /customer/dashboard
 * Get full customer dashboard with loyalty points, favorites, recent orders, etc.
 */
export const fetchDashboard = async (req, res) => {
    try {
        const userId = req.user.userId;
        const dashboard = await getDashboardByUserId(userId);
        res.status(200).json({
            success: true,
            message: "Dashboard fetched successfully",
            data: dashboard,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error fetching dashboard",
        });
    }
};

/**
 * GET /customer/dashboard/summary
 * Get aggregated dashboard summary
 */
export const fetchDashboardSummary = async (req, res) => {
    try {
        const userId = req.user.userId;
        const summary = await getDashboardSummary(userId);
        res.status(200).json({
            success: true,
            message: "Dashboard summary fetched successfully",
            data: summary,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error fetching dashboard summary",
        });
    }
};

/**
 * PUT /customer/dashboard
 * Update customer profile, preferences, addresses
 */
export const updateCustomerDashboard = async (req, res) => {
    try {
        const userId = req.user.userId;
        const updatedDashboard = await updateDashboard(userId, req.body);
        res.status(200).json({
            success: true,
            message: "Dashboard updated successfully",
            data: updatedDashboard,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Error updating dashboard",
        });
    }
};

/**
 * POST /customer/favorites/:productId
 * Add a product to favorites
 */
export const addToFavorites = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.params;
        const dashboard = await addFavoriteProduct(userId, productId);
        res.status(200).json({
            success: true,
            message: "Product added to favorites",
            data: dashboard,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Error adding to favorites",
        });
    }
};

/**
 * DELETE /customer/favorites/:productId
 * Remove a product from favorites
 */
export const removeFromFavorites = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.params;
        const dashboard = await removeFavoriteProduct(userId, productId);
        res.status(200).json({
            success: true,
            message: "Product removed from favorites",
            data: dashboard,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Error removing from favorites",
        });
    }
};

/**
 * POST /customer/loyalty/add
 * Add loyalty points (admin use or system-triggered)
 */
export const addPoints = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { points, reason } = req.body;
        if (!points || points <= 0) {
            return res.status(400).json({
                success: false,
                message: "Points must be a positive number",
            });
        }
        const dashboard = await addLoyaltyPoints(userId, points, reason);
        res.status(200).json({
            success: true,
            message: `${points} loyalty points added successfully`,
            data: dashboard,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Error adding loyalty points",
        });
    }
};

/**
 * POST /customer/loyalty/redeem
 * Redeem loyalty points
 */
export const redeemPoints = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { points } = req.body;
        if (!points || points <= 0) {
            return res.status(400).json({
                success: false,
                message: "Points must be a positive number",
            });
        }
        const dashboard = await redeemLoyaltyPoints(userId, points);
        res.status(200).json({
            success: true,
            message: `${points} loyalty points redeemed successfully`,
            data: dashboard,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Error redeeming loyalty points",
        });
    }
};

/**
 * GET /customer/orders
 * Get recent orders for the authenticated user
 */
export const fetchRecentOrders = async (req, res) => {
    try {
        const userId = req.user.userId;
        const limit = req.query.limit || 10;
        const orders = await getRecentOrders(userId, limit);
        res.status(200).json({
            success: true,
            message: "Recent orders fetched successfully",
            data: orders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error fetching recent orders",
        });
    }
};
