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
      enum: ["placed", "in-progress", "delivered", "completed"],
      default: "placed",
      index: true,
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

// Pre-save middleware to generate bill number
OrderSchema.pre("save", async function (next) {
  // Only generate billNumber for new documents that don't have one
  if (this.isNew && !this.billNumber) {
    try {
      const currentYear = new Date().getFullYear();
      
      // Find the last order to get the highest bill number for this year
      const lastOrder = await this.constructor.findOne(
        { billNumber: { $regex: `^FB-${currentYear}-` } },
        {},
        { sort: { billNumber: -1 } }
      );
      
      let nextBillNumber = 1;
      
      if (lastOrder && lastOrder.billNumber) {
        // Extract the number from the last bill number (format: FB-YYYY-XXX)
        const lastBillParts = lastOrder.billNumber.split("-");
        if (lastBillParts.length === 3 && lastBillParts[2]) {
          const lastNumber = parseInt(lastBillParts[2]);
          if (!isNaN(lastNumber)) {
            nextBillNumber = lastNumber + 1;
          }
        }
      }
      
      this.billNumber = `FB-${currentYear}-${String(nextBillNumber).padStart(3, "0")}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Indexes
OrderSchema.index({ "customer.fullName": "text", "customer.location": "text", billNumber: "text" });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ totalAmount: -1 });

export default mongoose.model("Order", OrderSchema);














