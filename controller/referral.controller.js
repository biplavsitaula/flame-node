import {
    claimReferralReward,
    getUserReferrals,
    getUserRewards,
} from "../services/referral.service.js";
import { sendReferralInvitationEmail } from "../services/email.service.js";
import User from "../models/user.models.js";

/**
 * POST /customer/referral/claim
 * Claim a referral reward (10% discount)
 */
export const claimReward = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { referralId } = req.body; // Optional

        const reward = await claimReferralReward(userId, referralId);

        res.status(200).json({
            success: true,
            message: "Reward claimed successfully",
            reward,
        });
    } catch (error) {
        // Determine appropriate status code based on the error
        const isNotEligible = error.message.includes("Not eligible");
        const isAlreadyClaimed = error.message.includes("already claimed");
        const statusCode = isNotEligible || isAlreadyClaimed ? 400 : 500;

        res.status(statusCode).json({
            success: false,
            message: error.message || "Error claiming referral reward",
        });
    }
};

/**
 * GET /customer/referrals
 * Get all referrals for the authenticated user
 */
export const getReferrals = async (req, res) => {
    try {
        const userId = req.user.userId;
        const referrals = await getUserReferrals(userId);

        res.status(200).json({
            success: true,
            message: "Referrals fetched successfully",
            data: referrals,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error fetching referrals",
        });
    }
};

/**
 * GET /customer/referral/rewards
 * Get all referral rewards for the authenticated user
 */
export const getRewards = async (req, res) => {
    try {
        const userId = req.user.userId;
        const rewards = await getUserRewards(userId);

        res.status(200).json({
            success: true,
            message: "Rewards fetched successfully",
            data: rewards,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error fetching rewards",
        });
    }
};

/**
 * POST /customer/referral/invite
 * Send a referral invitation to a friend
 */
export const sendReferralInvite = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { friendName, friendEmail, friendPhone, referralCode } = req.body;

        if (!friendEmail || !friendName) {
            return res.status(400).json({ 
                success: false, 
                message: "Friend's name and email are required" 
            });
        }

        const referrer = await User.findById(userId);
        if (!referrer) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Send invitation email
        const codeToUse = referralCode || "SPIRITS2026"; // Fallback to default if not provided
        await sendReferralInvitationEmail(friendEmail, friendName, referrer.fullName, codeToUse);

        res.status(200).json({
            success: true,
            message: "Invitation sent successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error sending invitation",
        });
    }
};
