import Order from "../models/order.models.js";
import Product from "../models/product.models.js";
import Payment from "../models/payment.models.js";
import Notification from "../models/notification.models.js";

export const getAllOrders = async (query = {}) => {
  const {
    search,
    status,
    paymentMethod,
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
      { "customer.location": { $regex: search, $options: "i" } },
    ];
  }

  // Status filter
  if (status) {
    filter.status = status;
  }

  // Payment method filter
  if (paymentMethod) {
    filter.paymentMethod = paymentMethod;
  }

  // Sort
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const orders = await Order.find(filter)
    .populate("items.productId", "name imageUrl")
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await Order.countDocuments(filter);

  return {
    orders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

export const getOrderById = async (id) => {
  return await Order.findById(id)
    .populate("items.productId", "name imageUrl category price")
    .lean();
};

export const getOrderByBillNumber = async (billNumber) => {
  return await Order.findOne({ billNumber })
    .populate("items.productId", "name imageUrl category price")
    .lean();
};

export const createOrder = async (orderData) => {
  // Validate products and check stock
  for (const item of orderData.items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }
    if (product.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
      );
    }
  }

  // Calculate item totals
  const itemsWithTotals = await Promise.all(
    orderData.items.map(async (item) => {
      const product = await Product.findById(item.productId);
      const price = product.finalPrice || product.price;
      return {
        ...item,
        price,
        total: price * item.quantity,
      };
    })
  );

  // Calculate total amount
  const totalAmount = itemsWithTotals.reduce(
    (sum, item) => sum + item.total,
    0
  );

  // Create order
  const order = new Order({
    ...orderData,
    items: itemsWithTotals,
    totalAmount,
  });

  const savedOrder = await order.save();

  // Update product stock and sales
  for (const item of itemsWithTotals) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: -item.quantity, totalSold: item.quantity },
    });
  }

  // Create payment record
  await Payment.create({
    orderId: savedOrder._id,
    billNumber: savedOrder.billNumber,
    customer: {
      fullName: savedOrder.customer.fullName,
      mobile: savedOrder.customer.mobile,
    },
    amount: savedOrder.totalAmount,
    method: savedOrder.paymentMethod,
    status: savedOrder.paymentMethod === "COD" ? "pending" : "completed",
  });

  // Create notification
  await Notification.create({
    type: "New Order",
    title: "New Order Received",
    message: `New order ${savedOrder.billNumber} from ${savedOrder.customer.fullName}`,
    relatedId: savedOrder._id,
    relatedModel: "Order",
    priority: "high",
  });

  return await Order.findById(savedOrder._id)
    .populate("items.productId", "name imageUrl")
    .lean();
};

export const updateOrderStatus = async (id, status) => {
  const validStatuses = ["placed", "in-progress", "delivered", "completed"];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  const order = await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  )
    .populate("items.productId", "name imageUrl")
    .lean();

  if (!order) return null;

  // If order is completed, update payment status
  if (status === "completed") {
    await Payment.findOneAndUpdate(
      { orderId: id },
      { status: "completed" },
      { new: true }
    );
  }

  return order;
};

export const deleteOrder = async (id) => {
  return await Order.findByIdAndDelete(id);
};












