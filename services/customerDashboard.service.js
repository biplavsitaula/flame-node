import CustomerDashboard from "../models/customerDashboard.model.js";
import User from "../models/user.models.js";
import Order from "../models/order.models.js";
import Product from "../models/product.models.js";

/**
 * Get or create a customer dashboard for the given user
 */
export const getDashboardByUserId = async (userId) => {
    // Get user info
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    // Find or create dashboard
    let dashboard = await CustomerDashboard.findOne({ userId })
        .populate(
            "favoriteProducts",
            "name imageUrl price finalPrice category rating reviewCount brand"
        )
        .populate("userId", "fullName email mobile role createdAt")
        .lean();

    if (!dashboard) {
        const newDashboard = new CustomerDashboard({ userId });
        await newDashboard.save();
        dashboard = await CustomerDashboard.findOne({ userId })
            .populate(
                "favoriteProducts",
                "name imageUrl price finalPrice category rating reviewCount brand"
            )
            .populate("userId", "fullName email mobile role createdAt")
            .lean();
    }

    // Get recent orders for this user (by email match)
    const recentOrders = await Order.find({
        "customer.email": user.email,
    })
        .populate("items.productId", "name imageUrl category price finalPrice")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

    // Calculate order stats from actual orders
    const allOrders = await Order.find({ "customer.email": user.email }).lean();
    const totalOrders = allOrders.length;
    const totalSpent = allOrders.reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0
    );

    return {
        ...dashboard,
        recentOrders,
        stats: {
            totalOrders,
            totalSpent: Math.round(totalSpent * 100) / 100,
            loyaltyPoints: dashboard.loyaltyPoints,
            membershipTier: dashboard.membershipTier,
            tierProgress: dashboard.tierProgress,
        },
    };
};

/**
 * Update customer dashboard (profile, preferences, addresses)
 */
export const updateDashboard = async (userId, updateData) => {
    const allowedFields = [
        "dateOfBirth",
        "preferences",
        "addresses",
    ];

    const updatePayload = {};
    for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
            updatePayload[field] = updateData[field];
        }
    }

    // Find or create dashboard first
    let dashboard = await CustomerDashboard.findOne({ userId });
    if (!dashboard) {
        dashboard = new CustomerDashboard({ userId, ...updatePayload });
        await dashboard.save();
    } else {
        await CustomerDashboard.findOneAndUpdate(
            { userId },
            { $set: updatePayload },
            { new: true, runValidators: true }
        );
    }

    return await CustomerDashboard.findOne({ userId })
        .populate(
            "favoriteProducts",
            "name imageUrl price finalPrice category rating reviewCount brand"
        )
        .populate("userId", "fullName email mobile role createdAt")
        .lean();
};

/**
 * Add a product to favorites
 */
export const addFavoriteProduct = async (userId, productId) => {
    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
        throw new Error("Product not found");
    }

    // Find or create dashboard
    let dashboard = await CustomerDashboard.findOne({ userId });
    if (!dashboard) {
        dashboard = new CustomerDashboard({ userId });
        await dashboard.save();
    }

    // Check if already in favorites
    if (dashboard.favoriteProducts.includes(productId)) {
        throw new Error("Product is already in favorites");
    }

    await CustomerDashboard.findOneAndUpdate(
        { userId },
        { $addToSet: { favoriteProducts: productId } },
        { new: true }
    );

    return await CustomerDashboard.findOne({ userId })
        .populate(
            "favoriteProducts",
            "name imageUrl price finalPrice category rating reviewCount brand"
        )
        .lean();
};

/**
 * Remove a product from favorites
 */
export const removeFavoriteProduct = async (userId, productId) => {
    let dashboard = await CustomerDashboard.findOne({ userId });
    if (!dashboard) {
        throw new Error("Dashboard not found");
    }

    await CustomerDashboard.findOneAndUpdate(
        { userId },
        { $pull: { favoriteProducts: productId } },
        { new: true }
    );

    return await CustomerDashboard.findOne({ userId })
        .populate(
            "favoriteProducts",
            "name imageUrl price finalPrice category rating reviewCount brand"
        )
        .lean();
};

/**
 * Add loyalty points to a user
 */
export const addLoyaltyPoints = async (userId, points, reason = "") => {
    if (points <= 0) {
        throw new Error("Points must be a positive number");
    }

    let dashboard = await CustomerDashboard.findOne({ userId });
    if (!dashboard) {
        dashboard = new CustomerDashboard({ userId });
        await dashboard.save();
    }

    const updatedDashboard = await CustomerDashboard.findOneAndUpdate(
        { userId },
        {
            $inc: {
                loyaltyPoints: points,
                totalPointsEarned: points,
            },
        },
        { new: true }
    );

    // Update membership tier based on total points earned
    const totalEarned = updatedDashboard.totalPointsEarned;
    let newTier = "Bronze";
    let tierProgress = 0;

    if (totalEarned >= 10000) {
        newTier = "Platinum";
        tierProgress = 100;
    } else if (totalEarned >= 5000) {
        newTier = "Gold";
        tierProgress = Math.round(((totalEarned - 5000) / 5000) * 100);
    } else if (totalEarned >= 2000) {
        newTier = "Silver";
        tierProgress = Math.round(((totalEarned - 2000) / 3000) * 100);
    } else {
        newTier = "Bronze";
        tierProgress = Math.round((totalEarned / 2000) * 100);
    }

    await CustomerDashboard.findOneAndUpdate(
        { userId },
        { membershipTier: newTier, tierProgress: Math.min(tierProgress, 100) }
    );

    return await CustomerDashboard.findOne({ userId })
        .populate("userId", "fullName email mobile")
        .lean();
};

/**
 * Redeem loyalty points
 */
export const redeemLoyaltyPoints = async (userId, points) => {
    if (points <= 0) {
        throw new Error("Points must be a positive number");
    }

    const dashboard = await CustomerDashboard.findOne({ userId });
    if (!dashboard) {
        throw new Error("Dashboard not found");
    }

    if (dashboard.loyaltyPoints < points) {
        throw new Error(
            `Insufficient loyalty points. Available: ${dashboard.loyaltyPoints}, Requested: ${points}`
        );
    }

    await CustomerDashboard.findOneAndUpdate(
        { userId },
        {
            $inc: {
                loyaltyPoints: -points,
                totalPointsRedeemed: points,
            },
        },
        { new: true }
    );

    return await CustomerDashboard.findOne({ userId })
        .populate("userId", "fullName email mobile")
        .lean();
};

/**
 * Get recent orders for a user (matched by email)
 */
export const getRecentOrders = async (userId, limit = 10) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    const orders = await Order.find({
        "customer.email": user.email,
    })
        .populate("items.productId", "name imageUrl category price finalPrice")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .lean();

    return orders;
};

/**
 * Get dashboard summary (aggregated stats)
 */
export const getDashboardSummary = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    let dashboard = await CustomerDashboard.findOne({ userId }).lean();
    if (!dashboard) {
        const newDashboard = new CustomerDashboard({ userId });
        await newDashboard.save();
        dashboard = await CustomerDashboard.findOne({ userId }).lean();
    }

    // Aggregate order data
    const orders = await Order.find({ "customer.email": user.email }).lean();
    const totalOrders = orders.length;
    const totalSpent = orders.reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0
    );
    const completedOrders = orders.filter(
        (o) => o.status === "completed" || o.status === "delivered"
    ).length;
    const pendingOrders = orders.filter((o) => o.status === "pending").length;

    return {
        user: {
            fullName: user.fullName,
            email: user.email,
            mobile: user.mobile,
            memberSince: user.createdAt,
        },
        loyalty: {
            currentPoints: dashboard.loyaltyPoints,
            totalEarned: dashboard.totalPointsEarned,
            totalRedeemed: dashboard.totalPointsRedeemed,
            membershipTier: dashboard.membershipTier,
            tierProgress: dashboard.tierProgress,
        },
        orders: {
            total: totalOrders,
            completed: completedOrders,
            pending: pendingOrders,
            totalSpent: Math.round(totalSpent * 100) / 100,
        },
        favorites: dashboard.favoriteProducts?.length || 0,
        addresses: dashboard.addresses?.length || 0,
    };
};
