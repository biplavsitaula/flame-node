import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Whiskey",
        "Vodka",
        "Rum",
        "Gin",
        "Tequila",
        "Cognac",
        "Champagne",
        "Wine",
        "Beer",
        "Brandy",
      ],
      index: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"],
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"],
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalPrice: {
      type: Number,
      required: true,
      min: [0, "Final price must be positive"],
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      default: 0,
      min: [0, "Stock cannot be negative"],
      index: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"],
    },
    alcoholPercentage: {
      type: Number,
      min: [0, "Alcohol percentage cannot be negative"],
      max: [100, "Alcohol percentage cannot exceed 100%"],
    },
    volume: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },
    isRecommended: {
      type: Boolean,
      default: false,
      index: true,
    },
    totalSold: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for stock status
ProductSchema.virtual("status").get(function () {
  if (this.stock === 0) return "Out of Stock";
  if (this.stock < 10) return "Low Stock";
  return "In Stock";
});

// Pre-save middleware to calculate discount and final price
ProductSchema.pre("save", function (next) {
  if (this.isModified("price") || this.isModified("discountPercent")) {
    this.discountAmount = (this.price * this.discountPercent) / 100;
    this.finalPrice = this.price - this.discountAmount;
  }
  next();
});

// Indexes for better query performance
ProductSchema.index({ name: "text", category: "text", brand: "text" });
ProductSchema.index({ totalSold: -1 });
ProductSchema.index({ reviewCount: -1 });
ProductSchema.index({ rating: -1 });

export default mongoose.model("Product", ProductSchema);
