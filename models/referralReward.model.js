import mongoose from "mongoose";

const ReferralRewardSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            index: true,
        },
        referralId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Referral",
            required: [true, "Referral ID is required"],
            unique: true, // One reward per referral — prevents duplicate claims
        },
        rewardCode: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ["percentage", "fixed"],
            default: "percentage",
        },
        value: {
            type: Number,
            required: true,
            default: 10,
            min: 0,
        },
        status: {
            type: String,
            enum: ["active", "used", "expired"],
            default: "active",
            index: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        appliesTo: {
            type: String,
            default: "next_purchase_only",
        },
        usedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Index for finding active rewards for a user
ReferralRewardSchema.index({ userId: 1, status: 1 });

export default mongoose.model("ReferralReward", ReferralRewardSchema);
