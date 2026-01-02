import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
});

const OrderSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      fullName: {
        type: String,
        required: [true, "Customer name is required"],
        trim: true,
      },
      mobile: {
        type: String,
        required: [true, "Mobile number is required"],
        trim: true,
      },
      panNumber: {
        type: String,
        trim: true,
      },
      location: {
        type: String,
        required: [true, "Location is required"],
        trim: true,
      },
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must have at least one item",
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["placed", "in-progress", "delivered", "completed"],
      default: "placed",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["QR Payment", "COD"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate bill number
OrderSchema.pre("save", async function (next) {
  if (!this.billNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model("Order").countDocuments();
    this.billNumber = `FB-${year}-${String(count + 1).padStart(3, "0")}`;
  }
  next();
});

// Indexes
OrderSchema.index({ "customer.fullName": "text", "customer.location": "text", billNumber: "text" });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ totalAmount: -1 });

export default mongoose.model("Order", OrderSchema);









