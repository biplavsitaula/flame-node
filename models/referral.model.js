import mongoose from "mongoose";

const ReferralSchema = new mongoose.Schema(
    {
        referrerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Referrer user ID is required"],
            index: true,
        },
        referredUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Referred user ID is required"],
            index: true,
        },
        referredEmail: {
            type: String,
            required: [true, "Referred email is required"],
            trim: true,
            lowercase: true,
        },
        status: {
            type: String,
            enum: ["pending", "completed", "expired"],
            default: "pending",
            index: true,
        },
        rewardClaimed: {
            type: Boolean,
            default: false,
            index: true,
        },
        completedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to quickly find claimable referrals
ReferralSchema.index({ referrerId: 1, status: 1, rewardClaimed: 1 });
// Prevent duplicate referrals for the same pair
ReferralSchema.index({ referrerId: 1, referredUserId: 1 }, { unique: true });

export default mongoose.model("Referral", ReferralSchema);
