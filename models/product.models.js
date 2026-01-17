import mongoose from "mongoose";

// Valid categories (lowercase)
const validCategories = [
  "whiskey",
  "vodka",
  "rum",
  "gin",
  "tequila",
  "cognac",
  "champagne",
  "wine",
  "beer",
  "brandy",
];

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
      index: true,
      set: (v) => (v ? v.toLowerCase() : v), // Convert to lowercase on set
      validate: {
        validator: function (v) {
          return validCategories.includes(v?.toLowerCase());
        },
        message: (props) =>
          `${props.value} is not a valid category. Valid categories: ${validCategories.join(", ")}`,
      },
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
      default: 0,
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
      default: "",
      trim: true,
    },
    tag: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    subCategory: {
      type: String,
      trim: true,
      index: true,
    },
    originType: {
      type: String,
      trim: true,
      index: true,
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
ProductSchema.pre("save", function () {
  // Always calculate finalPrice if price exists
  if (this.price !== undefined) {
    const discountPercent = this.discountPercent || 0;
    this.discountAmount = (this.price * discountPercent) / 100;
    this.finalPrice = this.price - this.discountAmount;
  }
});

// Pre-findOneAndUpdate middleware to handle category and calculate prices
ProductSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate();

  // Convert category to lowercase if present
  if (update.category) {
    update.category = update.category.toLowerCase();
  }

  // Calculate finalPrice if price or discountPercent is being updated
  if (update.price !== undefined || update.discountPercent !== undefined) {
    // Get existing document to fill in missing values
    const doc = await this.model.findOne(this.getQuery());
    const price = update.price !== undefined ? update.price : doc?.price || 0;
    const discountPercent =
      update.discountPercent !== undefined
        ? update.discountPercent
        : doc?.discountPercent || 0;

    update.discountAmount = (price * discountPercent) / 100;
    update.finalPrice = price - update.discountAmount;
  }
});

// Indexes for better query performance
ProductSchema.index({ name: "text", category: "text", brand: "text", subCategory: "text", originType: "text" });
ProductSchema.index({ totalSold: -1 });
ProductSchema.index({ reviewCount: -1 });
ProductSchema.index({ rating: -1 });
ProductSchema.index({ subCategory: 1 });
ProductSchema.index({ originType: 1 });

export default mongoose.model("Product", ProductSchema);
