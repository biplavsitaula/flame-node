import Payment from "../models/payment.models.js";
import Order from "../models/order.models.js";
import Notification from "../models/notification.models.js";

export const getAllPayments = async (query = {}) => {
  const {
    search,
    method,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = query;

  const filter = {};

  // Search filter
  if (search) {
    filter.$or = [
      { billNumber: { $regex: search, $options: "i" } },
      { "customer.fullName": { $regex: search, $options: "i" } },
    ];
  }

  // Method filter
  if (method) {
    filter.method = method;
  }

  // Status filter
  if (status) {
    filter.status = status;
  }

  // Sort
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const payments = await Payment.find(filter)
    .populate("orderId", "billNumber customer items totalAmount")
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await Payment.countDocuments(filter);

  return {
    payments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

export const getPaymentById = async (id) => {
  return await Payment.findById(id)
    .populate("orderId", "billNumber customer items totalAmount")
    .lean();
};

export const getPaymentSummary = async () => {
  const [totalPayments, completedPayments, pendingPayments] = await Promise.all([
    Payment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]),
    Payment.aggregate([
      {
        $match: { status: "completed" },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]),
    Payment.aggregate([
      {
        $match: { status: "pending" },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]),
  ]);

  return {
    totalPayments: totalPayments[0]?.total || 0,
    completed: completedPayments[0]?.total || 0,
    pending: pendingPayments[0]?.total || 0,
  };
};

export const createPayment = async (paymentData) => {
  const payment = new Payment(paymentData);
  const savedPayment = await payment.save();

  // If payment is completed, update order payment status
  if (savedPayment.status === "completed" && savedPayment.orderId) {
    await Order.findByIdAndUpdate(savedPayment.orderId, {
      paymentStatus: "completed",
    });

    // Create notification
    await Notification.create({
      type: "New Payment",
      title: "Payment Received",
      message: `Payment of $${savedPayment.amount} received for order ${savedPayment.billNumber}`,
      relatedId: savedPayment._id,
      relatedModel: "Payment",
      priority: "medium",
    });
  }

  return await Payment.findById(savedPayment._id)
    .populate("orderId", "billNumber customer items totalAmount")
    .lean();
};

export const updatePaymentStatus = async (id, status) => {
  const validStatuses = ["pending", "completed"];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  const payment = await Payment.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  )
    .populate("orderId", "billNumber customer items totalAmount")
    .lean();

  if (!payment) return null;

  // If payment is completed, update order and create notification
  if (status === "completed" && payment.orderId) {
    await Order.findByIdAndUpdate(payment.orderId, {
      paymentStatus: "completed",
    });

    await Notification.create({
      type: "New Payment",
      title: "Payment Completed",
      message: `Payment of $${payment.amount} completed for order ${payment.billNumber}`,
      relatedId: payment._id,
      relatedModel: "Payment",
      priority: "medium",
    });
  }

  return payment;
};

export const deletePayment = async (id) => {
  return await Payment.findByIdAndDelete(id);
};









