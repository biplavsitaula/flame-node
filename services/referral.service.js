import crypto from "crypto";
import Referral from "../models/referral.model.js";
import ReferralReward from "../models/referralReward.model.js";
import User from "../models/user.models.js";
import Order from "../models/order.models.js";

/**
 * Generate a unique reward code (e.g., REF-A1B2C3D4)
 */
const generateRewardCode = () => {
    const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();
    return `REF-${randomPart}`;
};

/**
 * Claim referral reward for a user
 * - Validates eligibility (at least 1 completed referral with delivered order)
 * - Prevents duplicate claims via atomic update
 * - Creates a unique reward record (10% discount, 30-day expiry)
 */
export const claimReferralReward = async (userId, referralId = null) => {
    // Build the query to find a claimable referral
    const query = {
        referrerId: userId,
        status: { $in: ["pending", "completed"] },
        rewardClaimed: false,
    };

    // If a specific referralId is provided, validate it
    if (referralId) {
        query._id = referralId;
    }

    // Find the referral
    const referral = await Referral.findOne(query);
    if (!referral) {
        throw new Error("Not eligible. No valid referral found or reward already claimed.");
    }

    // Validate: referred user must have at least one delivered order
    const referredUser = await User.findById(referral.referredUserId);
    if (!referredUser) {
        throw new Error("Referred user not found.");
    }

    const deliveredOrder = await Order.findOne({
        "customer.email": referredUser.email,
        status: "delivered",
    });

    if (!deliveredOrder) {
        throw new Error("Not eligible. Referred user has not completed a delivered order yet.");
    }

    // Atomic update: mark rewardClaimed = true ONLY if it's still false
    // This prevents race conditions / double claims
    const updatedReferral = await Referral.findOneAndUpdate(
        {
            _id: referral._id,
            rewardClaimed: false, // Atomic check
        },
        {
            $set: { 
                rewardClaimed: true,
                status: "completed",
                completedAt: new Date()
            },
        },
        { new: true }
    );

    if (!updatedReferral) {
        throw new Error("Reward already claimed. Duplicate claim prevented.");
    }

    // Generate the reward
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30-day expiry

    let rewardCode = generateRewardCode();

    // Ensure reward code uniqueness (retry if collision)
    let attempts = 0;
    while (attempts < 5) {
        const existing = await ReferralReward.findOne({ rewardCode });
        if (!existing) break;
        rewardCode = generateRewardCode();
        attempts++;
    }

    const reward = new ReferralReward({
        userId,
        referralId: referral._id,
        rewardCode,
        type: "percentage",
        value: 10,
        status: "active",
        expiresAt,
        appliesTo: "next_purchase_only",
    });

    await reward.save();

    return {
        type: reward.type,
        value: reward.value,
        rewardCode: reward.rewardCode,
        expiresAt: reward.expiresAt,
        appliesTo: reward.appliesTo,
        status: reward.status,
    };
};

/**
 * Get all referrals made by a user
 */
export const getUserReferrals = async (userId) => {
    const referrals = await Referral.find({ referrerId: userId })
        .populate("referredUserId", "fullName email")
        .sort({ createdAt: -1 })
        .lean();

    return referrals;
};

/**
 * Get all referral rewards for a user
 */
export const getUserRewards = async (userId) => {
    const rewards = await ReferralReward.find({ userId })
        .populate("referralId")
        .sort({ createdAt: -1 })
        .lean();

    return rewards;
};
