import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
    label: {
        type: String,
        trim: true,
        default: "Home",
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    city: {
        type: String,
        trim: true,
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
});

const CustomerDashboardSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            unique: true,
            index: true,
        },
        loyaltyPoints: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalPointsEarned: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalPointsRedeemed: {
            type: Number,
            default: 0,
            min: 0,
        },
        membershipTier: {
            type: String,
            enum: ["Bronze", "Silver", "Gold", "Platinum"],
            default: "Bronze",
        },
        tierProgress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        totalOrders: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalSpent: {
            type: Number,
            default: 0,
            min: 0,
        },
        favoriteProducts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
        addresses: {
            type: [AddressSchema],
            default: [],
        },
        dateOfBirth: {
            type: Date,
        },
        preferences: {
            emailNotifications: {
                type: Boolean,
                default: true,
            },
            smsNotifications: {
                type: Boolean,
                default: false,
            },
            orderUpdates: {
                type: Boolean,
                default: true,
            },
            promotionalOffers: {
                type: Boolean,
                default: true,
            },
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
CustomerDashboardSchema.index({ loyaltyPoints: -1 });
CustomerDashboardSchema.index({ membershipTier: 1 });

export default mongoose.model("CustomerDashboard", CustomerDashboardSchema);
