import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    billNumber: {
      type: String,
      required: true,
      index: true,
    },
    customer: {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },
      mobile: {
        type: String,
        trim: true,
      },
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be positive"],
    },
    method: {
      type: String,
      enum: ["QR Payment", "COD"],
      required: [true, "Payment method is required"],
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
      index: true,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ status: 1, method: 1 });

export default mongoose.model("Payment", PaymentSchema);












