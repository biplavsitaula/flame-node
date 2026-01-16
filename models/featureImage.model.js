import mongoose from "mongoose";

const FeatureImageSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    tag: {
      type: String,
      default: "",
      trim: true,
    },
    ctaLink: {
      type: String,
      required: [true, "CTA Link is required"],
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
FeatureImageSchema.index({ isActive: 1, order: 1 });
FeatureImageSchema.index({ createdAt: -1 });

export default mongoose.model("FeatureImage", FeatureImageSchema);

