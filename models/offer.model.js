import mongoose from "mongoose";

const OfferSchema = new mongoose.Schema(
  {
    icon: {
      type: String,
      trim: true,
      default: "",
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    color: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
OfferSchema.index({ isActive: 1, order: 1 });
OfferSchema.index({ createdAt: -1 });

export default mongoose.model("Offer", OfferSchema);

