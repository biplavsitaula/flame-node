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
        name: item.name || product.name,
        price,
        total: price * item.quantity,
      };
    })
  );

  // Calculate subtotal
  const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.total, 0);

  // Calculate delivery fee (free if subtotal >= 2000)
  const deliveryFee = orderData.deliveryFee !== undefined 
    ? orderData.deliveryFee 
    : (subtotal >= 2000 ? 0 : 500);

  // Calculate total amount
  const totalAmount = subtotal + deliveryFee;

  // Create order
  const order = new Order({
    ...orderData,
    items: itemsWithTotals,
    subtotal,
    deliveryFee,
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
    gateway: savedOrder.paymentGateway || null,
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

/**
 * Checkout - Create order from cart (public endpoint for customers)
 */
export const checkout = async (checkoutData) => {
  const {
    fullName,
    phoneNumber,
    deliveryAddress,
    paymentMethod, // "cod" or "online"
    paymentGateway, // "esewa", "khalti", "card" (required if online)
    items, // Array of { productId, quantity }
  } = checkoutData;

  // Validate required fields
  if (!fullName || !phoneNumber || !deliveryAddress) {
    throw new Error("Full name, phone number, and delivery address are required");
  }

  if (!items || items.length === 0) {
    throw new Error("Cart is empty");
  }

  if (!paymentMethod) {
    throw new Error("Payment method is required");
  }

  if (paymentMethod === "online" && !paymentGateway) {
    throw new Error("Payment gateway is required for online payment");
  }

  // Validate products and check stock
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new Error(`Product not found`);
    }
    if (product.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
      );
    }
  }

  // Build items with totals
  const itemsWithTotals = await Promise.all(
    items.map(async (item) => {
      const product = await Product.findById(item.productId);
      const price = product.finalPrice || product.price;
      return {
        productId: item.productId,
        name: product.name,
        quantity: item.quantity,
        price,
        total: price * item.quantity,
      };
    })
  );

  // Calculate subtotal
  const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.total, 0);

  // Calculate delivery fee (free if subtotal >= 2000)
  const deliveryFee = subtotal >= 2000 ? 0 : 500;

  // Calculate total amount
  const totalAmount = subtotal + deliveryFee;

  // Prepare order data
  const orderData = {
    customer: {
      fullName,
      mobile: phoneNumber,
      location: deliveryAddress,
    },
    items: itemsWithTotals,
    subtotal,
    deliveryFee,
    totalAmount,
    paymentMethod: paymentMethod === "cod" ? "COD" : "Online",
    paymentGateway: paymentMethod === "online" ? paymentGateway : null,
    paymentStatus: paymentMethod === "online" ? "completed" : "pending",
    status: "placed",
  };

  // Create order
  const order = new Order(orderData);
  const savedOrder = await order.save();

  // Update product stock and sales
  for (const item of itemsWithTotals) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: -item.quantity, totalSold: item.quantity },
    });
  }

  // Create payment record
  const payment = await Payment.create({
    orderId: savedOrder._id,
    billNumber: savedOrder.billNumber,
    customer: {
      fullName: savedOrder.customer.fullName,
      mobile: savedOrder.customer.mobile,
    },
    amount: savedOrder.totalAmount,
    method: savedOrder.paymentMethod,
    gateway: savedOrder.paymentGateway,
    status: savedOrder.paymentStatus,
    notes: paymentMethod === "online" 
      ? `Paid via ${paymentGateway}` 
      : "Cash on Delivery",
  });

  // Create notification for admin
  await Notification.create({
    type: "New Order",
    title: "New Order Received",
    message: `New order ${savedOrder.billNumber} from ${savedOrder.customer.fullName} - Rs. ${savedOrder.totalAmount.toLocaleString()}`,
    relatedId: savedOrder._id,
    relatedModel: "Order",
    priority: "high",
  });

  // Create payment notification
  await Notification.create({
    type: "New Payment",
    title: paymentMethod === "online" ? "Online Payment Received" : "COD Order Placed",
    message: `Payment of Rs. ${savedOrder.totalAmount.toLocaleString()} via ${savedOrder.paymentMethod}${savedOrder.paymentGateway ? ` (${savedOrder.paymentGateway})` : ""}`,
    relatedId: payment._id,
    relatedModel: "Payment",
    priority: paymentMethod === "online" ? "high" : "medium",
  });

  // Return populated order
  const populatedOrder = await Order.findById(savedOrder._id)
    .populate("items.productId", "name imageUrl")
    .lean();

  return {
    order: populatedOrder,
    payment: {
      _id: payment._id,
      billNumber: payment.billNumber,
      amount: payment.amount,
      method: payment.method,
      gateway: payment.gateway,
      status: payment.status,
    },
  };
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













