import express from "express";
import {
    claimReward,
    getReferrals,
    getRewards,
    sendReferralInvite,
} from "../controller/referral.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication

// POST /api/customer/referral/claim - Claim referral reward
router.post("/customer/referral/claim", authenticate, claimReward);

// GET /api/customer/referrals - Get all referrals
router.get("/customer/referrals", authenticate, getReferrals);

// GET /api/customer/referral/rewards - Get all referral rewards
router.get("/customer/referral/rewards", authenticate, getRewards);

// POST /api/customer/referral/invite - Send referral invitation
router.post("/customer/referral/invite", authenticate, sendReferralInvite);

export default router;
