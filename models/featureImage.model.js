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
      required: false,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    tag: {
      type: String,
      default: "",
      trim: true,
    },
    ctaLink: {
      type: String,
      required: false,
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


