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
      unique: true,
      index: true,
      trim: true,
    },
    customer: {
      fullName: {
        type: String,
        required: [true, "Customer name is required"],
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
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
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "placed", "accepted", "rejected", "in-progress", "delivered", "completed"],
      default: "pending",
      index: true,
    },
    acceptedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "Online"],
      required: true,
    },
    paymentGateway: {
      type: String,
      enum: ["esewa", "khalti", "card", null],
      default: null,
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

// Note: billNumber is generated in the service layer (order.service.js)
// No pre-save hook needed to avoid "next is not a function" errors

// Indexes
OrderSchema.index({ "customer.fullName": "text", "customer.email": "text", "customer.location": "text", billNumber: "text" });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ totalAmount: -1 });

export default mongoose.model("Order", OrderSchema);










