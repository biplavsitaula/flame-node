import mongoose from "mongoose";

const OfferSchema = new mongoose.Schema(
  {
    icon: {
      type: String,
      required: [true, "Icon is required"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    color: {
      type: String,
      required: [true, "Color is required"],
      trim: true,
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

